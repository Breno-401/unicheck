(function () {
    "use strict";

    const CACHE_KEY = "unicheck_checklist_catalog_v2";
    const EXPECTED_PHASES = 7;
    const EXPECTED_TASKS = 28;
    let refreshPromise = null;

    const PHASES = [
        ["10000000-0000-4000-8000-000000000001", "Primeiros passos na faculdade", "Estruture os combinados iniciais da turma, defina os contatos principais e prepare o onboarding para a rotina academica.", ["Definir o lider da turma", "Criar o grupo oficial da turma", "Entrar no grupo da turma", "Confirmar calendario e canais da coordenacao"]],
        ["10000000-0000-4000-8000-000000000002", "Portal Acadêmico TOTVS", "Aprenda a acessar o Portal do Aluno, entrar com RA e senha e localizar a central do aluno e os documentos mais usados.", ["Abrir o Portal do Aluno UniSales", "Fazer login com RA e senha inicial", "Localizar a Central do Aluno e a Secretaria", "Baixar boletos, comprovantes e relatorios"]],
        ["10000000-0000-4000-8000-000000000003", "Configuração de Email", "Valide o email institucional, entre no Outlook/Webmail e prepare a conta para avisos, comunicados e recuperacao.", ["Confirmar o email institucional", "Entrar no Outlook/Webmail", "Alterar a senha provisoria", "Testar envio e recebimento de mensagens"]],
        ["10000000-0000-4000-8000-000000000004", "Biblioteca Virtual", "Prepare a consulta ao acervo, livros, artigos e bases digitais para estudo e pesquisa.", ["Entrar na biblioteca virtual", "Buscar um livro da disciplina", "Abrir uma base digital ou artigo", "Verificar reservas, downloads ou historico"]],
        ["10000000-0000-4000-8000-000000000005", "Microsoft Teams", "Organize a conta, os canais e a rotina de uso do Teams para aulas, recados, encontros e arquivos da turma.", ["Entrar com a conta institucional", "Abrir a equipe da turma ou disciplina", "Ajustar notificacoes e perfil", "Localizar canais, arquivos e reunioes"]],
        ["10000000-0000-4000-8000-000000000006", "Plataforma A+", "Conclua a configuracao minima da Plataforma A+ para materiais e recursos extras do fluxo academico.", ["Acessar a Plataforma A+", "Concluir o login inicial", "Identificar materiais e recursos principais", "Registrar acesso ou pendencias da ferramenta"]],
        ["10000000-0000-4000-8000-000000000007", "Mentorias", "Entenda como acionar o acompanhamento, registrar demandas e usar os canais de apoio ao estudante.", ["Identificar o canal de apoio", "Localizar regras ou agenda de atendimento", "Registrar duvidas ou necessidades", "Confirmar o encaminhamento ou retorno"]]
    ];

    const LOCAL_CATALOG = PHASES.map(([id, title, description, taskTitles], phaseIndex) => {
        const tasks = taskTitles.map((taskTitle, taskIndex) => ({
            id: `20000000-0000-4000-8000-${String((phaseIndex * 4) + taskIndex + 1).padStart(12, "0")}`,
            title: taskTitle,
            text: taskTitle,
            order: taskIndex + 1,
            completed: false
        }));
        return { id, title, description, order: phaseIndex + 1, phase: phaseIndex + 1, tasks, items: tasks };
    });

    let catalog = cloneCatalog(LOCAL_CATALOG);

    function cloneCatalog(value) {
        return value.map(checklist => {
            const tasks = (checklist.tasks || checklist.items || []).map(task => ({ ...task }));
            return { ...checklist, tasks, items: tasks };
        });
    }

    function isCanonical(value) {
        return Array.isArray(value) && value.length === EXPECTED_PHASES
            && value.every(checklist => checklist?.id && Array.isArray(checklist.tasks))
            && value.reduce((total, checklist) => total + checklist.tasks.length, 0) === EXPECTED_TASKS;
    }

    function getClient() {
        const client = window.UniCheckSupabase?.client;
        if (!client) throw new Error("Supabase nao configurado para carregar os checklists.");
        return client;
    }

    function writeCache(value) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(value)); }
        catch (error) { console.warn("[UniCheckChecklistData] Nao foi possivel salvar o catalogo local", error); }
    }

    function normalize(checklists, items) {
        const itemsByChecklist = (items || []).reduce((result, item) => {
            result[item.checklist_id] ||= [];
            result[item.checklist_id].push({ id: item.id, title: item.titulo, text: item.titulo, order: item.ordem, completed: false });
            return result;
        }, {});
        return (checklists || []).map((checklist, index) => {
            const tasks = (itemsByChecklist[checklist.id] || []).sort((left, right) => left.order - right.order);
            return { id: checklist.id, title: checklist.titulo, description: checklist.descricao || "", order: checklist.ordem, phase: checklist.ordem || index + 1, tasks, items: tasks };
        }).sort((left, right) => left.order - right.order);
    }

    async function refreshRemote() {
        const client = getClient();
        const [checklistsResult, itemsResult] = await Promise.all([
            client.from("checklists").select("id, titulo, descricao, ordem").order("ordem", { ascending: true }),
            client.from("checklist_items").select("id, checklist_id, titulo, ordem").order("ordem", { ascending: true })
        ]);
        if (checklistsResult.error) throw checklistsResult.error;
        if (itemsResult.error) throw itemsResult.error;
        const remoteCatalog = normalize(checklistsResult.data, itemsResult.data);
        if (!isCanonical(remoteCatalog)) {
            throw new Error(`Catalogo remoto divergente: ${remoteCatalog.length}/${remoteCatalog.reduce((total, item) => total + item.tasks.length, 0)}; esperado 7/28.`);
        }
        catalog = cloneCatalog(remoteCatalog);
        writeCache(catalog);
        window.dispatchEvent(new CustomEvent("unicheck:catalog-updated", { detail: { checklists: getChecklists() } }));
        return getChecklists();
    }

    function load(options = {}) {
        if (!refreshPromise || options.force) {
            refreshPromise = refreshRemote().catch(error => {
                console.warn("[UniCheckChecklistData] Catalogo remoto indisponivel; usando estrutura local 7/28", {
                    code: error?.code || null, message: error?.message || String(error), details: error?.details || null, hint: error?.hint || null
                });
                return getChecklists();
            }).finally(() => { refreshPromise = null; });
        }
        return Promise.resolve(getChecklists());
    }

    function getChecklists() { return cloneCatalog(isCanonical(catalog) ? catalog : LOCAL_CATALOG); }

    window.UniCheckChecklistData = { load, getChecklists, EXPECTED_PHASES, EXPECTED_TASKS };
})();
