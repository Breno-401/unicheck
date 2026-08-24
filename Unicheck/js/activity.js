(function () {
    const ACTIVITY_TABLE = "user_activity";
    const STORAGE_PREFIX = "unicheck_activity";
    const SYNC_QUEUE_PREFIX = "unicheck_activity_sync_queue";
    const MAX_EVENTS = 100;
    const MAX_QUEUED_EVENTS = 500;
    const REQUEST_TIMEOUT_MS = 15000;
    const syncInFlight = new Set();
    const syncScheduled = new Set();

    function isValidUserId(userId) {
        return Boolean(userId && userId !== "anonymous");
    }

    function getStorageKey(userId) {
        return `${STORAGE_PREFIX}:${userId}`;
    }

    function getQueueKey(userId) {
        return `${SYNC_QUEUE_PREFIX}:${userId}`;
    }

    function createUuid() {
        if (window.crypto?.randomUUID) return window.crypto.randomUUID();
        const bytes = new Uint8Array(16);
        if (window.crypto?.getRandomValues) {
            window.crypto.getRandomValues(bytes);
        } else {
            for (let index = 0; index < bytes.length; index += 1) {
                bytes[index] = Math.floor(Math.random() * 256);
            }
        }
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        return Array.from(bytes, byte => byte.toString(16).padStart(2, "0"))
            .join("")
            .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
    }

    function isUuid(value) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || "");
    }

    function normalizeEvent(event) {
        const timestamp = event?.timestamp || event?.created_at;
        if (!event?.type || !event?.title || !timestamp || Number.isNaN(new Date(timestamp).getTime())) return null;
        return {
            id: isUuid(event.id) ? event.id : createUuid(),
            type: String(event.type),
            title: String(event.title),
            context: String(event.context || ""),
            metadata: event.metadata && typeof event.metadata === "object" ? event.metadata : {},
            timestamp: new Date(timestamp).toISOString()
        };
    }

    function sortAndDedupe(events, limit = MAX_EVENTS) {
        const byId = new Map();
        events.forEach(event => {
            const normalized = normalizeEvent(event);
            if (normalized && !byId.has(normalized.id)) byId.set(normalized.id, normalized);
        });
        return Array.from(byId.values())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, Math.max(0, limit));
    }

    function readJsonList(key) {
        try {
            const parsed = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.warn("[UniCheckActivity] Cache local invalido", { key, error });
            return [];
        }
    }

    function write(userId, events) {
        if (!isValidUserId(userId)) return [];
        const normalized = sortAndDedupe(events);
        localStorage.setItem(getStorageKey(userId), JSON.stringify(normalized));
        return normalized;
    }

    function read(userId, limit = MAX_EVENTS) {
        if (!isValidUserId(userId)) return [];
        const rawEvents = readJsonList(getStorageKey(userId));
        const normalized = sortAndDedupe(rawEvents);
        if (JSON.stringify(rawEvents) !== JSON.stringify(normalized)) {
            try {
                write(userId, normalized);
                // Eventos do cache da versao anterior recebiam IDs nao UUID. Ao
                // migra-los uma unica vez, entram na mesma fila idempotente.
                writeQueue(userId, [...normalized, ...readQueue(userId)]);
            } catch (error) {
                console.warn("[UniCheckActivity] Nao foi possivel migrar o cache local", error);
            }
        }
        return normalized.slice(0, Math.max(0, limit));
    }

    function readQueue(userId) {
        if (!isValidUserId(userId)) return [];
        const queue = sortAndDedupe(readJsonList(getQueueKey(userId)), MAX_QUEUED_EVENTS);
        try {
            localStorage.setItem(getQueueKey(userId), JSON.stringify(queue));
        } catch (error) {
            console.warn("[UniCheckActivity] Nao foi possivel normalizar a fila local", error);
        }
        return queue;
    }

    function writeQueue(userId, events) {
        const queue = sortAndDedupe(events, MAX_QUEUED_EVENTS);
        localStorage.setItem(getQueueKey(userId), JSON.stringify(queue));
        return queue;
    }

    async function withTimeout(query, context) {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
            return await query.abortSignal(controller.signal);
        } catch (error) {
            if (controller.signal.aborted) throw new Error(`${context} excedeu ${REQUEST_TIMEOUT_MS / 1000} segundos.`);
            throw error;
        } finally {
            window.clearTimeout(timeoutId);
        }
    }

    function getClient() {
        const client = window.UniCheckSupabase?.client;
        if (!client) throw new Error("Supabase nao configurado para atividades.");
        return client;
    }

    async function flush(userId) {
        if (!isValidUserId(userId) || syncInFlight.has(userId)) return;
        const snapshot = readQueue(userId);
        if (!snapshot.length) return;
        syncInFlight.add(userId);
        let shouldContinue = false;
        try {
            const payload = snapshot.map(event => ({
                id: event.id,
                user_id: userId,
                type: event.type,
                title: event.title,
                context: event.context || null,
                metadata: event.metadata || {},
                created_at: event.timestamp
            }));
            const { error } = await withTimeout(
                getClient().from(ACTIVITY_TABLE).upsert(payload, { onConflict: "id", ignoreDuplicates: true }),
                "Sincronizacao de atividades"
            );
            if (error) throw error;
            const syncedIds = new Set(snapshot.map(event => event.id));
            const remaining = writeQueue(userId, readQueue(userId).filter(event => !syncedIds.has(event.id)));
            shouldContinue = remaining.length > 0;
        } catch (error) {
            console.error("[UniCheckActivity] Sincronizacao remota pendente; cache preservado", {
                message: error?.message || String(error),
                code: error?.code || null,
                userId,
                itemCount: snapshot.length
            });
        } finally {
            syncInFlight.delete(userId);
            if (shouldContinue) void flush(userId);
        }
    }

    async function fetchRecent(userId, limit = MAX_EVENTS) {
        if (!isValidUserId(userId)) return [];
        const { data, error } = await withTimeout(
            getClient().from(ACTIVITY_TABLE)
                .select("id, type, title, context, metadata, created_at")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(Math.min(MAX_EVENTS, Math.max(1, limit))),
            "Consulta de atividades"
        );
        if (error) throw error;
        return sortAndDedupe(data || []);
    }

    async function restore(userId) {
        if (!isValidUserId(userId)) return [];
        await flush(userId);
        const remote = await fetchRecent(userId);
        const merged = write(userId, [...read(userId), ...remote]);
        window.dispatchEvent(new CustomEvent("unicheck:activity-restored", { detail: { userId } }));
        return merged;
    }

    function scheduleFlush(userId) {
        if (!isValidUserId(userId) || syncScheduled.has(userId)) return;
        syncScheduled.add(userId);
        const enqueue = window.queueMicrotask || (callback => Promise.resolve().then(callback));
        enqueue(() => {
            syncScheduled.delete(userId);
            void flush(userId);
        });
    }

    function record(userId, event) {
        if (!isValidUserId(userId) || !event?.type || !event?.title) return null;
        const entry = normalizeEvent({ ...event, id: event.id || createUuid(), timestamp: event.timestamp || new Date().toISOString() });
        if (!entry) return null;
        try {
            const current = read(userId);
            if (current.some(item => item.id === entry.id)) return null;
            write(userId, [entry, ...current]);
            writeQueue(userId, [entry, ...readQueue(userId)]);
            window.dispatchEvent(new CustomEvent("unicheck:activity", { detail: { userId, entry } }));
            scheduleFlush(userId);
            return entry;
        } catch (error) {
            console.error("[UniCheckActivity] Nao foi possivel gravar atividade no cache", error);
            return null;
        }
    }

    async function flushCurrentUser() {
        try {
            const session = await window.UniCheckAuth?.getSession?.();
            if (session?.user?.id) await flush(session.user.id);
        } catch (error) {
            console.warn("[UniCheckActivity] Sessao indisponivel para sincronizar fila", error);
        }
    }

    window.addEventListener("online", () => { void flushCurrentUser(); });
    window.UniCheckActivity = Object.freeze({
        ACTIVITY_TABLE,
        read,
        record,
        restore,
        fetchRecent,
        flush,
        getStorageKey,
        getQueueKey
    });
})();
