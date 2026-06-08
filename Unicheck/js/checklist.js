(function () {
    const CHECKLISTS_TABLE = "checklists";
    const CHECKLIST_ITEMS_TABLE = "checklist_items";
    const CHECKLIST_PROGRESS_TABLE = "user_checklist_item_progress";

    // Conexão com o cliente Supabase configurado globalmente
    function getClient() {
        const client = window.UniCheckSupabase?.client;
        if (!client) {
            throw new Error("Supabase não configurado. Verifique js/config.js.");
        }
        return client;
    }

    // Converte valores para número com segurança
    function toNumber(value, fallback = 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    /**
     * DOCUMENTAÇÃO: Transforma os dados do banco (Português) 
     * para o formato esperado pela interface (Inglês).
     */
    function normalizeChecklist(row) {
        return {
            id: row.id,
            // MAPEAMENTO: A coluna 'ordem' do banco vira a nossa 'phase' (Fase)
            phase: toNumber(row.ordem, 0), 
            // MAPEAMENTO: 'titulo' vira 'title'
            title: row.titulo || `Checklist ${row.id}`,
            // MAPEAMENTO: 'descricao' vira 'description'
            description: row.descricao || "",
            imageUrl: row.image_url || null,
            tutorialUrl: row.tutorial_url || null,
            locked: false, // Será calculado na função applyProgress
            completed: false,
            progress: 0,
            tasks: []
        };
    }

    function normalizeChecklistItem(row) {
        return {
            id: row.id,
            checklistId: row.checklist_id,
            // MAPEAMENTO: 'titulo' vira 'text'
            text: row.titulo || "Item sem descrição",
            completed: row.concluido || false,
            // MAPEAMENTO: 'ordem' vira 'order'
            order: toNumber(row.ordem, 0)
        };
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

    async function getCurrentUser() {
        const auth = window.UniCheckAuth;
        if (!auth) {
            throw new Error("Modulo de autenticacao nao encontrado.");
        }

        const debug = await auth.getAuthDebugSnapshot?.("checklist.getCurrentUser");
        const user = debug?.user || await auth.getUser?.();

        if (!user) {
            throw new Error("Nenhum usuario autenticado.");
        }

        console.info("[UniCheckChecklist] Usuario autenticado confirmado", {
            userId: user.id || null,
            email: user.email || null,
            hasSession: Boolean(debug?.session)
        });

        return user;
    }

    /**
     * Busca os itens de um checklist específico ordenados pela coluna 'ordem'
     */
    async function fetchChecklistItems(checklistId) {
        const client = getClient();
        const { data, error } = await client
            .from(CHECKLIST_ITEMS_TABLE)
            .select("*")
            .eq("checklist_id", checklistId)
            .order("ordem", { ascending: true }); // Ordenação via Banco

        if (error) {
            console.error("Erro ao buscar itens:", error);
            return [];
        }

        return (data || []).map(normalizeChecklistItem);
    }

    /**
     * Busca todos os checklists ordenados pela coluna 'ordem'
     */
    async function fetchAllChecklists() {
        const client = getClient();
        const { data, error } = await client
            .from(CHECKLISTS_TABLE)
            .select("*")
            .order("ordem", { ascending: true }); // Ordenação via Banco (Fase 1, 2, 3...)

        if (error) {
            throw error;
        }

        const checklists = (data || []).map(normalizeChecklist);
        
        // Para cada checklist, busca as suas respectivas tarefas
        const checklistsWithItems = await Promise.all(
            checklists.map(async checklist => ({
                ...checklist,
                tasks: await fetchChecklistItems(checklist.id)
            }))
        );

        return checklistsWithItems;
    }

    async function fetchChecklistByPhase(phaseOrder) {
        const client = getClient();
        const { data, error } = await client
            .from(CHECKLISTS_TABLE)
            .select("*")
            .eq("ordem", phaseOrder)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            return null;
        }

        const checklist = normalizeChecklist(data);
        checklist.tasks = await fetchChecklistItems(checklist.id);
        return checklist;
    }

    async function fetchUserProgressMap(userId) {
        if (!userId) {
            return {};
        }

        const client = getClient();
        console.info("[UniCheckChecklist] Buscando progresso remoto", {
            userId
        });

        const { data, error } = await client
            .from(CHECKLIST_PROGRESS_TABLE)
            .select("checklist_id, checklist_item_id, completed")
            .eq("user_id", userId);

        if (error) {
            console.error("[UniCheckChecklist] Erro ao buscar progresso do usuario:", {
                userId,
                message: error?.message || error
            });
            return {};
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

        const { error } = await client
            .from(CHECKLIST_PROGRESS_TABLE)
            .upsert(payload, { onConflict: "user_id,checklist_item_id" });

        if (error) {
            console.error("[UniCheckChecklist] Erro ao salvar progresso", {
                userId,
                checklistId,
                taskId,
                message: error?.message || error
            });
            throw error;
        }

        console.info("[UniCheckChecklist] Progresso salvo", {
            userId,
            checklistId,
            taskId,
            completed: Boolean(completed)
        });
        return payload;
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
        CHECKLISTS_TABLE,
        CHECKLIST_ITEMS_TABLE,
        CHECKLIST_PROGRESS_TABLE,
        fetchAllChecklists,
        fetchChecklistByPhase,
        fetchChecklistItems,
        fetchUserProgressMap,
        saveTaskProgress,
        getCurrentUser,
        applyProgress
    };
})();
