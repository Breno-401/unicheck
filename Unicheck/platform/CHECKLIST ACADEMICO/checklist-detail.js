(function () {
    const DETAIL_COPY = {
        "Primeiros passos na faculdade": {
            eyebrow: "Primeira jornada",
            helper: "Complete os blocos iniciais para organizar a entrada na rotina acadêmica sem abrir outra tela.",
            sectionTitle: "Cards de conclusão",
            sectionDescription: "Cada card representa uma ação objetiva. Marque como concluído para salvar o progresso em tempo real.",
            summaryLabel: "Resumo da fase"
        },
        "Portal Acadêmico TOTVS": {
            eyebrow: "Acesso acadêmico",
            helper: "Siga os cards de acesso e navegação no mesmo padrão das demais fases. Não há tela interna separada.",
            sectionTitle: "Cards de conclusão",
            sectionDescription: "Use os cards abaixo como checklist rápido para acessar, navegar e localizar recursos do portal.",
            summaryLabel: "Resumo do acesso"
        },
        "Configuração de Email": {
            eyebrow: "Conta institucional",
            helper: "Valide o email institucional e deixe a conta pronta para comunicações e recuperação de acesso.",
            sectionTitle: "Cards de conclusão",
            sectionDescription: "Conclua cada ajuste para garantir que a conta institucional esteja funcionando corretamente.",
            summaryLabel: "Resumo da conta"
        },
        "Biblioteca Virtual": {
            eyebrow: "Acesso à pesquisa",
            helper: "Organize o acesso aos recursos de biblioteca e consulta acadêmica em cards curtos e diretos.",
            sectionTitle: "Cards de conclusão",
            sectionDescription: "Marque cada etapa para liberar o uso da biblioteca e de seus serviços vinculados.",
            summaryLabel: "Resumo do acesso"
        },
        "Microsoft Teams": {
            eyebrow: "Comunicação da turma",
            helper: "Configure a rotina de comunicação e uso do Teams com os cards desta fase.",
            sectionTitle: "Cards de conclusão",
            sectionDescription: "Complete os passos para manter a comunicação com a turma e professores em dia.",
            summaryLabel: "Resumo da comunicação"
        },
        "Plataforma A": {
            eyebrow: "Ferramenta complementar",
            helper: "Siga os cards para liberar o uso da plataforma complementar da fase.",
            sectionTitle: "Cards de conclusão",
            sectionDescription: "Marque os passos necessários para concluir a configuração da plataforma.",
            summaryLabel: "Resumo da plataforma"
        },
        "Mentorias": {
            eyebrow: "Apoio acadêmico",
            helper: "Use os cards para preparar o acesso ao acompanhamento e apoio acadêmico.",
            sectionTitle: "Cards de conclusão",
            sectionDescription: "Conclua cada etapa para deixar o fluxo de mentoria pronto para uso.",
            summaryLabel: "Resumo do apoio"
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
        return DETAIL_COPY[checklist.title] || {
            eyebrow: `Fase ${checklist.phase || 1}`,
            helper: checklist.description || "Conclua os itens abaixo para avançar na jornada acadêmica.",
            sectionTitle: "Cards de conclusão",
            sectionDescription: "Marque cada card para atualizar o progresso em tempo real.",
            summaryLabel: "Resumo da fase"
        };
    }

    function buildTaskList(checklist, copy) {
        if (!checklist.tasks.length) {
            return `
                <div class="detail-empty-state">
                    <i data-lucide="clipboard-x"></i>
                    <p>Este checklist ainda não possui itens cadastrados.</p>
                </div>
            `;
        }

        return `
            <div class="detail-task-list">
                ${checklist.tasks.map((task, index) => `
                    <label class="detail-task-card ${task.completed ? "is-completed" : ""}">
                        <input
                            type="checkbox"
                            data-action="toggle-task"
                            data-checklist-id="${escapeHtml(checklist.id)}"
                            data-task-id="${escapeHtml(task.id)}"
                            ${task.completed ? "checked" : ""}
                        >
                        <span class="detail-task-badge">
                            <i data-lucide="${task.completed ? "check-circle-2" : "circle"}"></i>
                        </span>
                        <span class="detail-task-copy">
                            <span class="detail-task-order">Card ${index + 1}</span>
                            <span class="detail-task-title">${escapeHtml(task.text)}</span>
                            <span class="detail-task-note">${escapeHtml(copy.helper)}</span>
                        </span>
                    </label>
                `).join("")}
            </div>
        `;
    }

    function buildSummaryPanel(checklist, copy) {
        return `
            <aside class="detail-side-panel">
                <div class="detail-summary-card">
                    <span class="detail-summary-label">${escapeHtml(copy.summaryLabel)}</span>
                    <strong class="detail-summary-value">${checklist.progress}%</strong>
                    <div class="detail-progress">
                        <div class="detail-progress-bar">
                            <div class="detail-progress-fill" style="width: ${checklist.progress}%"></div>
                        </div>
                        <span class="detail-progress-text">${checklist.tasks.filter(task => task.completed).length}/${checklist.tasks.length} itens concluídos</span>
                    </div>
                    <div class="detail-summary-status ${checklist.completed ? "is-completed" : ""}">
                        ${checklist.completed ? "Checklist concluído" : "Checklist em andamento"}
                    </div>
                </div>
            </aside>
        `;
    }

    function buildChecklistLayout(checklist) {
        const copy = getDetailCopy(checklist);

        return `
            <section class="checklist-detail-shell">
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
                <div class="detail-layout">
                    <section class="detail-main-panel">
                        <div class="detail-main-card">
                            <div class="detail-section-heading">
                                <h3>${escapeHtml(copy.sectionTitle)}</h3>
                                <p>${escapeHtml(copy.sectionDescription)}</p>
                            </div>
                            ${buildTaskList(checklist, copy)}
                        </div>
                    </section>
                    ${buildSummaryPanel(checklist, copy)}
                </div>
            </section>
        `;
    }

    function render(container, checklist) {
        if (!container || !checklist) return;

        container.innerHTML = buildChecklistLayout(checklist);

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }

    window.UniCheckChecklistDetail = {
        render
    };
})();
