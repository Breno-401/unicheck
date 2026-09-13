const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const contentSource = fs.readFileSync(require.resolve("../Unicheck/js/data/checklist-content.js"), "utf8");
const catalogSource = fs.readFileSync(require.resolve("../Unicheck/js/data/checklist-data.js"), "utf8");
const detailSource = fs.readFileSync(require.resolve("../Unicheck/platform/pages/checklist-academico/checklist-detail.js"), "utf8");
const supportSource = fs.readFileSync(require.resolve("../Unicheck/platform/shared/js/support-channels.js"), "utf8");

function loadModules(overrides = {}) {
    const window = { dispatchEvent: () => {}, ...overrides };
    const localStorage = {
        getItem: () => null,
        setItem: () => {}
    };
    vm.runInNewContext(catalogSource, { window, localStorage, console, CustomEvent: class {} });
    vm.runInNewContext(contentSource, { window, console });
    vm.runInNewContext(supportSource, { window, console });
    vm.runInNewContext(detailSource, { window, console });
    return window;
}

const taskId = number => `20000000-0000-4000-8000-${String(number).padStart(12, "0")}`;
const phaseId = number => `10000000-0000-4000-8000-${String(number).padStart(12, "0")}`;

test("conteudo enriquecido complementa exatamente os cards 001 a 028", () => {
    const window = loadModules();
    const guides = window.UniCheckChecklistContent.getAllGuides();
    const expectedIds = Array.from({ length: 28 }, (_, index) => taskId(index + 1));

    assert.equal(guides.length, 28);
    assert.deepEqual(Array.from(guides, guide => guide.id), expectedIds);
    assert.equal(new Set(guides.map(guide => guide.id)).size, 28);
    assert.ok(guides.every(guide => guide.steps.length >= 2 && guide.steps.length <= 4));
    assert.ok(guides.every(guide => guide.nextAction && guide.completionCriteria && guide.whyItMatters));
});

test("UUIDs, ordem e quantidade do catalogo oficial permanecem intactos", () => {
    const window = loadModules();
    const checklists = window.UniCheckChecklistData.getChecklists();
    const taskIds = checklists.flatMap(checklist => checklist.tasks.map(task => task.id));

    assert.equal(checklists.length, 7);
    assert.equal(taskIds.length, 28);
    assert.deepEqual(Array.from(checklists, phase => phase.id), Array.from({ length: 7 }, (_, index) => phaseId(index + 1)));
    assert.deepEqual(Array.from(taskIds), Array.from({ length: 28 }, (_, index) => taskId(index + 1)));
    checklists.forEach((phase, index) => {
        assert.equal(phase.tasks.length, 4);
        assert.equal(phase.order, index + 1);
        assert.deepEqual(Array.from(phase.tasks, task => task.order), [1, 2, 3, 4]);
    });
});

test("credenciais e links publicados respeitam a separacao entre sistemas", () => {
    const window = loadModules();
    const getGuide = number => window.UniCheckChecklistContent.getGuide(
        `20000000-0000-4000-8000-${String(number).padStart(12, "0")}`
    );
    const portalAccess = "https://inspetoriasao142819.rm.cloudtotvs.com.br/FrameHTML/Web/App/Edu/PortalEducacional/login/";

    assert.equal(getGuide(4).access.url, "https://unisales.br/calendario-academico/");
    assert.equal(getGuide(5).access.url, portalAccess);
    assert.equal(getGuide(6).access.url, portalAccess);
    assert.equal(getGuide(9).access.url, "https://unisales.grupoa.education/plataforma/auth/signin");
    assert.equal(getGuide(10).access.url, "https://unisales.br/institucional/webmail/");
    assert.doesNotMatch(getGuide(6).steps.map(step => step.text).join(" "), /data de nascimento/i);
    assert.match(getGuide(10).credential, /@souunisales\.com\.br/i);
    assert.doesNotMatch(JSON.stringify(getGuide(10)), /RA como senha|CPF como senha|data de nascimento|salesiano/i);
    assert.doesNotMatch(JSON.stringify(getGuide(11)), /uma letra maiúscula e um número/i);
    assert.doesNotMatch(JSON.stringify(getGuide(11)), /data de nascimento/i);
    assert.match(getGuide(21).credential, /RA/);
    assert.match(getGuide(21).credential, /CPF/);
    assert.match(getGuide(17).credential, /@souunisales\.com\.br/);
    assert.match(JSON.stringify(getGuide(14)), /senha.{0,100}(escolh|criad|defin)|(?:escolh|cri|defin).{0,100}senha/i);
});

test("cards 013 a 028 explicam local, conta, passos, resultado e suporte", () => {
    const window = loadModules();
    for (let number = 13; number <= 28; number += 1) {
        const guide = window.UniCheckChecklistContent.getGuide(taskId(number));
        for (const field of ["title", "description", "nextAction", "where", "credential", "completionCriteria", "whyItMatters"]) {
            assert.ok(typeof guide[field] === "string" && guide[field].trim().length > 8, `card ${number}: ${field}`);
        }
        assert.ok(guide.steps.every(step => typeof step.text === "string" && step.text.length > 15), `card ${number}: passos operacionais`);
        assert.ok(guide.quickHelp.some(help => help.text && help.action?.contact === "multiatendimento"), `card ${number}: suporte canonico`);
        assert.doesNotMatch(JSON.stringify(guide), /A atividade foi realizada e o resultado foi conferido|Concluir esta etapa mantém sua jornada acadêmica organizada|Identifique os recursos principais|Registrar acesso ou pendências da ferramenta/i);
    }
});

test("links publicados sao HTTPS oficiais e contatos nao sao duplicados no conteudo", () => {
    const window = loadModules();
    const allowedHosts = new Set(["unisales.br", "unisales.grupoa.education", "teams.microsoft.com", "inspetoriasao142819.rm.cloudtotvs.com.br"]);
    for (const guide of window.UniCheckChecklistContent.getAllGuides()) {
        const actions = [guide.access, ...guide.quickHelp.map(help => help.action)].filter(Boolean);
        for (const action of actions) {
            if (action.contact) {
                assert.equal(action.contact, "multiatendimento");
                assert.equal(action.url, undefined, `${guide.id}: contato deve resolver pelo helper`);
            } else {
                const url = new URL(action.url);
                assert.equal(url.protocol, "https:");
                assert.ok(allowedHosts.has(url.hostname), `${guide.id}: host ${url.hostname}`);
                assert.doesNotMatch(action.url, /example|localhost|placeholder|pendente/i);
                assert.ok(action.label?.trim());
            }
        }
    }
    assert.doesNotMatch(contentSource, /wa\.me|api\.whatsapp|tecnologia@|3331[-\s]?8697|98123[-\s]?4566/i);
    const phoneDigits = window.UniCheckContacts.multiatendimento.href.match(/\d{10,}/)?.[0];
    if (phoneDigits) assert.ok(!contentSource.includes(phoneDigits));
});

test("trilha renderiza lista compacta e somente um painel de etapa", () => {
    const window = loadModules();
    const checklist = window.UniCheckChecklistData.getChecklists()[0];
    const renderedChecklist = {
        ...checklist,
        progress: 0,
        completed: false,
        tasks: checklist.tasks.map(task => ({ ...task, completed: false }))
    };
    const container = { innerHTML: "" };

    const selectedTaskId = window.UniCheckChecklistDetail.render(container, renderedChecklist);
    const trailMarkup = container.innerHTML.match(/<nav aria-label="Etapas da fase">[\s\S]*?<\/nav>/)?.[0] || "";

    assert.equal(selectedTaskId, "20000000-0000-4000-8000-000000000001");
    assert.match(container.innerHTML, /Etapa 01/);
    assert.match(container.innerHTML, /Identificar o representante de turma/);
    assert.match(container.innerHTML, /O que fazer agora/);
    assert.match(container.innerHTML, /data-action="select-task"/);
    assert.match(container.innerHTML, /aria-current="step"/);
    assert.match(container.innerHTML, /data-action="complete-task"/);
    assert.match(container.innerHTML, /Confira as orientações acima para concluir/);
    assert.match(container.innerHTML, /id="checklist-selected-step"/);
    assert.match(container.innerHTML, /data-task-id="20000000-0000-4000-8000-000000000001"/);
    assert.doesNotMatch(trailMarkup, /O que fazer agora|Como fazer|Você terminou quando/);
    assert.doesNotMatch(container.innerHTML, /Ver instruções|Ocultar instruções|aria-expanded|data-guide-panel/);
    assert.doesNotMatch(container.innerHTML, /type="checkbox"|toggle-task/);
    assert.equal((container.innerHTML.match(/id="checklist-selected-step"/g) || []).length, 1);
    assert.equal((container.innerHTML.match(/aria-current="step"/g) || []).length, 1);
});

test("cabecalho das sete fases omite metadados internos de planejamento", () => {
    const window = loadModules();
    const checklists = window.UniCheckChecklistData.getChecklists();

    checklists.forEach(checklist => {
        const container = { innerHTML: "" };
        window.UniCheckChecklistDetail.render(container, {
            ...checklist,
            progress: 0,
            completed: false,
            tasks: checklist.tasks.map(task => ({ ...task, completed: false }))
        });
        const hero = container.innerHTML.match(/<header class="detail-hero">[\s\S]*?<\/header>/)?.[0] || "";

        assert.ok(hero.includes(checklist.title));
        assert.doesNotMatch(hero, /Objetivo|Foco|Saída|detail-overview-list/i);
    });
});

test("estado inicial seleciona a primeira etapa pendente sem alterar conclusao", () => {
    const window = loadModules();
    const checklist = window.UniCheckChecklistData.getChecklists()[0];
    const firstTaskId = checklist.tasks[0].id;
    const secondTaskId = checklist.tasks[1].id;
    const container = { innerHTML: "" };
    const tasks = checklist.tasks.map((task, index) => ({ ...task, completed: index === 0 }));

    const selectedTaskId = window.UniCheckChecklistDetail.render(container, {
        ...checklist,
        progress: 25,
        completed: false,
        tasks
    });

    assert.equal(selectedTaskId, secondTaskId);
    assert.match(container.innerHTML, new RegExp(`data-resolved-task-id="${secondTaskId}"`));
    assert.match(container.innerHTML, new RegExp(`class="detail-trail-item is-completed[^"]*"[\\s\\S]*?data-task-id="${firstTaskId}"`));
    assert.match(container.innerHTML, new RegExp(`data-selected-task-id="${secondTaskId}"`));
    assert.equal(tasks[0].completed, true);
    assert.equal(tasks[1].completed, false);
});

test("selecao explicita permite revisar etapa concluida", () => {
    const window = loadModules();
    const checklist = window.UniCheckChecklistData.getChecklists()[0];
    const selectedTaskId = checklist.tasks[3].id;
    const container = { innerHTML: "" };

    const resolvedTaskId = window.UniCheckChecklistDetail.render(container, {
        ...checklist,
        progress: 100,
        completed: true,
        tasks: checklist.tasks.map(task => ({ ...task, completed: true }))
    }, { selectedTaskId });

    assert.equal(resolvedTaskId, selectedTaskId);
    assert.match(container.innerHTML, new RegExp(`data-selected-task-id="${selectedTaskId}"`));
    assert.match(container.innerHTML, /Concluída/);
    assert.match(container.innerHTML, /Etapa concluída/);
    assert.doesNotMatch(container.innerHTML, /data-action="complete-task"/);
    assert.match(container.innerHTML, /target="_blank"[\s\S]*?rel="noopener noreferrer"/);
});

test("acoes externas usam CTA compartilhado e o mesmo Multiatendimento da ajuda", () => {
    const window = loadModules();
    const checklists = window.UniCheckChecklistData.getChecklists();
    const firstPhase = {
        ...checklists[0],
        progress: 0,
        completed: false,
        tasks: checklists[0].tasks.map(task => ({ ...task, completed: false }))
    };
    const portalPhase = {
        ...checklists[1],
        progress: 25,
        completed: false,
        tasks: checklists[1].tasks.map((task, index) => ({ ...task, completed: index === 0 }))
    };
    const calendarContainer = { innerHTML: "" };
    const supportContainer = { innerHTML: "" };

    window.UniCheckChecklistDetail.render(calendarContainer, firstPhase, { selectedTaskId: firstPhase.tasks[3].id });
    window.UniCheckChecklistDetail.render(supportContainer, portalPhase, { selectedTaskId: portalPhase.tasks[1].id });

    assert.match(calendarContainer.innerHTML, /class="guide-action-link"/);
    assert.match(calendarContainer.innerHTML, /Abrir calendário acadêmico/);
    assert.match(supportContainer.innerHTML, /Falar com o Multiatendimento/);
    assert.ok(supportContainer.innerHTML.includes(window.UniCheckContacts.multiatendimento.href));
    assert.equal(window.UniCheckSupportChannels.whatsapp, window.UniCheckContacts.multiatendimento);
});

test("fase concluida oferece revisao protegida e acesso a proxima fase", () => {
    const window = loadModules();
    const checklists = window.UniCheckChecklistData.getChecklists();
    const checklist = {
        ...checklists[0],
        progress: 100,
        completed: true,
        tasks: checklists[0].tasks.map(task => ({ ...task, completed: true }))
    };
    const container = { innerHTML: "" };

    window.UniCheckChecklistDetail.render(container, checklist, {
        selectedTaskId: checklist.tasks[3].id,
        nextChecklistId: checklists[1].id,
        nextChecklistTitle: checklists[1].title
    });

    assert.match(container.innerHTML, /Fase concluída/);
    assert.match(container.innerHTML, /Próxima fase liberada/);
    assert.match(container.innerHTML, /Ir para a próxima fase/);
    assert.doesNotMatch(container.innerHTML, /Desmarcar|Refazer|Remover conclusão|Resetar etapa/i);
});

test("conteudo visivel nao expoe linguagem de bastidor editorial", () => {
    const window = loadModules();
    const editorialText = /(?:segundo|conforme) a pesquisa|a pesquisa (?:confirma|indica|mostra)|levantamento|material recebido|equipe confirmou|documento indica|não foi confirmado|fonte institucional|pesquisa pendente|sourcePages|sourceDocument|screenshot.{0,30}(pendente|exportar)|Plataforma A\+|manutenção do software|gere todo o sistema|A atividade foi realizada e o resultado foi conferido|Concluir esta etapa mantém sua jornada acadêmica organizada/i;
    for (const checklist of window.UniCheckChecklistData.getChecklists()) {
        for (const task of checklist.tasks) {
            const container = { innerHTML: "" };
            window.UniCheckChecklistDetail.render(container, {
                ...checklist,
                progress: 0,
                completed: false,
                tasks: checklist.tasks.map(item => ({ ...item, completed: false }))
            }, { selectedTaskId: task.id });
            assert.doesNotMatch(container.innerHTML, editorialText, task.id);
            assert.match(container.innerHTML, /O que fazer agora/);
            assert.match(container.innerHTML, /Você terminou quando/);
            assert.equal((container.innerHTML.match(/id="checklist-selected-step"/g) || []).length, 1);
            const guide = window.UniCheckChecklistContent.getGuide(task.id);
            if (guide.access) {
                assert.ok(container.innerHTML.includes(guide.access.url), `${task.id}: CTA institucional renderizado`);
                assert.match(container.innerHTML, /class="guide-action-link"/);
            }
            if (guide.quickHelp.some(help => help.action?.contact)) {
                assert.ok(container.innerHTML.includes(window.UniCheckContacts.multiatendimento.href), `${task.id}: suporte canonico renderizado`);
            }
        }
    }
});

test("rotulos editoriais AVA e Monitoria persistem apos atualizar catalogo remoto", async () => {
    let finishRefresh;
    const updated = new Promise(resolve => { finishRefresh = resolve; });
    const localCatalog = loadModules().UniCheckChecklistData.getChecklists();
    const remotePhases = localCatalog.map(phase => ({
        id: phase.id, titulo: phase.phase === 6 ? "Plataforma A+" : phase.phase === 7 ? "Mentorias" : phase.title,
        descricao: "Descrição legada recebida do catálogo remoto", ordem: phase.order
    }));
    const remoteTasks = localCatalog.flatMap(phase => phase.tasks.map(task => ({
        id: task.id, checklist_id: phase.id, titulo: "Texto legado recebido do catálogo remoto", ordem: task.order
    })));
    const window = loadModules({
        dispatchEvent: finishRefresh,
        UniCheckSupabase: { client: { from: table => ({ select: () => ({ order: async () => ({
            data: table === "checklists" ? remotePhases : remoteTasks, error: null
        }) }) }) } }
    });
    await window.UniCheckChecklistData.load({ force: true });
    await Promise.race([updated, new Promise((_, reject) => {
        const timer = setTimeout(() => reject(new Error("Catálogo não publicou atualização")), 1000);
        timer.unref();
    })]);
    const refreshed = window.UniCheckChecklistData.getChecklists();
    assert.equal(refreshed[5].title, "AVA");
    assert.equal(refreshed[6].title, "Monitoria e apoio acadêmico");
    assert.deepEqual(Array.from(refreshed, phase => phase.id), Array.from(localCatalog, phase => phase.id));
    assert.deepEqual(Array.from(refreshed.flatMap(phase => phase.tasks), task => task.id), Array.from(localCatalog.flatMap(phase => phase.tasks), task => task.id));
    assert.doesNotMatch(JSON.stringify(refreshed.slice(3).map(phase => ({ title: phase.title, description: phase.description }))), /Descrição legada|Plataforma A\+|Mentorias/);
    assert.ok(refreshed.every(phase => phase.tasks.every(task => task.title === "Texto legado recebido do catálogo remoto")));
    for (const phase of refreshed.slice(3)) {
        const container = { innerHTML: "" };
        window.UniCheckChecklistDetail.render(container, { ...phase, progress: 0, completed: false });
        assert.doesNotMatch(container.innerHTML, /Texto legado|Descrição legada|Plataforma A\+|Mentorias/);
    }
});

test("passo do guia aceita screenshot contextual responsivo e acessivel", () => {
    const window = loadModules();
    const taskId = "20000000-0000-4000-8000-000000000001";
    const checklist = window.UniCheckChecklistData.getChecklists()[0];
    const originalGuide = window.UniCheckChecklistContent.getGuide(taskId);
    window.UniCheckChecklistContent.getGuide = id => id === taskId ? {
        ...originalGuide,
        steps: [{
            text: "Localize o controle destacado.",
            image: "../../assets/tutorial/F1_C001_P01_exemplo.png",
            imageAlt: "Controle do sistema destacado",
            imageCaption: "Captura vinculada ao primeiro passo"
        }]
    } : null;
    const container = { innerHTML: "" };

    window.UniCheckChecklistDetail.render(container, {
        ...checklist,
        progress: 0,
        completed: false,
        tasks: checklist.tasks.map(task => ({ ...task, completed: false }))
    });

    assert.match(container.innerHTML, /class="detail-guide-figure"/);
    assert.match(container.innerHTML, /loading="lazy"/);
    assert.match(container.innerHTML, /alt="Controle do sistema destacado"/);
    assert.match(container.innerHTML, /Captura vinculada ao primeiro passo/);
});

test("Home usa o mesmo titulo enriquecido da proxima etapa e preserva fallback", () => {
    const window = loadModules();
    window.matchMedia = () => ({ matches: false });
    window.addEventListener = () => {};
    const nextTaskElement = { textContent: "" };
    const document = {
        getElementById: id => id === "academicNextTask" ? nextTaskElement : null,
        querySelector: () => null, querySelectorAll: () => [],
        documentElement: {}, addEventListener: () => {}, readyState: "loading"
    };
    const context = vm.createContext({ window, document, console });
    vm.runInContext(fs.readFileSync(require.resolve("../Unicheck/platform/shared/js/platform-shell.js"), "utf8"), context);
    const phases = window.UniCheckChecklistData.getChecklists();
    for (const phase of phases.slice(3)) {
        for (const task of phase.tasks) {
            context.renderAcademicProgress({ phases, completedPhases: phase.phase - 1, percentage: 50, currentPhase: phase, nextTask: task });
            assert.equal(nextTaskElement.textContent, window.UniCheckChecklistContent.getGuide(task.id).title, task.id);
        }
    }
    window.UniCheckChecklistContent = undefined;
    context.renderAcademicProgress({ phases, completedPhases: 3, percentage: 50, currentPhase: phases[3], nextTask: phases[3].tasks[1] });
    assert.equal(nextTaskElement.textContent, phases[3].tasks[1].title);
    const homeHtml = fs.readFileSync(require.resolve("../Unicheck/platform/index-interno.html"), "utf8");
    const contentIndex = homeHtml.indexOf("checklist-content.js");
    assert.ok(contentIndex >= 0 && contentIndex < homeHtml.indexOf("platform-shell.js"), "Home carrega conteudo antes do shell");
});
