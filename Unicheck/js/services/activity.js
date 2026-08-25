(function () {
    "use strict";

    const TABLE = "user_activity";
    const CACHE_PREFIX = "unicheck_activity_v1";
    const MAX_ITEMS = 20;

    function getClient() {
        const client = window.UniCheckSupabase?.client;
        if (!client) throw new Error("Supabase nao configurado para atividades.");
        return client;
    }

    function key(userId) {
        return `${CACHE_PREFIX}:${userId}`;
    }

    function read(userId) {
        if (!userId) return [];
        try {
            const value = JSON.parse(localStorage.getItem(key(userId)) || "[]");
            return Array.isArray(value) ? value : [];
        } catch (error) {
            console.warn("[UniCheckActivity] Cache local invalido", error);
            return [];
        }
    }

    function write(userId, items) {
        if (!userId) return;
        try {
            localStorage.setItem(key(userId), JSON.stringify(items.slice(0, MAX_ITEMS)));
        } catch (error) {
            console.warn("[UniCheckActivity] Falha ao atualizar o cache", error);
        }
    }

    function formatDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Agora";
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    }

    function iconFor(type) {
        if (type === "checklist_phase_completed") return "badge-check";
        if (type === "checklist_phase_unlocked") return "unlock";
        if (type === "profile_updated") return "user-round-check";
        if (type === "favorite_added") return "bookmark-check";
        return "check";
    }

    function render(items) {
        const container = document.getElementById("recentActivityList");
        if (!container) return;
        container.replaceChildren();

        if (!items.length) {
            const empty = document.createElement("p");
            empty.className = "activity-empty";
            empty.textContent = "Suas conclusoes e atualizacoes aparecerao aqui.";
            container.append(empty);
            return;
        }

        items.slice(0, 5).forEach(item => {
            const article = document.createElement("article");
            article.className = "activity-item";

            const icon = document.createElement("span");
            icon.className = "activity-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.innerHTML = `<i data-lucide="${iconFor(item.type)}"></i>`;

            const content = document.createElement("div");
            content.className = "activity-content";
            const title = document.createElement("h4");
            title.textContent = item.title;
            const detail = document.createElement("p");
            detail.textContent = [item.context, formatDate(item.created_at)].filter(Boolean).join(" · ");
            content.append(title, detail);
            article.append(icon, content);
            container.append(article);
        });

        window.lucide?.createIcons?.();
    }

    async function restore(userId) {
        const cached = read(userId);
        render(cached);
        if (!userId) return cached;

        const { data, error } = await getClient()
            .from(TABLE)
            .select("id, type, title, context, metadata, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(MAX_ITEMS);

        if (error) throw error;
        const items = data || [];
        write(userId, items);
        render(items);
        return items;
    }

    async function record(userId, activity) {
        if (!userId || !activity?.type || !activity?.title) return null;
        const payload = {
            user_id: userId,
            type: String(activity.type).slice(0, 80),
            title: String(activity.title).slice(0, 500),
            context: activity.context ? String(activity.context).slice(0, 1000) : null,
            metadata: activity.metadata && typeof activity.metadata === "object" ? activity.metadata : {}
        };

        const { data, error } = await getClient().from(TABLE).insert(payload).select().single();
        if (error) {
            console.error("[UniCheckActivity] Falha ao registrar atividade", error);
            return null;
        }

        const items = [data, ...read(userId).filter(item => item.id !== data.id)].slice(0, MAX_ITEMS);
        write(userId, items);
        render(items);
        window.dispatchEvent(new CustomEvent("unicheck:activity", { detail: data }));
        return data;
    }

    window.UniCheckActivity = { restore, record, render };
})();
