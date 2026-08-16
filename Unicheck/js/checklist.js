(function () {
    const CHECKLIST_PROGRESS_TABLE = "user_checklist_item_progress";
    const PROGRESS_STORAGE_PREFIX = "unicheck_checklist_progress_v2";
    const PENDING_STORAGE_PREFIX = "unicheck_checklist_pending_sync_v1";
    const REQUEST_TIMEOUT_MS = 30000;

    // Conexão com o cliente Supabase configurado globalmente
    function getClient() {
        const client = window.UniCheckSupabase?.client;
        if (!client) {
            throw new Error("Supabase não configurado. Verifique js/config.js.");
        }
        return client;
    }

    function logSupabaseError(context, error, extra = {}) {
        console.error(`[UniCheckChecklist] ${context}`, {
            message: error?.message || String(error),
            code: error?.code || null,
            details: error?.details || null,
            hint: error?.hint || null,
            ...extra
        });
    }

    async function withTimeout(query, context) {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            return await query.abortSignal(controller.signal);
        } catch (error) {
            if (controller.signal.aborted) {
                throw new Error(`${context} excedeu ${REQUEST_TIMEOUT_MS / 1000} segundos.`);
            }
            throw error;
        } finally {
            window.clearTimeout(timeoutId);
        }
    }

    function normalizeProgressRows(rows) {
        return (rows || []).reduce((accumulator, row) => {
            const checklistId = row.checklist_id;
            const itemId = row.checklist_item_id || row.item_id;
            const completed = row.completed ?? row.concluido;

            if (!checklistId || !itemId) {
                return accumulator;
            }

            if (!accumulator[checklistId]) {
                accumulator[checklistId] = { tasks: {} };
            }

            accumulator[checklistId].tasks[itemId] = Boolean(completed);
            return accumulator;
        }, {});
    }

    function getProgressStorageKey(userId) {
        return `${PROGRESS_STORAGE_PREFIX}:${userId}`;
    }

    function readCachedProgress(userId) {
        if (!userId) return {};
        try {
            const raw = localStorage.getItem(getProgressStorageKey(userId));
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            console.warn("[UniCheckChecklist] Cache local de progresso invalido", error);
            return {};
        }
    }

    function writeCachedProgress(userId, progressMap) {
        if (!userId) return;
        try {
            localStorage.setItem(getProgressStorageKey(userId), JSON.stringify(progressMap || {}));
        } catch (error) {
            console.warn("[UniCheckChecklist] Nao foi possivel atualizar o cache de progresso", error);
        }
    }

    function readPendingProgress(userId) {
        if (!userId) return {};
        try {
            const raw = localStorage.getItem(`${PENDING_STORAGE_PREFIX}:${userId}`);
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            console.warn("[UniCheckChecklist] Fila local de progresso invalida", error);
            return {};
        }
    }

    function writePendingProgress(userId, pendingMap) {
        if (!userId) return;
        try {
            localStorage.setItem(`${PENDING_STORAGE_PREFIX}:${userId}`, JSON.stringify(pendingMap || {}));
        } catch (error) {
            console.warn("[UniCheckChecklist] Nao foi possivel atualizar a fila de progresso", error);
        }
    }

    function reconcileProgressMaps(remoteMap = {}, localMap = {}, pendingMap = {}) {
        const merged = {};
        const checklistIds = new Set([...Object.keys(localMap), ...Object.keys(remoteMap)]);

        checklistIds.forEach(checklistId => {
            merged[checklistId] = {
                ...(localMap[checklistId] || {}),
                ...(remoteMap[checklistId] || {}),
                tasks: {
                    ...(localMap[checklistId]?.tasks || {}),
                    ...(remoteMap[checklistId]?.tasks || {})
                }
            };
        });

        Object.entries(pendingMap).forEach(([taskId, pending]) => {
            const checklistId = pending?.checklistId;
            if (!checklistId) return;
            merged[checklistId] ||= { tasks: {} };
            merged[checklistId].tasks ||= {};
            merged[checklistId].tasks[taskId] = Boolean(pending.completed);
        });

        return merged;
    }

    async function getCurrentUser() {
        const auth = window.UniCheckAuth;
        if (!auth) {
            throw new Error("Modulo de autenticacao nao encontrado.");
        }

        const session = await auth.getSession?.();
        const user = session?.user || null;

        if (!user) {
            throw new Error("Nenhum usuario autenticado.");
        }

        return user;
    }

    async function fetchUserProgressMap(userId) {
        if (!userId) {
            return {};
        }

        const client = getClient();
        const { data, error } = await withTimeout(client
            .from(CHECKLIST_PROGRESS_TABLE)
            .select("checklist_id, checklist_item_id, completed")
            .eq("user_id", userId), "Consulta de progresso");

        if (error) {
            logSupabaseError("Erro ao buscar progresso do usuario", error, { userId });
            throw error;
        }

        return normalizeProgressRows(data);
    }

    async function saveTaskProgress({ userId, checklistId, taskId, completed }) {
        if (!userId || !checklistId || !taskId) {
            throw new Error("Parametros insuficientes para salvar progresso.");
        }

        const client = getClient();
        const payload = {
            user_id: userId,
            checklist_id: checklistId,
            checklist_item_id: taskId,
            completed: Boolean(completed)
        };

        const { error } = await withTimeout(client
            .from(CHECKLIST_PROGRESS_TABLE)
            .upsert(payload, { onConflict: "user_id,checklist_item_id" }), "Persistencia de progresso");

        if (error) {
            logSupabaseError("Erro ao salvar progresso", error, { userId, checklistId, taskId });
            throw error;
        }
        return payload;
    }

    async function saveProgressBatch(entries) {
        if (!Array.isArray(entries) || !entries.length) return [];
        const payload = entries.map(({ userId, checklistId, taskId, completed }) => ({
            user_id: userId,
            checklist_id: checklistId,
            checklist_item_id: taskId,
            completed: Boolean(completed)
        }));
        const { error } = await withTimeout(getClient()
            .from(CHECKLIST_PROGRESS_TABLE)
            .upsert(payload, { onConflict: "user_id,checklist_item_id" }), "Sincronizacao da fila de progresso");
        if (error) {
            logSupabaseError("Erro ao sincronizar fila de progresso", error, { itemCount: payload.length });
            throw error;
        }
        return payload;
    }

    async function flushPendingProgress(userId) {
        const snapshot = readPendingProgress(userId);
        const entries = Object.entries(snapshot).map(([taskId, value]) => ({
            userId,
            checklistId: value.checklistId,
            taskId,
            completed: Boolean(value.completed)
        }));
        if (!entries.length) return [];

        await saveProgressBatch(entries);
        const current = readPendingProgress(userId);
        entries.forEach(entry => {
            const queued = current[entry.taskId];
            if (queued?.checklistId === entry.checklistId && Boolean(queued.completed) === entry.completed) {
                delete current[entry.taskId];
            }
        });
        writePendingProgress(userId, current);
        return entries;
    }

    /**
     * Calcula o progresso e gerencia o bloqueio (Lógica de Fase)
     */
    function applyProgress(checklists, progressMap = {}) {
        const result = [];

        for (const checklist of checklists) {
            const stored = progressMap[checklist.id] || {};
            
            // Atualiza o estado de completado das tarefas baseado no progresso salvo
            const tasks = checklist.tasks.map(task => ({
                ...task,
                completed: Boolean(stored.tasks?.[task.id] ?? false)
            }));

            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.completed).length;
            
            // Cálculo de porcentagem
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const completed = totalTasks > 0 && completedTasks === totalTasks;
            
            // LÓGICA DE BLOQUEIO: Se houver um checklist anterior e ele não estiver 100%, este fica travado
            const previousChecklist = result[result.length - 1];
            const isLocked = previousChecklist ? !previousChecklist.completed : false;

            result.push({
                ...checklist,
                tasks,
                progress,
                completed,
                locked: isLocked
            });
        }

        return result;
    }

    // Disponibiliza as funções globalmente para o sistema
    window.UniCheckChecklist = {
        CHECKLIST_PROGRESS_TABLE,
        fetchUserProgressMap,
        saveTaskProgress,
        saveProgressBatch,
        readCachedProgress,
        writeCachedProgress,
        readPendingProgress,
        flushPendingProgress,
        reconcileProgressMaps,
        getCurrentUser,
        applyProgress
    };
})();
