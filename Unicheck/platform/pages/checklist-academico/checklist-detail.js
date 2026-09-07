(function () {
    const PHASE_ACCENTS = [
        { color: "#0b61ff", gradient: "linear-gradient(135deg, #0b61ff, #31b0ff)" },
        { color: "#06b6d4", gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)" },
        { color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6, #c084fc)" },
        { color: "#10b981", gradient: "linear-gradient(135deg, #10b981, #34d399)" },
        { color: "#4f46e5", gradient: "linear-gradient(135deg, #4f46e5, #818cf8)" },
        { color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)" },
        { color: "#ec4899", gradient: "linear-gradient(135deg, #ec4899, #fb7185)" }
    ];

    const CHECKLIST_COPY = {
        "Primeiros passos na faculdade": {
            eyebrow: "Onboarding da turma",
            helper: "Descubra com quem falar, entre no grupo certo e encontre as datas que orientam sua primeira semana.",
            sectionTitle: "Primeiros passos guiados",
            sectionDescription: "Selecione uma etapa para consultar a orientação sem perder de vista o restante da trilha.",
            summaryLabel: "Base da fase",
            summaryStatus: "Primeira semana em andamento",
            summaryLead: "Contatos e datas essenciais",
            nextStep: "Quando tudo estiver concluído, você seguirá para o Portal Acadêmico com a base da turma organizada.",
            unlockNote: "Esta etapa separa os combinados dos alunos dos canais e processos institucionais.",
            overview: [
                { label: "Objetivo", value: "Situar-se na turma" },
                { label: "Foco", value: "Pessoas e datas" },
                { label: "Saída", value: "Primeira semana orientada" }
            ],
            beforeStart: [
                "Consulte a etapa selecionada antes de marcá-la como concluída.",
                "Não compartilhe contatos ou conversas pessoais no checklist.",
                "Marque o card somente depois de conferir o critério de conclusão."
            ],
            highlights: [
                "Identifica o representante de turma sem atribuir funções indevidas.",
                "Diferencia o grupo dos alunos de um canal oficial da instituição.",
                "Leva ao calendário acadêmico e ao setor adequado."
            ],
            taskContext: [
                "Identificar o representante ajuda a encaminhar demandas coletivas da turma.",
                "Encontrar o grupo principal aproxima o aluno dos combinados feitos pelos colegas.",
                "Entrar no grupo correto reduz o risco de seguir informações de outra turma.",
                "Confirmar calendário e setores evita retrabalho e encaminhamentos incorretos."
            ]
        },
        "Portal Academico TOTVS": {
            eyebrow: "Portal do aluno",
            helper: "Siga os caminhos confirmados do Portal TOTVS para entrar, reconhecer a conta e localizar as consultas essenciais.",
            sectionTitle: "Portal TOTVS, clique a clique",
            sectionDescription: "Cada card mantém uma única conclusão, mesmo quando o guia apresenta vários passos de navegação.",
            summaryLabel: "Resumo do acesso",
            summaryStatus: "Acesso operacional",
            summaryLead: "Entrada e navegacao no portal",
            nextStep: "Depois dessa fase, o estudante ja consegue consultar rotinas, boletos, documentos e comunicados com autonomia.",
            unlockNote: "Com o portal dominado, a consulta diaria fica previsivel e segura.",
            overview: [
                { label: "Objetivo", value: "Entrar com seguranca" },
                { label: "Foco", value: "Navegacao e documentos" },
                { label: "Saida", value: "Portal dominado" }
            ],
            beforeStart: [
                "Use o endereço do Portal disponível no botão de acesso direto.",
                "Não misture a senha do Portal TOTVS com a conta do Microsoft 365.",
                "Você não precisa gerar boleto, requerimento ou documento para explorar os menus."
            ],
            highlights: [
                "Autenticacao com credenciais academicas.",
                "Localizacao rapida da central do aluno e menus principais.",
                "Identificacao dos relatorios e documentos mais usados."
            ],
            taskContext: [
                "Abrir o portal certo evita confusao com paginas espelho ou links antigos.",
                "O login inicial precisa de atencao para nao travar o primeiro acesso.",
                "Saber onde fica a navegacao principal acelera a consulta diaria.",
                "Encontrar documentos e relatorios evita dependencia do suporte."
            ]
        },
        "Configuracao de Email": {
            eyebrow: "Conta institucional",
            helper: "Descubra o endereço criado para você, entre na conta Microsoft correta e confirme que o e-mail envia e recebe.",
            sectionTitle: "E-mail institucional na prática",
            sectionDescription: "As instruções separam as credenciais do Microsoft 365 das credenciais usadas no Portal TOTVS.",
            summaryLabel: "Resumo da conta",
            summaryStatus: "Conta pronta",
            summaryLead: "Email institucional configurado",
            nextStep: "Com o email funcionando, voce reduz risco de perder avisos e recuperacoes importantes.",
            unlockNote: "Este canal e a principal linha oficial entre a instituicao e o aluno.",
            overview: [
                { label: "Objetivo", value: "Ativar o email" },
                { label: "Foco", value: "Acesso e validacao" },
                { label: "Saida", value: "Conta preparada" }
            ],
            beforeStart: [
                "Confirme o endereço real em Minha conta no AVA; não dependa apenas do padrão de nomes.",
                "Use o endereço @souunisales.com.br completo no Microsoft 365.",
                "Nunca envie senha, RA ou documentos na mensagem de teste."
            ],
            highlights: [
                "Evita perda de comunicados e boletos internos.",
                "Facilita recuperacao de senha e notificacoes.",
                "Ajuda a separar comunicacao pessoal da academica."
            ],
            taskContext: [
                "A conta institucional deve abrir sem erro antes de configurar o restante.",
                "Validar credenciais evita bloqueio futuro por falha de digitacao.",
                "A navegacao correta garante que mensagens e sistemas sejam encontrados facilmente.",
                "Documentos e avisos geralmente chegam por este canal, entao vale confirmar tudo."
            ]
        },
        "Biblioteca Virtual": {
            eyebrow: "Acesso a pesquisa",
            helper: "Organize o acesso aos recursos de biblioteca e consulta academica em cards curtos e diretos.",
            sectionTitle: "Acesso e pesquisa",
            sectionDescription: "Esses cards representam a preparacao para usar bases, acervo e servicos de apoio a pesquisa.",
            summaryLabel: "Resumo do acesso",
            summaryStatus: "Pesquisa liberada",
            summaryLead: "Biblioteca pronta para consulta",
            nextStep: "Quando essa fase terminar, a busca por livros, artigos e documentos fica mais simples.",
            unlockNote: "Aqui o aluno ganha mais autonomia para estudar com profundidade.",
            overview: [
                { label: "Objetivo", value: "Usar a biblioteca" },
                { label: "Foco", value: "Pesquisa e acervo" },
                { label: "Saida", value: "Consulta habilitada" }
            ],
            beforeStart: [
                "Separe seus dados de login academico, se a biblioteca exigir autenticacao.",
                "Verifique se a instituicao usa catalogo, base digital ou ambos.",
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
            eyebrow: "Comunicacao da turma",
            helper: "Configure a rotina de comunicacao e uso do Teams para aula, avisos e encontros com a turma.",
            sectionTitle: "Rotina de comunicacao",
            sectionDescription: "Os cards abaixo ajudam a montar um fluxo minimamente confiavel para mensagens e reunioes.",
            summaryLabel: "Resumo da comunicacao",
            summaryStatus: "Canal pronto",
            summaryLead: "Teams configurado para uso academico",
            nextStep: "Depois de concluir, a turma ganha um canal consistente para encontros, avisos e compartilhamento.",
            unlockNote: "Quando o canal certo esta pronto, o caos de mensagens soltas cai muito.",
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
                "Reduz a dependencia de mensagens soltas em outros apps."
            ],
            taskContext: [
                "Entrar com a conta correta evita misturar contatos pessoais e institucionais.",
                "Validar credenciais garante que a conta esta pronta para aulas e grupos.",
                "Saber onde fica a navegacao principal acelera a entrada em equipes e canais.",
                "Materiais e comunicados tendem a ficar em canais especificos do curso."
            ]
        },
        "Plataforma A+": {
            eyebrow: "Ferramenta complementar",
            helper: "Siga os cards para deixar o acesso a Plataforma A+ pronto e sem pendencias.",
            sectionTitle: "Uso complementar",
            sectionDescription: "A fase cobre a configuracao minima para operar uma ferramenta adicional da rotina academica.",
            summaryLabel: "Resumo da plataforma",
            summaryStatus: "Ambiente preparado",
            summaryLead: "Plataforma complementar ativa",
            nextStep: "Com esta fase pronta, o usuario passa a navegar melhor entre as ferramentas da jornada.",
            unlockNote: "Aqui a jornada ganha profundidade sem sair do fluxo principal.",
            overview: [
                { label: "Objetivo", value: "Liberar acesso" },
                { label: "Foco", value: "Configuracao final" },
                { label: "Saida", value: "Ferramenta pronta" }
            ],
            beforeStart: [
                "Confirme qual ferramenta complementar esta sendo usada pela instituicao.",
                "Verifique se existe login unico ou credenciais especificas.",
                "Separe os dados de acesso e permissoes exigidas."
            ],
            highlights: [
                "Evita falha de acesso na primeira tentativa.",
                "Ajuda a mapear permissoes e recursos essenciais.",
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
            eyebrow: "Apoio academico",
            helper: "Use os cards para preparar o acompanhamento e o apoio academico que ajudam na adaptacao e permanencia.",
            sectionTitle: "Fluxo de apoio",
            sectionDescription: "Esta fase organiza a entrada em atividades de mentoria, acompanhamento e suporte ao estudante.",
            summaryLabel: "Resumo do apoio",
            summaryStatus: "Acompanhamento pronto",
            summaryLead: "Mentoria organizada",
            nextStep: "Depois disso, o suporte academico fica mais facil de acessar quando surgir duvida ou necessidade.",
            unlockNote: "A ultima fase reforca permanencia, orientacao e seguranca na rotina.",
            overview: [
                { label: "Objetivo", value: "Ativar apoio" },
                { label: "Foco", value: "Acompanhamento" },
                { label: "Saida", value: "Suporte disponivel" }
            ],
            beforeStart: [
                "Identifique qual canal de mentoria a instituicao usa.",
                "Verifique como agendar ou solicitar atendimento.",
                "Tenha em mao temas que voce quer acompanhar de perto."
            ],
            highlights: [
                "Apoia adaptacao e organizacao ao longo do semestre.",
                "Ajuda na resolucao de problemas recorrentes.",
                "Cria ponto de contato para orientacao academica."
            ],
            taskContext: [
                "Entender o canal correto evita perder chamados ou agendamentos.",
                "Saber como solicitar ajuda reduz tempo de espera em momentos criticos.",
                "Reconhecer a area de acompanhamento facilita o uso recorrente.",
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

    function normalizeTitleKey(value) {
        return String(value ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, " ")
            .trim();
    }

    function getChecklistCopy(checklist) {
        const normalizedTitle = normalizeTitleKey(checklist.title);
        const copyEntry = Object.entries(CHECKLIST_COPY).find(([title]) => normalizeTitleKey(title) === normalizedTitle);

        return copyEntry ? copyEntry[1] : {
            eyebrow: `Fase ${checklist.phase || 1}`,
            helper: checklist.description || "Conclua os itens abaixo para avancar na jornada academica.",
            sectionTitle: "Cards de conclusao",
            sectionDescription: "Marque cada card para atualizar o progresso em tempo real.",
            summaryLabel: "Resumo da fase",
            summaryStatus: checklist.completed ? "Checklist concluido" : "Checklist em andamento",
            summaryLead: "Fluxo operacional da fase",
            nextStep: "A conclusao desta fase libera o proximo bloco da jornada academica.",
            unlockNote: "O bloqueio sequencial permanece ativo para garantir uma ordem clara.",
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

    function getTaskGuide(taskId) {
        return window.UniCheckChecklistContent?.getGuide?.(taskId) || null;
    }

    function getTaskNumber(index) {
        return String(index + 1).padStart(2, "0");
    }

    function isSafeAccessUrl(value) {
        return typeof value === "string" && /^https:\/\/[^\s<>"']+$/i.test(value);
    }

    function isSafeImageSource(value) {
        return typeof value === "string" && /^(?:\.{1,2}\/|\/)[^<>"']+$/i.test(value);
    }

    function buildGuideStep(step) {
        const screenshot = isSafeImageSource(step.image) ? `
            <figure class="detail-guide-figure">
                <img src="${escapeHtml(step.image)}" alt="${escapeHtml(step.imageAlt || step.text)}" loading="lazy">
                ${step.imageCaption ? `<figcaption>${escapeHtml(step.imageCaption)}</figcaption>` : ""}
            </figure>
        ` : "";

        return `
            <li class="detail-guide-step">
                <span class="detail-guide-step-marker" aria-hidden="true"></span>
                <div class="detail-guide-step-copy">
                    <p>${escapeHtml(step.text)}</p>
                    ${step.path ? `<code>${escapeHtml(step.path)}</code>` : ""}
                    ${screenshot}
                </div>
            </li>
        `;
    }

    function createFallbackGuide(task, copy, index) {
        return {
            title: task.text,
            description: getTaskContext(copy, index),
            nextAction: task.text,
            steps: [],
            completionCriteria: "A atividade foi realizada e o resultado foi conferido.",
            whyItMatters: "Concluir esta etapa mantém sua jornada acadêmica organizada.",
            quickHelp: []
        };
    }

    function buildGuideMetadata(guide) {
        const metadata = [
            guide.where ? { icon: "map-pin", label: "Local", value: guide.where } : null,
            guide.credential ? { icon: "key-round", label: "Acesso", value: guide.credential } : null
        ].filter(Boolean);
        const access = guide.access && isSafeAccessUrl(guide.access.url) ? `
            <a class="detail-guide-link" href="${escapeHtml(guide.access.url)}" target="_blank" rel="noopener noreferrer">
                ${escapeHtml(guide.access.label || "Abrir acesso")}
                <i data-lucide="arrow-up-right" aria-hidden="true"></i>
            </a>
        ` : "";

        if (!metadata.length && !access) return "";

        return `
            <div class="detail-guide-meta-row">
                ${metadata.map(item => `
                    <span class="detail-guide-meta">
                        <i data-lucide="${item.icon}" aria-hidden="true"></i>
                        <span><small>${escapeHtml(item.label)}:</small>${escapeHtml(item.value)}</span>
                    </span>
                `).join("")}
                ${access}
            </div>
        `;
    }

    function buildSelectedTask(checklist, copy, selectedTaskId) {
        const selectedIndex = Math.max(checklist.tasks.findIndex(task => task.id === selectedTaskId), 0);
        const task = checklist.tasks[selectedIndex];
        if (!task) {
            return `
                <section class="detail-stage-panel detail-stage-panel--empty" id="checklist-selected-step" tabindex="-1">
                    <i data-lucide="clipboard-x" aria-hidden="true"></i>
                    <p>Esta fase ainda não possui etapas cadastradas.</p>
                </section>
            `;
        }

        const guide = getTaskGuide(task.id) || createFallbackGuide(task, copy, selectedIndex);
        const titleId = `checklist-selected-title-${task.id}`;
        const steps = guide.steps || [];
        const help = guide.quickHelp || [];

        return `
            <article
                class="detail-stage-panel"
                id="checklist-selected-step"
                data-selected-task-id="${escapeHtml(task.id)}"
                tabindex="-1"
                aria-labelledby="${escapeHtml(titleId)}"
            >
                <button class="detail-mobile-back" type="button" data-action="back-to-trail">
                    <i data-lucide="arrow-left" aria-hidden="true"></i>
                    Voltar para a trilha
                </button>

                <header class="detail-stage-header">
                    <div class="detail-stage-kicker">
                        <span>Etapa ${getTaskNumber(selectedIndex)} de ${String(checklist.tasks.length).padStart(2, "0")}</span>
                        <span class="detail-task-state ${task.completed ? "is-completed" : ""}">
                            <i data-lucide="${task.completed ? "check-circle-2" : "circle-dashed"}" aria-hidden="true"></i>
                            ${task.completed ? "Concluída" : "Pendente"}
                        </span>
                    </div>
                    <h3 id="${escapeHtml(titleId)}">${escapeHtml(guide.title)}</h3>
                    ${guide.description ? `<p>${escapeHtml(guide.description)}</p>` : ""}
                </header>

                <div class="detail-guide-body">
                    <section class="detail-guide-action" aria-labelledby="detail-action-title-${escapeHtml(task.id)}">
                        <h4 id="detail-action-title-${escapeHtml(task.id)}">
                            <i data-lucide="mouse-pointer-click" aria-hidden="true"></i>
                            O que fazer agora
                        </h4>
                        <p>${escapeHtml(guide.nextAction)}</p>
                        ${buildGuideMetadata(guide)}
                    </section>

                    ${steps.length ? `
                        <section class="detail-guide-section">
                            <h4><i data-lucide="list-ordered" aria-hidden="true"></i>Como fazer</h4>
                            <ol class="detail-guide-steps">
                                ${steps.map(buildGuideStep).join("")}
                            </ol>
                        </section>
                    ` : ""}

                    <section class="detail-guide-section detail-guide-completion">
                        <h4><i data-lucide="badge-check" aria-hidden="true"></i>Você terminou quando</h4>
                        <p>${escapeHtml(guide.completionCriteria)}</p>
                    </section>

                    ${guide.whyItMatters ? `
                        <section class="detail-guide-section detail-guide-why">
                            <h4>Por que isso importa</h4>
                            <p>${escapeHtml(guide.whyItMatters)}</p>
                        </section>
                    ` : ""}

                    ${help.length ? `
                        <section class="detail-guide-section detail-guide-help">
                            <h4><i data-lucide="lightbulb" aria-hidden="true"></i>Importante</h4>
                            <div class="detail-guide-help-list">
                                ${help.map(item => `
                                    <div class="detail-guide-help-item">
                                        <strong>${escapeHtml(item.title)}</strong>
                                        <p>${escapeHtml(item.text)}</p>
                                    </div>
                                `).join("")}
                            </div>
                        </section>
                    ` : ""}
                </div>
            </article>
        `;
    }

    function getPhaseAccent(checklist) {
        const phaseIndex = Math.max((checklist.phase || 1) - 1, 0);
        return PHASE_ACCENTS[phaseIndex % PHASE_ACCENTS.length];
    }

    function buildOverview(copy) {
        return `
            <dl class="detail-overview-list">
                ${copy.overview.map(item => `
                    <div>
                        <dt>${escapeHtml(item.label)}</dt>
                        <dd>${escapeHtml(item.value)}</dd>
                    </div>
                `).join("")}
            </dl>
        `;
    }

    function buildTrailList(checklist, selectedTaskId) {
        if (!checklist.tasks.length) {
            return `
                <div class="detail-empty-state">
                    <i data-lucide="clipboard-x"></i>
                    <p>Este checklist ainda nao possui itens cadastrados.</p>
                </div>
            `;
        }

        return `
            <ol class="detail-trail-list">
                ${checklist.tasks.map((task, index) => {
                    const guide = getTaskGuide(task.id);
                    const title = guide?.title || task.text;
                    const isSelected = task.id === selectedTaskId;

                    return `
                        <li
                            class="detail-trail-item ${task.completed ? "is-completed" : ""} ${isSelected ? "is-selected" : ""}"
                            data-task-card
                            data-task-id="${escapeHtml(task.id)}"
                        >
                            <label class="detail-task-check" title="${task.completed ? "Desmarcar etapa" : "Marcar etapa como concluída"}">
                                <input
                                    type="checkbox"
                                    data-action="toggle-task"
                                    data-checklist-id="${escapeHtml(checklist.id)}"
                                    data-task-id="${escapeHtml(task.id)}"
                                    aria-label="${task.completed ? "Desmarcar" : "Marcar"} ${escapeHtml(title)} como concluída"
                                    ${task.completed ? "checked" : ""}
                                >
                                <span class="detail-trail-check" aria-hidden="true">
                                    <i data-lucide="check"></i>
                                </span>
                            </label>
                            <button
                                class="detail-trail-select"
                                type="button"
                                data-action="select-task"
                                data-checklist-id="${escapeHtml(checklist.id)}"
                                data-task-id="${escapeHtml(task.id)}"
                                aria-current="${isSelected ? "step" : "false"}"
                                aria-controls="checklist-selected-step"
                            >
                                <span class="detail-trail-copy">
                                    <span class="detail-trail-meta">
                                        <span>Etapa ${getTaskNumber(index)}${isSelected ? " · selecionada" : ""}</span>
                                        <span>${task.completed ? "Concluída" : "Pendente"}</span>
                                    </span>
                                    <strong>${escapeHtml(title)}</strong>
                                </span>
                                <i data-lucide="chevron-right" aria-hidden="true"></i>
                            </button>
                        </li>
                    `;
                }).join("")}
            </ol>
        `;
    }

    function buildTrailPanel(checklist, copy, selectedTaskId) {
        const completedTasks = checklist.tasks.filter(task => task.completed).length;
        const totalTasks = checklist.tasks.length;

        return `
            <aside class="detail-trail-panel" aria-labelledby="detail-trail-title">
                <div class="detail-trail-heading">
                    <div>
                        <span class="detail-trail-kicker">Fase ${escapeHtml(checklist.phase || 1)}</span>
                        <h3 id="detail-trail-title">Sua trilha</h3>
                    </div>
                    <p data-progress-count>${completedTasks} de ${totalTasks} concluídas</p>
                </div>
                <div
                    class="detail-progress-bar"
                    role="progressbar"
                    aria-label="Progresso da fase"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow="${escapeHtml(checklist.progress || 0)}"
                >
                    <div class="detail-progress-fill" data-progress-fill style="width: ${checklist.progress}%"></div>
                </div>
                <nav aria-label="Etapas da fase">
                    ${buildTrailList(checklist, selectedTaskId)}
                </nav>
                <div class="detail-trail-footer">
                    <i data-lucide="flag" aria-hidden="true"></i>
                    <p>${escapeHtml(copy.nextStep)}</p>
                </div>
            </aside>
        `;
    }

    function resolveSelectedTaskId(checklist, requestedTaskId) {
        if (checklist.tasks.some(task => task.id === requestedTaskId)) {
            return requestedTaskId;
        }

        return checklist.tasks.find(task => !task.completed)?.id || checklist.tasks[0]?.id || null;
    }

    function buildChecklistLayout(checklist, options = {}) {
        const copy = getChecklistCopy(checklist);
        const accent = getPhaseAccent(checklist);
        const selectedTaskId = resolveSelectedTaskId(checklist, options.selectedTaskId);
        const mobileStageClass = options.mobileStageOpen ? "is-mobile-stage-open" : "";

        return `
            <section
                class="checklist-detail-shell ${mobileStageClass}"
                style="--phase-accent: ${accent.gradient}; --phase-accent-color: ${accent.color};"
                data-resolved-task-id="${escapeHtml(selectedTaskId || "")}"
            >
                <div class="detail-topbar">
                    <button class="btn btn-secondary detail-back-button" type="button" data-action="back-to-list">
                        <i data-lucide="arrow-left" aria-hidden="true"></i>
                        Todas as fases
                    </button>
                </div>

                <header class="detail-hero">
                    <div class="detail-hero-copy">
                        <div class="detail-hero-kicker">
                            <span class="detail-eyebrow">${escapeHtml(copy.eyebrow)}</span>
                            <span class="detail-phase-label">Fase ${escapeHtml(checklist.phase || 1)}</span>
                        </div>
                        <h2>${escapeHtml(checklist.title)}</h2>
                        <p>${escapeHtml(copy.helper)}</p>
                    </div>
                    ${buildOverview(copy)}
                </header>

                <div class="detail-workspace">
                    ${buildTrailPanel(checklist, copy, selectedTaskId)}
                    ${buildSelectedTask(checklist, copy, selectedTaskId)}
                </div>
            </section>
        `;
    }

    function render(container, checklist, options = {}) {
        if (!container || !checklist) {
            return null;
        }

        const selectedTaskId = resolveSelectedTaskId(checklist, options.selectedTaskId);
        container.innerHTML = buildChecklistLayout(checklist, {
            ...options,
            selectedTaskId
        });

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

        return selectedTaskId;
    }

    window.UniCheckChecklistDetail = {
        render
    };
})();
