(function () {
    "use strict";

    const CACHE_KEY = "unicheck_checklist_catalog_v1";
    let catalog = readCache();
    let loadPromise = null;

    function getClient() {
        const client = window.UniCheckSupabase?.client;
        if (!client) throw new Error("Supabase nao configurado para carregar os checklists.");
        return client;
    }

    function readCache() {
        try {
            const value = JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
            return Array.isArray(value) ? value : [];
        } catch (error) {
            console.warn("[UniCheckChecklistData] Catalogo local invalido", error);
            return [];
        }
    }

    function writeCache(value) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(value));
        } catch (error) {
            console.warn("[UniCheckChecklistData] Nao foi possivel salvar o catalogo local", error);
        }
    }

    function normalize(checklists, items) {
        const itemsByChecklist = (items || []).reduce((result, item) => {
            result[item.checklist_id] ||= [];
            result[item.checklist_id].push({
                id: item.id,
                title: item.titulo,
                text: item.titulo,
                order: item.ordem,
                completed: false
            });
            return result;
        }, {});

        return (checklists || []).map(checklist => {
            const tasks = (itemsByChecklist[checklist.id] || [])
                .sort((left, right) => left.order - right.order);
            return {
                id: checklist.id,
                title: checklist.titulo,
                description: checklist.descricao || "",
                order: checklist.ordem,
                tasks,
                items: tasks
            };
        }).sort((left, right) => left.order - right.order);
    }

    async function fetchCatalog() {
        const client = getClient();
        const [checklistsResult, itemsResult] = await Promise.all([
            client.from("checklists").select("id, titulo, descricao, ordem").order("ordem", { ascending: true }),
            client.from("checklist_items").select("id, checklist_id, titulo, ordem").order("ordem", { ascending: true })
        ]);

        if (checklistsResult.error) throw checklistsResult.error;
        if (itemsResult.error) throw itemsResult.error;

        const nextCatalog = normalize(checklistsResult.data, itemsResult.data);
        if (!nextCatalog.length) throw new Error("Nenhum checklist estrutural foi encontrado.");
        catalog = nextCatalog;
        writeCache(catalog);
        return getChecklists();
    }

    async function load(options = {}) {
        if (loadPromise && !options.force) return loadPromise;
        loadPromise = fetchCatalog().catch(error => {
            if (catalog.length) {
                console.warn("[UniCheckChecklistData] Usando catalogo em cache", error);
                return getChecklists();
            }
            throw error;
        }).finally(() => {
            loadPromise = null;
        });
        return loadPromise;
    }

    function getChecklists() {
        return catalog.map(checklist => ({
            ...checklist,
            tasks: checklist.tasks.map(task => ({ ...task })),
            items: checklist.items.map(task => ({ ...task }))
        }));
    }

    window.UniCheckChecklistData = {
        load,
        getChecklists
    };
})();
