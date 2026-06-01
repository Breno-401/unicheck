(function () {
    const TITLE_COPY = {
        "Portal Acadêmico TOTVS": {
            eyebrow: "Acesso academico",
            helper: "Use o tutorial existente da TOTVS na propria pagina e conclua os itens ao lado para liberar a proxima fase."
        },
        "Primeiros passos na faculdade": {
            eyebrow: "Primeira jornada",
            helper: "Conclua as orientacoes iniciais para entrar na faculdade com o basico configurado."
        },
        "Configuração de Email": {
            eyebrow: "Conta institucional",
            helper: "Ative e valide seu email institucional para receber avisos, acessos e recuperacoes de senha."
        }
    };

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function getDetailCopy(checklist) {
        return TITLE_COPY[checklist.title] || {
            eyebrow: `Fase ${checklist.phase || 1}`,
            helper: checklist.description || "Conclua os itens abaixo para avancar na jornada academica."
        };
    }

    function buildTaskList(checklist) {
        if (!checklist.tasks.length) {
            return `
                <div class="detail-empty-state">
                    <i data-lucide="clipboard-x"></i>
                    <p>Este checklist ainda nao possui itens cadastrados.</p>
                </div>
            `;
        }

        return `
            <div class="detail-task-list">
                ${checklist.tasks.map((task, index) => `
                    <label class="detail-task ${task.completed ? "is-completed" : ""}">
                        <input
                            type="checkbox"
                            data-action="toggle-task"
                            data-checklist-id="${escapeHtml(checklist.id)}"
                            data-task-id="${escapeHtml(task.id)}"
                            ${task.completed ? "checked" : ""}
                        >
                        <span class="detail-task-checkbox">
                            <i data-lucide="check"></i>
                        </span>
                        <span class="detail-task-copy">
                            <span class="detail-task-order">Passo ${index + 1}</span>
                            <span class="detail-task-title">${escapeHtml(task.text)}</span>
                        </span>
                    </label>
                `).join("")}
            </div>
        `;
    }

    function buildSummaryPanel(checklist) {
        return `
            <aside class="detail-side-panel">
                <div class="detail-summary-card">
                    <span class="detail-summary-label">Progresso atual</span>
                    <strong class="detail-summary-value">${checklist.progress}%</strong>
                    <div class="detail-progress">
                        <div class="detail-progress-bar">
                            <div class="detail-progress-fill" style="width: ${checklist.progress}%"></div>
                        </div>
                        <span class="detail-progress-text">${checklist.tasks.filter(task => task.completed).length}/${checklist.tasks.length} itens concluidos</span>
                    </div>
                    <div class="detail-summary-status ${checklist.completed ? "is-completed" : ""}">
                        ${checklist.completed ? "Checklist concluido" : "Checklist em andamento"}
                    </div>
                </div>
            </aside>
        `;
    }

    function buildDefaultLayout(checklist) {
        const copy = getDetailCopy(checklist);

        return `
            <section class="checklist-detail-shell">
                <div class="detail-topbar">
                    <button class="btn btn-secondary detail-back-button" type="button" data-action="back-to-list">
                        <i data-lucide="arrow-left"></i>
                        Voltar
                    </button>
                    <span class="detail-phase-badge">Fase ${escapeHtml(checklist.phase || 1)}</span>
                </div>
                <div class="detail-hero">
                    <span class="detail-eyebrow">${escapeHtml(copy.eyebrow)}</span>
                    <h2>${escapeHtml(checklist.title)}</h2>
                    <p>${escapeHtml(copy.helper)}</p>
                </div>
                <div class="detail-layout">
                    <section class="detail-main-panel">
                        <div class="detail-main-card">
                            <div class="detail-section-heading">
                                <h3>Checklist da fase</h3>
                                <p>Marque cada item para atualizar o progresso em tempo real.</p>
                            </div>
                            ${buildTaskList(checklist)}
                        </div>
                    </section>
                    ${buildSummaryPanel(checklist)}
                </div>
            </section>
        `;
    }

    function buildTotvsLayout(checklist) {
        const copy = getDetailCopy(checklist);

        return `
            <section class="checklist-detail-shell checklist-detail-shell--totvs">
                <div class="detail-topbar">
                    <button class="btn btn-secondary detail-back-button" type="button" data-action="back-to-list">
                        <i data-lucide="arrow-left"></i>
                        Voltar
                    </button>
                    <div class="detail-topbar-actions">
                        <span class="detail-phase-badge">Fase ${escapeHtml(checklist.phase || 1)}</span>
                    </div>
                </div>
                <div class="detail-hero">
                    <span class="detail-eyebrow">${escapeHtml(copy.eyebrow)}</span>
                    <h2>${escapeHtml(checklist.title)}</h2>
                    <p>${escapeHtml(copy.helper)}</p>
                </div>
                <div class="detail-layout detail-layout--totvs">
                    <section class="detail-main-panel">
                        <div class="detail-embed-card">
                            <iframe
                                src="tutorial.html?embedded=1"
                                title="Tutorial Portal Academico TOTVS"
                                class="detail-totvs-frame"
                                loading="lazy"
                            ></iframe>
                        </div>
                    </section>
                    ${buildSummaryPanel(checklist)}
                </div>
            </section>
        `;
    }

    function render(container, checklist) {
        if (!container || !checklist) return;

        container.innerHTML = checklist.title === "Portal Acadêmico TOTVS"
            ? buildTotvsLayout(checklist)
            : buildDefaultLayout(checklist);

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }

    window.UniCheckChecklistDetail = {
        render
    };
})();
