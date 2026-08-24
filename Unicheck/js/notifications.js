(function () {
    "use strict";

    const TABLE = "user_notifications";
    const CACHE_PREFIX = "unicheck_notifications_v1";
    const MAX_ITEMS = 30;
    let currentUserId = null;
    let items = [];
    let initialized = false;
    let button = null;
    let panel = null;

    function getClient() {
        const client = window.UniCheckSupabase?.client;
        if (!client) throw new Error("Supabase nao configurado para notificacoes.");
        return client;
    }

    function storageKey(userId) {
        return `${CACHE_PREFIX}:${userId}`;
    }

    function readCache(userId) {
        if (!userId) return [];
        try {
            const value = JSON.parse(localStorage.getItem(storageKey(userId)) || "[]");
            return Array.isArray(value) ? value : [];
        } catch (error) {
            console.warn("[UniCheckNotifications] Cache invalido", error);
            return [];
        }
    }

    function writeCache(userId, value) {
        if (!userId) return;
        try {
            localStorage.setItem(storageKey(userId), JSON.stringify(value.slice(0, MAX_ITEMS)));
        } catch (error) {
            console.warn("[UniCheckNotifications] Falha ao salvar cache", error);
        }
    }

    function ensurePanel() {
        if (panel || !button) return;
        panel = document.createElement("section");
        panel.className = "notifications-panel";
        panel.id = "notificationsPanel";
        panel.hidden = true;
        panel.setAttribute("aria-label", "Notificacoes");
        panel.innerHTML = `
            <div class="notifications-panel-header">
                <div><span>Atualizacoes</span><h2>Notificacoes</h2></div>
                <button type="button" class="notifications-close" aria-label="Fechar notificacoes">×</button>
            </div>
            <div class="notifications-list" id="notificationsList" aria-live="polite"></div>`;
        document.body.append(panel);

        panel.querySelector(".notifications-close")?.addEventListener("click", close);
        panel.addEventListener("click", event => {
            const target = event.target.closest("[data-notification-id]");
            if (!target) return;
            const item = items.find(notification => notification.id === target.dataset.notificationId);
            if (!item) return;
            void markRead(item.id);
            navigate(item.destination);
        });
    }

    function relativeDate(value) {
        const timestamp = new Date(value).getTime();
        if (!Number.isFinite(timestamp)) return "Agora";
        const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
        if (minutes < 1) return "Agora";
        if (minutes < 60) return `Ha ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Ha ${hours} h`;
        const days = Math.floor(hours / 24);
        return `Ha ${days} ${days === 1 ? "dia" : "dias"}`;
    }

    function render() {
        if (!button) return;
        ensurePanel();
        const unread = items.filter(item => !item.read).length;
        let badge = button.querySelector(".notification-badge");
        if (!badge) {
            badge = document.createElement("span");
            badge.className = "notification-badge";
            button.append(badge);
        }
        badge.textContent = unread > 9 ? "9+" : String(unread);
        badge.hidden = unread === 0;
        button.setAttribute("aria-label", unread ? `Notificacoes, ${unread} nao lidas` : "Notificacoes");

        const list = panel?.querySelector("#notificationsList");
        if (!list) return;
        list.replaceChildren();
        if (!items.length) {
            const empty = document.createElement("p");
            empty.className = "notifications-empty";
            empty.textContent = "Nenhuma notificacao por enquanto.";
            list.append(empty);
            return;
        }

        items.forEach(item => {
            const entry = document.createElement("button");
            entry.type = "button";
            entry.className = `notification-entry${item.read ? "" : " is-unread"}`;
            entry.dataset.notificationId = item.id;
            const title = document.createElement("strong");
            title.textContent = item.title;
            const message = document.createElement("span");
            message.textContent = item.message;
            const time = document.createElement("small");
            time.textContent = relativeDate(item.created_at);
            entry.append(title, message, time);
            list.append(entry);
        });
    }

    function open() {
        ensurePanel();
        if (!panel) return;
        panel.hidden = false;
        button?.setAttribute("aria-expanded", "true");
        panel.querySelector(".notifications-close")?.focus();
    }

    function close() {
        if (!panel) return;
        panel.hidden = true;
        button?.setAttribute("aria-expanded", "false");
        button?.focus();
    }

    function navigate(destination) {
        if (!destination) return;
        if (destination.startsWith("checklist:")) {
            const id = destination.slice("checklist:".length);
            const checklistLink = document.querySelector('a[href*="checklist-academico.html"]');
            const fallback = window.location.pathname.includes("CHECKLIST ACADEMICO")
                ? "checklist-academico.html"
                : "CHECKLIST ACADEMICO/checklist-academico.html";
            window.location.href = `${checklistLink?.href || fallback}#checklist=${encodeURIComponent(id)}`;
        }
    }

    async function restore(userId) {
        currentUserId = userId || currentUserId;
        items = readCache(currentUserId);
        render();
        if (!currentUserId) return items;

        const { data, error } = await getClient()
            .from(TABLE)
            .select("id, event_key, type, title, message, destination, read, created_at")
            .eq("user_id", currentUserId)
            .order("created_at", { ascending: false })
            .limit(MAX_ITEMS);
        if (error) throw error;
        items = data || [];
        writeCache(currentUserId, items);
        render();
        return items;
    }

    async function record(userId, notification) {
        if (!userId || !notification?.eventKey || !notification?.title || !notification?.message) return null;
        const payload = {
            user_id: userId,
            event_key: String(notification.eventKey).slice(0, 180),
            type: String(notification.type || "info").slice(0, 80),
            title: String(notification.title).slice(0, 300),
            message: String(notification.message).slice(0, 1000),
            destination: notification.destination ? String(notification.destination).slice(0, 500) : null
        };

        const result = await getClient().from(TABLE).insert(payload).select().single();
        if (result.error?.code === "23505") {
            const existing = await getClient().from(TABLE)
                .select("id, event_key, type, title, message, destination, read, created_at")
                .eq("user_id", userId)
                .eq("event_key", payload.event_key)
                .maybeSingle();
            if (existing.error) {
                console.error("[UniCheckNotifications] Falha ao consultar notificacao existente", existing.error);
                return null;
            }
            return existing.data;
        }
        if (result.error) {
            console.error("[UniCheckNotifications] Falha ao registrar notificacao", result.error);
            return null;
        }

        currentUserId = userId;
        items = [result.data, ...items.filter(item => item.id !== result.data.id)].slice(0, MAX_ITEMS);
        writeCache(userId, items);
        render();
        window.dispatchEvent(new CustomEvent("unicheck:notifications", { detail: result.data }));
        return result.data;
    }

    async function markRead(id) {
        if (!currentUserId || !id) return;
        const { error } = await getClient().from(TABLE).update({ read: true })
            .eq("user_id", currentUserId).eq("id", id);
        if (error) {
            console.error("[UniCheckNotifications] Falha ao marcar notificacao como lida", error);
            return;
        }
        items = items.map(item => item.id === id ? { ...item, read: true } : item);
        writeCache(currentUserId, items);
        render();
    }

    async function init() {
        if (initialized) return;
        initialized = true;
        button = document.querySelector(".header-notification-button");
        if (!button) return;
        button.setAttribute("aria-haspopup", "dialog");
        button.setAttribute("aria-expanded", "false");
        button.addEventListener("click", () => panel?.hidden === false ? close() : open());
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && panel?.hidden === false) close();
        });
        const session = await window.UniCheckAuth?.getSession?.();
        if (session?.user?.id) {
            try {
                await restore(session.user.id);
            } catch (error) {
                console.error("[UniCheckNotifications] Falha ao restaurar notificacoes", error);
            }
        }
    }

    window.UniCheckNotifications = { init, restore, record, markRead };
})();
