(function () {
    const TABLE = "user_notifications";
    const CACHE_PREFIX = "unicheck_notifications";
    const QUEUE_PREFIX = "unicheck_notifications_sync_queue";
    const MAX_CACHE = 100;
    const MAX_QUEUE = 500;
    const TIMEOUT_MS = 15000;
    const state = { userId: null, initialized: false, open: false, syncing: false, scheduled: false };
    let refs = {};

    const cacheKey = userId => `${CACHE_PREFIX}:${userId}`;
    const queueKey = userId => `${QUEUE_PREFIX}:${userId}`;
    const validUser = userId => Boolean(userId && userId !== "anonymous");

    function uuid() {
        if (window.crypto?.randomUUID) return window.crypto.randomUUID();
        const bytes = new Uint8Array(16);
        if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
        else bytes.forEach((_, index) => { bytes[index] = Math.floor(Math.random() * 256); });
        bytes[6] = (bytes[6] & 15) | 64;
        bytes[8] = (bytes[8] & 63) | 128;
        const hex = Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }

    function jsonList(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(value) ? value : [];
        } catch (error) {
            console.warn("[UniCheckNotifications] Cache local invalido", { key, error });
            return [];
        }
    }

    function normalize(item) {
        const timestamp = item?.timestamp || item?.created_at;
        if (!item?.eventKey && !item?.event_key) return null;
        if (!item?.type || !item?.title || !item?.message || !timestamp) return null;
        return {
            id: item.id || uuid(),
            eventKey: String(item.eventKey || item.event_key),
            type: String(item.type),
            title: String(item.title),
            message: String(item.message),
            destination: item.destination ? String(item.destination) : "",
            read: Boolean(item.read),
            timestamp: new Date(timestamp).toISOString()
        };
    }

    function merge(items, limit = MAX_CACHE) {
        const byEvent = new Map();
        items.forEach(item => {
            const value = normalize(item);
            if (value) byEvent.set(value.eventKey, value);
        });
        return Array.from(byEvent.values())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    function read(userId, limit = MAX_CACHE) {
        if (!validUser(userId)) return [];
        return merge(jsonList(cacheKey(userId))).slice(0, limit);
    }

    function write(userId, notifications) {
        const value = merge(notifications);
        localStorage.setItem(cacheKey(userId), JSON.stringify(value));
        return value;
    }

    function readQueue(userId) {
        return jsonList(queueKey(userId)).slice(0, MAX_QUEUE);
    }

    function writeQueue(userId, operations) {
        const compact = new Map();
        operations.forEach(operation => {
            if (!operation?.operation || !operation?.eventKey) return;
            compact.set(`${operation.operation}:${operation.eventKey}`, operation);
        });
        const value = Array.from(compact.values()).slice(-MAX_QUEUE);
        localStorage.setItem(queueKey(userId), JSON.stringify(value));
        return value;
    }

    function getClient() {
        const client = window.UniCheckSupabase?.client;
        if (!client) throw new Error("Supabase nao configurado para notificacoes.");
        return client;
    }

    async function timed(query, label) {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
        try {
            return await query.abortSignal(controller.signal);
        } catch (error) {
            if (controller.signal.aborted) throw new Error(`${label} excedeu ${TIMEOUT_MS / 1000} segundos.`);
            throw error;
        } finally {
            window.clearTimeout(timer);
        }
    }

    async function flush(userId) {
        if (!validUser(userId) || state.syncing) return;
        const snapshot = readQueue(userId);
        if (!snapshot.length) return;
        state.syncing = true;
        let synchronized = false;
        try {
            const inserts = snapshot.filter(item => item.operation === "insert").map(item => item.notification);
            const readKeys = snapshot.filter(item => item.operation === "read").map(item => item.eventKey);
            if (inserts.length) {
                const payload = inserts.map(item => ({
                    id: item.id,
                    user_id: userId,
                    event_key: item.eventKey,
                    type: item.type,
                    title: item.title,
                    message: item.message,
                    destination: item.destination || null,
                    read: item.read,
                    created_at: item.timestamp
                }));
                const { error } = await timed(
                    getClient().from(TABLE).upsert(payload, { onConflict: "user_id,event_key", ignoreDuplicates: true }),
                    "Sincronizacao de notificacoes"
                );
                if (error) throw error;
            }
            if (readKeys.length) {
                const { error } = await timed(
                    getClient().from(TABLE).update({ read: true }).eq("user_id", userId).in("event_key", readKeys),
                    "Leitura de notificacoes"
                );
                if (error) throw error;
            }
            const completed = new Set(snapshot.map(item => `${item.operation}:${item.eventKey}`));
            writeQueue(userId, readQueue(userId).filter(item => !completed.has(`${item.operation}:${item.eventKey}`)));
            synchronized = true;
        } catch (error) {
            console.error("[UniCheckNotifications] Sincronizacao pendente; cache preservado", {
                message: error?.message || String(error), code: error?.code || null, userId
            });
        } finally {
            state.syncing = false;
            if (synchronized && readQueue(userId).length && navigator.onLine) scheduleFlush(userId);
        }
    }

    function scheduleFlush(userId) {
        if (state.scheduled) return;
        state.scheduled = true;
        const enqueue = window.queueMicrotask || (callback => Promise.resolve().then(callback));
        enqueue(() => { state.scheduled = false; void flush(userId); });
    }

    async function fetchRemote(userId) {
        const { data, error } = await timed(
            getClient().from(TABLE)
                .select("id, event_key, type, title, message, destination, read, created_at")
                .eq("user_id", userId).order("created_at", { ascending: false }).limit(MAX_CACHE),
            "Consulta de notificacoes"
        );
        if (error) throw error;
        return data || [];
    }

    async function restore(userId) {
        await flush(userId);
        const remote = await fetchRemote(userId);
        const pendingReads = new Set(readQueue(userId).filter(item => item.operation === "read").map(item => item.eventKey));
        const local = read(userId);
        const reconciled = merge([...local, ...remote]).map(item => pendingReads.has(item.eventKey) ? { ...item, read: true } : item);
        write(userId, reconciled);
        render();
        return reconciled;
    }

    function record(userId, notification) {
        if (!validUser(userId) || !notification?.eventKey) return null;
        try {
            const current = read(userId);
            if (current.some(item => item.eventKey === notification.eventKey)) return null;
            const entry = normalize({ ...notification, id: notification.id || uuid(), timestamp: notification.timestamp || new Date().toISOString() });
            if (!entry) return null;
            write(userId, [entry, ...current]);
            writeQueue(userId, [...readQueue(userId), { operation: "insert", eventKey: entry.eventKey, notification: entry }]);
            render();
            window.dispatchEvent(new CustomEvent("unicheck:notifications", { detail: { userId, entry } }));
            scheduleFlush(userId);
            return entry;
        } catch (error) {
            console.error("[UniCheckNotifications] Falha ao gravar no cache", error);
            return null;
        }
    }

    function markRead(eventKeys) {
        if (!state.userId || !eventKeys.length) return;
        const keys = new Set(eventKeys);
        const updated = read(state.userId).map(item => keys.has(item.eventKey) ? { ...item, read: true } : item);
        write(state.userId, updated);
        writeQueue(state.userId, [...readQueue(state.userId), ...eventKeys.map(eventKey => ({ operation: "read", eventKey }))]);
        render();
        scheduleFlush(state.userId);
    }

    function resolveDestination(destination) {
        if (!destination) return "";
        if (destination.startsWith("checklist:")) {
            const id = destination.slice("checklist:".length);
            const path = window.location.pathname;
            const marker = path.toLowerCase().lastIndexOf("/platform/");
            const root = marker >= 0 ? path.slice(0, marker) : "";
            return `${root}/platform/CHECKLIST%20ACADEMICO/checklist-academico.html#checklist=${encodeURIComponent(id)}`;
        }
        try {
            const resolved = new URL(destination, window.location.href);
            return resolved.origin === window.location.origin ? resolved.href : "";
        } catch (error) {
            return "";
        }
    }

    function relativeTime(timestamp) {
        const minutes = Math.floor(Math.max(0, Date.now() - new Date(timestamp).getTime()) / 60000);
        if (minutes < 1) return "agora";
        if (minutes < 60) return `há ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `há ${hours} h`;
        return `há ${Math.floor(hours / 24)} d`;
    }

    function escape(value) {
        const span = document.createElement("span");
        span.textContent = String(value || "");
        return span.innerHTML;
    }

    function render() {
        if (!state.userId || !refs.list) return;
        const notifications = read(state.userId);
        const unread = notifications.filter(item => !item.read).length;
        refs.badge.textContent = unread > 99 ? "99+" : String(unread);
        refs.badge.hidden = unread === 0;
        refs.button.setAttribute("aria-label", unread ? `Notificações: ${unread} não lidas` : "Notificações: nenhuma não lida");
        refs.markAll.disabled = unread === 0;
        refs.list.innerHTML = notifications.length ? notifications.map(item => {
            const icon = item.type === "phase_unlocked" ? "unlock" : item.type === "journey_completed" ? "trophy" : "info";
            return `<button class="notification-item${item.read ? " is-read" : " is-unread"}" type="button" role="listitem" aria-label="${escape(`${item.title}. ${item.message}. ${item.read ? "Lida" : "Não lida"}`)}" data-event-key="${escape(item.eventKey)}" data-destination="${escape(item.destination)}">
                <span class="notification-item-icon"><i data-lucide="${icon}"></i></span>
                <span class="notification-item-copy"><strong>${escape(item.title)}</strong><span>${escape(item.message)}</span><time datetime="${escape(item.timestamp)}">${relativeTime(item.timestamp)}</time></span>
                ${item.read ? "" : '<span class="notification-unread-dot" aria-hidden="true"></span>'}
            </button>`;
        }).join("") : '<div class="notification-empty"><i data-lucide="bell-off"></i><p>Nenhuma notificação por enquanto.</p></div>';
        window.lucide?.createIcons?.();
    }

    function setOpen(open, restoreFocus = true) {
        state.open = open;
        refs.panel.hidden = !open;
        refs.button.setAttribute("aria-expanded", String(open));
        if (open) refs.close.focus();
        else if (restoreFocus) refs.button.focus();
    }

    function setupUi() {
        const button = document.querySelector(".header-notification-button");
        if (!button) return;
        const host = document.createElement("div");
        host.className = "notification-center";
        button.parentNode.insertBefore(host, button);
        host.appendChild(button);
        button.setAttribute("aria-haspopup", "dialog");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", "unicheckNotificationPanel");
        button.insertAdjacentHTML("beforeend", '<span class="notification-count" hidden></span>');
        host.insertAdjacentHTML("beforeend", `<section class="notification-panel" id="unicheckNotificationPanel" role="dialog" aria-modal="false" aria-labelledby="notificationPanelTitle" hidden>
            <header><div><span class="notification-kicker">Sua jornada</span><h2 id="notificationPanelTitle">Notificações</h2></div><button class="notification-close" type="button" aria-label="Fechar notificações"><i data-lucide="x"></i></button></header>
            <div class="notification-list" role="list"></div>
            <footer><button class="notification-mark-all" type="button">Marcar todas como lidas</button></footer>
        </section>`);
        refs = { host, button, panel: host.querySelector(".notification-panel"), badge: host.querySelector(".notification-count"), list: host.querySelector(".notification-list"), close: host.querySelector(".notification-close"), markAll: host.querySelector(".notification-mark-all") };
        button.addEventListener("click", () => setOpen(!state.open));
        refs.close.addEventListener("click", () => setOpen(false));
        refs.markAll.addEventListener("click", () => markRead(read(state.userId).filter(item => !item.read).map(item => item.eventKey)));
        refs.list.addEventListener("click", event => {
            const item = event.target.closest(".notification-item");
            if (!item) return;
            markRead([item.dataset.eventKey]);
            const destination = resolveDestination(item.dataset.destination);
            if (destination) window.location.href = destination;
        });
        document.addEventListener("click", event => { if (state.open && !host.contains(event.target)) setOpen(false, false); });
        document.addEventListener("keydown", event => { if (state.open && event.key === "Escape") { event.preventDefault(); setOpen(false); } });
    }

    async function init() {
        if (state.initialized) return;
        state.initialized = true;
        setupUi();
        try {
            const session = await window.UniCheckAuth?.getSession?.();
            state.userId = session?.user?.id || null;
            if (!state.userId) return;
            render();
            void restore(state.userId).catch(error => console.error("[UniCheckNotifications] Remoto indisponivel; cache preservado", { message: error?.message || String(error), userId: state.userId }));
        } catch (error) {
            console.warn("[UniCheckNotifications] Sessao indisponivel", error);
        }
    }

    window.addEventListener("online", () => { if (state.userId) void flush(state.userId); });
    window.UniCheckNotifications = Object.freeze({ init, read, record, restore, flush, markRead, cacheKey, queueKey });
})();
