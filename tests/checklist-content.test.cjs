const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const contentSource = fs.readFileSync(require.resolve("../Unicheck/js/data/checklist-content.js"), "utf8");
const catalogSource = fs.readFileSync(require.resolve("../Unicheck/js/data/checklist-data.js"), "utf8");
const detailSource = fs.readFileSync(require.resolve("../Unicheck/platform/pages/checklist-academico/checklist-detail.js"), "utf8");
const supportSource = fs.readFileSync(require.resolve("../Unicheck/platform/shared/js/support-channels.js"), "utf8");

function loadModules() {
    const window = {};
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

test("conteudo enriquecido complementa exatamente os cards 001 a 012", () => {
    const window = loadModules();
    const guides = window.UniCheckChecklistContent.getAllGuides();
    const expectedIds = Array.from({ length: 12 }, (_, index) =>
        `20000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`
    );

    assert.equal(guides.length, 12);
    assert.deepEqual(Array.from(guides, guide => guide.id), expectedIds);
    assert.equal(new Set(guides.map(guide => guide.id)).size, 12);
    assert.ok(guides.every(guide => guide.steps.length >= 2 && guide.steps.length <= 4));
    assert.ok(guides.every(guide => guide.nextAction && guide.completionCriteria && guide.whyItMatters));
});

test("UUIDs, ordem e quantidade do catalogo oficial permanecem intactos", () => {
    const window = loadModules();
    const checklists = window.UniCheckChecklistData.getChecklists();
    const taskIds = checklists.flatMap(checklist => checklist.tasks.map(task => task.id));

    assert.equal(checklists.length, 7);
    assert.equal(taskIds.length, 28);
    assert.equal(checklists[0].id, "10000000-0000-4000-8000-000000000001");
    assert.equal(checklists[6].id, "10000000-0000-4000-8000-000000000007");
    assert.equal(taskIds[0], "20000000-0000-4000-8000-000000000001");
    assert.equal(taskIds[27], "20000000-0000-4000-8000-000000000028");
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
    assert.equal(getGuide(10).access, null);
    assert.match(getGuide(6).steps.map(step => step.text).join(" "), /data de nascimento/i);
    assert.match(getGuide(10).credential, /RA como senha provisória/i);
    assert.doesNotMatch(JSON.stringify(getGuide(11)), /uma letra maiúscula e um número/i);
    assert.doesNotMatch(JSON.stringify(getGuide(11)), /data de nascimento/i);
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
    const serialized = JSON.stringify(window.UniCheckChecklistContent.getAllGuides());

    assert.doesNotMatch(serialized, /a pesquisa|segundo a pesquisa|levantamento|material recebido|equipe confirmou|documento indica|não foi confirmado|fonte institucional/i);
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
