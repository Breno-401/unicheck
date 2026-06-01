(function () {
    const CHECKLIST_COPY = {
        "Primeiros passos na faculdade": {
            eyebrow: "Onboarding da turma",
            helper: "Estruture o primeiro contato da turma, defina responsabilidades e deixe os canais oficiais prontos antes de avançar.",
            sectionTitle: "Organizacao inicial",
            sectionDescription: "Cada card cobre uma entrega concreta da fase 1 para dar base ao restante da jornada academica.",
            summaryLabel: "Base da fase",
            summaryStatus: "Turma pronta para seguir",
            summaryLead: "Fase de entrada e organizacao",
            nextStep: "Quando tudo estiver concluido, a fase 2 entra com os canais e a rotina ja alinhados.",
            overview: [
                { label: "Objetivo", value: "Organizar a turma" },
                { label: "Foco", value: "Canais e combinados" },
                { label: "Saida", value: "Base consolidada" }
            ],
            beforeStart: [
                "Confirme o nome oficial da turma e os contatos da coordenacao.",
                "Tenha em maos os canais de comunicacao que a turma vai usar.",
                "Verifique se ha um calendario ou informativo institucional para compartilhar."
            ],
            highlights: [
                "Define um responsavel para centralizar informacoes.",
                "Evita ruído de comunicacao logo no inicio.",
                "Cria a base para os acessos institucionais seguintes."
            ],
            taskContext: [
                "Escolher um lider ajuda a concentrar avisos, dúvidas e repasses da turma.",
                "Criar o grupo oficial evita que a comunicação fique dispersa em varios canais.",
                "Entrar no grupo correto garante que ninguém perca comunicados importantes.",
                "Confirmar calendario e canais evita retrabalho e mensagens contraditorias."
            ]
        },
        "Portal Acadêmico TOTVS": {
            eyebrow: "Acesso academico",
            helper: "Use os cards para entrar no portal, localizar menus essenciais e recuperar documentos sem depender de outra tela.",
            sectionTitle: "Fluxo do portal",
            sectionDescription: "Cada card espelha uma etapa real do primeiro acesso e da navegacao basica no TOTVS.",
            summaryLabel: "Resumo do acesso",
            summaryStatus: "Acesso operacional",
            summaryLead: "Entrada e navegação no portal",
            nextStep: "Depois dessa fase, o estudante ja consegue consultar rotinas e documentos com autonomia.",
            overview: [
                { label: "Objetivo", value: "Entrar com segurança" },
                { label: "Foco", value: "Navegacao e documentos" },
                { label: "Saida", value: "Portal dominado" }
            ],
            beforeStart: [
                "Tenha o RA e a senha inicial ou definitiva em mãos.",
                "Confirme se o portal institucional esta disponivel no navegador.",
                "Use uma aba limpa para evitar conflito de sessão ou cache."
            ],
            highlights: [
                "Autenticacao com credenciais academicas.",
                "Localizacao rapida da central do aluno e menus principais.",
                "Identificacao dos relatorios e documentos mais usados."
            ],
            taskContext: [
                "Abrir o portal certo evita confusao com paginas espelho ou links antigos.",
                "O login inicial precisa de atenção para não travar o primeiro acesso.",
                "Saber onde fica a navegacao principal acelera a consulta diaria.",
                "Encontrar documentos e relatorios evita dependencia do suporte."
            ]
        },
        "Configuração de Email": {
            eyebrow: "Conta institucional",
            helper: "Valide o email institucional, teste o acesso e deixe a conta pronta para comunicacoes e recuperacao de senha.",
            sectionTitle: "Conta de entrada",
            sectionDescription: "Os cards desta fase cuidam do acesso, validação e uso correto do email acadêmico.",
            summaryLabel: "Resumo da conta",
            summaryStatus: "Conta pronta",
            summaryLead: "Email institucional configurado",
            nextStep: "Com o email funcionando, voce reduz risco de perder avisos e recuperacoes importantes.",
            overview: [
                { label: "Objetivo", value: "Ativar o email" },
                { label: "Foco", value: "Acesso e validacao" },
                { label: "Saida", value: "Conta preparada" }
            ],
            beforeStart: [
                "Confirme o endereço institucional fornecido pela faculdade.",
                "Teste o acesso em um navegador confiavel antes de salvar a conta no celular.",
                "Tenha a senha original e a nova senha guardadas com segurança."
            ],
            highlights: [
                "Evita perda de comunicados e boletos internos.",
                "Facilita recuperacao de senha e notificacoes.",
                "Ajuda a separar comunicacao pessoal da academica."
            ],
            taskContext: [
                "A conta institucional deve abrir sem erro antes de configurar o restante.",
                "Validar credenciais evita bloqueio futuro por falha de digitação.",
                "A navegacao correta garante que mensagens e sistemas sejam encontrados facilmente.",
                "Documentos e avisos geralmente chegam por este canal, entao vale confirmar tudo."
            ]
        },
        "Biblioteca Virtual": {
            eyebrow: "Acesso à pesquisa",
            helper: "Organize o acesso aos recursos de biblioteca e consulta academica em cards curtos e diretos.",
            sectionTitle: "Acesso e pesquisa",
            sectionDescription: "Esses cards representam a preparação para usar bases, acervo e servicos de apoio a pesquisa.",
            summaryLabel: "Resumo do acesso",
            summaryStatus: "Pesquisa liberada",
            summaryLead: "Biblioteca pronta para consulta",
            nextStep: "Quando essa fase terminar, a busca por livros, artigos e documentos fica mais simples.",
            overview: [
                { label: "Objetivo", value: "Usar a biblioteca" },
                { label: "Foco", value: "Pesquisa e acervo" },
                { label: "Saida", value: "Consulta habilitada" }
            ],
            beforeStart: [
                "Separe seus dados de login acadêmico, se a biblioteca exigir autenticação.",
                "Verifique se a instituição usa catalogo, base digital ou ambos.",
                "Anote os termos mais comuns da sua area para testar a busca."
            ],
            highlights: [
                "Ajuda a localizar acervo e bases digitais com rapidez.",
                "Apoia a consulta de artigos, livros e materiais de estudo.",
                "Reduz tempo perdido em pesquisas dispersas."
            ],
            taskContext: [
                "Entrar na biblioteca com o acesso correto e o primeiro passo para a consulta.",
                "Testar a busca ajuda a confirmar se o acervo digital esta funcionando.",
                "Saber onde ficam reservas, downloads ou historicos facilita o uso recorrente.",
                "Documentos e regras de uso evitam perda de tempo com acesso indevido."
            ]
        },
        "Microsoft Teams": {
            eyebrow: "Comunicação da turma",
            helper: "Configure a rotina de comunicacao e uso do Teams para aula, avisos e encontros com a turma.",
            sectionTitle: "Rotina de comunicacao",
            sectionDescription: "Os cards abaixo ajudam a montar um fluxo minimamente confiavel para mensagens e reunioes.",
            summaryLabel: "Resumo da comunicação",
            summaryStatus: "Canal pronto",
            summaryLead: "Teams configurado para uso academico",
            nextStep: "Depois de concluir, a turma ganha um canal consistente para encontros, avisos e compartilhamento.",
            overview: [
                { label: "Objetivo", value: "Conectar a turma" },
                { label: "Foco", value: "Aulas e avisos" },
                { label: "Saida", value: "Canal ativo" }
            ],
            beforeStart: [
                "Confirme a conta de estudante vinculada ao Teams.",
                "Atualize nome e avatar para facilitar reconhecimento pela turma.",
                "Verifique se o aparelho permite notificacoes do aplicativo."
            ],
            highlights: [
                "Centraliza avisos e encontros da turma.",
                "Facilita compartilhamento de arquivos e recados.",
                "Reduz a dependência de mensagens soltas em outros apps."
            ],
            taskContext: [
                "Entrar com a conta correta evita misturar contatos pessoais e institucionais.",
                "Validar credenciais garante que a conta esta pronta para aulas e grupos.",
                "Saber onde fica a navegacao principal acelera a entrada em equipes e canais.",
                "Materiais e comunicados tendem a ficar em canais especificos do curso."
            ]
        },
        "Plataforma A": {
            eyebrow: "Ferramenta complementar",
            helper: "Siga os cards para deixar o acesso a plataforma complementar pronto e sem pendencias.",
            sectionTitle: "Uso complementar",
            sectionDescription: "A fase cobre a configuracao minima para operar uma ferramenta adicional da rotina academica.",
            summaryLabel: "Resumo da plataforma",
            summaryStatus: "Ambiente preparado",
            summaryLead: "Plataforma complementar ativa",
            nextStep: "Com esta fase pronta, o usuario passa a navegar melhor entre as ferramentas da jornada.",
            overview: [
                { label: "Objetivo", value: "Liberar acesso" },
                { label: "Foco", value: "Configuracao final" },
                { label: "Saida", value: "Ferramenta pronta" }
            ],
            beforeStart: [
                "Confirme qual ferramenta complementar esta sendo usada pela instituição.",
                "Verifique se existe login unico ou credenciais especificas.",
                "Separe os dados de acesso e permissões exigidas."
            ],
            highlights: [
                "Evita falha de acesso na primeira tentativa.",
                "Ajuda a mapear permissões e recursos essenciais.",
                "Deixa a rotina academica menos fragmentada."
            ],
            taskContext: [
                "Abrir a ferramenta certa evita configuracao desnecessaria em apps errados.",
                "Credenciais corretas garantem que o acesso seja aceito sem erro.",
                "A navegacao principal precisa ser reconhecida para o uso diario.",
                "A area de documentos ou recursos costuma concentrar o valor da plataforma."
            ]
        },
        "Mentorias": {
            eyebrow: "Apoio acadêmico",
            helper: "Use os cards para preparar o acompanhamento e o apoio academico que ajudam na adaptacao e permanencia.",
            sectionTitle: "Fluxo de apoio",
            sectionDescription: "Esta fase organiza a entrada em atividades de mentoria, acompanhamento e suporte ao estudante.",
            summaryLabel: "Resumo do apoio",
            summaryStatus: "Acompanhamento pronto",
            summaryLead: "Mentoria organizada",
            nextStep: "Depois disso, o suporte academico fica mais facil de acessar quando surgir duvida ou necessidade.",
            overview: [
                { label: "Objetivo", value: "Ativar apoio" },
                { label: "Foco", value: "Acompanhamento" },
                { label: "Saida", value: "Suporte disponível" }
            ],
            beforeStart: [
                "Identifique qual canal de mentoria a instituição usa.",
                "Verifique como agendar ou solicitar atendimento.",
                "Tenha em mãos temas que você quer acompanhar de perto."
            ],
            highlights: [
                "Apoia adaptação e organização ao longo do semestre.",
                "Ajuda na resolução de problemas recorrentes.",
                "Cria ponto de contato para orientação acadêmica."
            ],
            taskContext: [
                "Entender o canal correto evita perder chamados ou agendamentos.",
                "Saber como solicitar ajuda reduz tempo de espera em momentos críticos.",
                "Reconhecer a área de acompanhamento facilita o uso recorrente.",
                "Definir temas ou demandas ajuda a tornar a mentoria mais objetiva."
            ]
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

    function getChecklistCopy(checklist) {
        return CHECKLIST_COPY[checklist.title] || {
            eyebrow: `Fase ${checklist.phase || 1}`,
            helper: checklist.description || "Conclua os itens abaixo para avançar na jornada academica.",
            sectionTitle: "Cards de conclusao",
            sectionDescription: "Marque cada card para atualizar o progresso em tempo real.",
            summaryLabel: "Resumo da fase",
            summaryStatus: checklist.completed ? "Checklist concluido" : "Checklist em andamento",
            summaryLead: "Fluxo operacional da fase",
            nextStep: "A conclusao desta fase libera o proximo bloco da jornada academica.",
            overview: [
                { label: "Objetivo", value: "Avancar na fase" },
                { label: "Foco", value: "Conclusao de tarefas" },
                { label: "Saida", value: "Progresso salvo" }
            ],
            beforeStart: [
                "Leia cada card antes de marcar como concluido.",
                "Confirme se o checklist corresponde ao momento atual da jornada.",
                "Use a barra de progresso para medir a evolucao."
            ],
            highlights: [
                "Progressao sincronizada com o banco e o cache local.",
                "Bloqueio automatico entre fases permanece ativo.",
                "A tela foi desenhada para leitura rapida e uso direto."
            ],
            taskContext: checklist.tasks.map(() => "Conclua este card para atualizar o progresso e liberar a proxima etapa.")
        };
    }

    function getTaskContext(copy, index) {
        return copy.taskContext[index] || copy.taskContext[copy.taskContext.length - 1] || "Conclua este card para atualizar o progresso da fase.";
    }

    function buildOverviewCards(copy) {
        return `
            <div class="detail-overview-grid">
                ${copy.overview.map(item => `
                    <article class="detail-overview-card">
                        <span class="detail-overview-label">${escapeHtml(item.label)}</span>
                        <strong class="detail-overview-value">${escapeHtml(item.value)}</strong>
                    </article>
                `).join("")}
            </div>
        `;
    }

    function buildTaskList(checklist, copy) {
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
                    <label class="detail-task-card ${task.completed ? "is-completed" : ""}">
                        <input
                            type="checkbox"
                            data-action="toggle-task"
                            data-checklist-id="${escapeHtml(checklist.id)}"
                            data-task-id="${escapeHtml(task.id)}"
                            ${task.completed ? "checked" : ""}
                        >
                        <span class="detail-task-badge" aria-hidden="true">
                            <i data-lucide="${task.completed ? "check-circle-2" : "circle"}"></i>
                        </span>
                        <span class="detail-task-copy">
                            <span class="detail-task-header">
                                <span class="detail-task-order">Card ${index + 1}</span>
                                <span class="detail-task-state ${task.completed ? "is-completed" : ""}">
                                    ${task.completed ? "Concluido" : "Pendente"}
                                </span>
                            </span>
                            <span class="detail-task-title">${escapeHtml(task.text)}</span>
                            <span class="detail-task-context">${escapeHtml(getTaskContext(copy, index))}</span>
                        </span>
                    </label>
                `).join("")}
            </div>
        `;
    }

    function buildSidePanel(checklist, copy) {
        const completedTasks = checklist.tasks.filter(task => task.completed).length;
        const totalTasks = checklist.tasks.length;
        const remainingTasks = Math.max(totalTasks - completedTasks, 0);

        return `
            <aside class="detail-side-panel">
                <div class="detail-summary-card">
                    <span class="detail-summary-label">${escapeHtml(copy.summaryLabel)}</span>
                    <strong class="detail-summary-value">${checklist.progress}%</strong>
                    <p class="detail-summary-lead">${escapeHtml(copy.summaryLead)}</p>
                    <div class="detail-progress">
                        <div class="detail-progress-bar">
                            <div class="detail-progress-fill" style="width: ${checklist.progress}%"></div>
                        </div>
                        <span class="detail-progress-text">${completedTasks}/${totalTasks} itens concluídos</span>
                    </div>
                    <div class="detail-summary-status ${checklist.completed ? "is-completed" : ""}">
                        ${checklist.completed ? "Checklist concluído" : copy.summaryStatus}
                    </div>
                </div>

                <div class="detail-support-card">
                    <div class="detail-section-heading">
                        <h3>Antes de começar</h3>
                        <p>Use este bloco para evitar retrabalho e marcar os cards na ordem correta.</p>
                    </div>
                    <ul class="detail-support-list">
                        ${copy.beforeStart.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
                    </ul>
                </div>

                <div class="detail-support-card detail-support-card--accent">
                    <div class="detail-section-heading">
                        <h3>O que esta fase entrega</h3>
                        <p>${escapeHtml(copy.nextStep)}</p>
                    </div>
                    <ul class="detail-support-list">
                        ${copy.highlights.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
                    </ul>
                    <div class="detail-next-step">
                        <span class="detail-next-step-label">Restam ${remainingTasks} cards</span>
                        <span class="detail-next-step-text">${escapeHtml(remainingTasks === 0 ? "Tudo pronto para a proxima fase." : "Continue para destravar o fluxo completo.")}</span>
                    </div>
                </div>
            </aside>
        `;
    }

    function buildChecklistLayout(checklist) {
        const copy = getChecklistCopy(checklist);

        return `
            <section class="checklist-detail-shell">
                <div class="detail-topbar">
                    <button class="btn btn-secondary detail-back-button" type="button" data-action="back-to-list">
                        <i data-lucide="arrow-left"></i>
                        Voltar
                    </button>
                    <div class="detail-topbar-actions">
                        <span class="detail-phase-badge">Fase ${escapeHtml(checklist.phase || 1)}</span>
                        <span class="detail-phase-badge detail-phase-badge--muted">
                            ${checklist.completed ? "Concluida" : "Em andamento"}
                        </span>
                    </div>
                </div>

                <div class="detail-hero">
                    <div class="detail-hero-copy">
                        <span class="detail-eyebrow">${escapeHtml(copy.eyebrow)}</span>
                        <h2>${escapeHtml(checklist.title)}</h2>
                        <p>${escapeHtml(copy.helper)}</p>
                    </div>
                    ${buildOverviewCards(copy)}
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
                    ${buildSidePanel(checklist, copy)}
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
