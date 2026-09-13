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
        "10000000-0000-4000-8000-000000000004": {
            eyebrow: "Biblioteca Virtual Pearson",
            helper: "Entre na Pearson pelo AVA, prepare o cadastro com seu e-mail institucional e confirme o acesso pesquisando e abrindo um livro.",
            sectionTitle: "Da entrada pelo AVA à primeira leitura",
            sectionDescription: "Consulte o caminho de acesso, o cadastro, a recuperação de senha e a busca no acervo.",
            summaryLabel: "Acesso à Pearson",
            summaryStatus: "Cadastro e leitura",
            summaryLead: "Conta preparada para consultar o acervo",
            nextStep: "Ao terminar, você conseguirá entrar na Pearson e abrir um livro para estudar. A próxima fase prepara o acesso ao Teams.",
            unlockNote: "A Biblioteca Virtual reúne o acervo para leitura, com recursos como favoritos e anotações.",
            overview: [
                { label: "Objetivo", value: "Abrir um livro na Pearson" },
                { label: "Foco", value: "Cadastro e busca no acervo" },
                { label: "Saída", value: "Primeira leitura acessível" }
            ],
            beforeStart: [
                "Comece pelo AVA da UniSales para manter o vínculo com a Biblioteca Virtual.",
                "Tenha acesso ao e-mail institucional para conferir a confirmação do cadastro.",
                "Escolha um título ou tema da sua disciplina para testar a busca."
            ],
            highlights: [
                "A entrada institucional da Pearson fica no AVA.",
                "O cadastro usa e-mail institucional e senha escolhida pelo aluno.",
                "A busca e a abertura de um livro confirmam que o acervo está acessível."
            ],
            taskContext: [
                "Entre no AVA e abra o acesso à Biblioteca Virtual até carregar a tela da Pearson.",
                "Cadastre o e-mail institucional, confira a mensagem recebida e escolha sua senha da Biblioteca.",
                "Confira o acesso e use a recuperação de senha com o e-mail ou CPF cadastrado quando precisar.",
                "Pesquise um livro, abra um resultado e reconheça os recursos de leitura disponíveis."
            ]
        },
        "10000000-0000-4000-8000-000000000005": {
            eyebrow: "Comunicação acadêmica",
            helper: "Use a conta @souunisales.com.br no Teams, encontre sua equipe e reconheça onde acompanhar comunicados, materiais e encontros.",
            sectionTitle: "Conta, equipe e comunicação",
            sectionDescription: "Confira a identidade institucional e os recursos que sua turma ou disciplina disponibiliza.",
            summaryLabel: "Acesso ao Teams",
            summaryStatus: "Conta e equipe conferidas",
            summaryLead: "Comunicação da turma acessível",
            nextStep: "Ao terminar, você saberá onde acompanhar sua turma no Teams. Depois, poderá explorar disciplinas e conteúdos no AVA.",
            unlockNote: "Consulte Teams e Outlook com a mesma conta acadêmica para acompanhar comunicados institucionais.",
            overview: [
                { label: "Objetivo", value: "Encontrar a equipe da turma" },
                { label: "Foco", value: "Conta e comunicação acadêmica" },
                { label: "Saída", value: "Canais e recursos localizados" }
            ],
            beforeStart: [
                "Entre com o endereço @souunisales.com.br e a senha da conta Microsoft acadêmica.",
                "Confira se a conta ativa é a mesma usada no Outlook institucional.",
                "Use o navegador ou aplicativo disponível no seu dispositivo."
            ],
            highlights: [
                "A conta acadêmica conecta Teams, Outlook e Microsoft 365.",
                "A equipe e os canais devem corresponder à sua turma ou disciplina.",
                "Problemas de acesso seguem para o Multiatendimento; dúvidas sobre a organização da disciplina, para a coordenação."
            ],
            taskContext: [
                "Abra o Teams e confirme que a conta @souunisales.com.br está ativa.",
                "Localize e abra a equipe correspondente à sua turma ou disciplina.",
                "Mantenha Teams e Outlook acessíveis para conferir os comunicados da conta institucional.",
                "Reconheça os canais, materiais e avisos de encontros disponíveis para a sua turma."
            ]
        },
        "10000000-0000-4000-8000-000000000006": {
            eyebrow: "Ambiente Virtual de Aprendizagem",
            helper: "Entre no AVA, confira as disciplinas em que está matriculado e localize os conteúdos, atividades e notas disponíveis.",
            sectionTitle: "Acesso, disciplinas e atividades",
            sectionDescription: "Siga do primeiro acesso até a abertura de uma disciplina e de seus recursos de aprendizagem.",
            summaryLabel: "Sua rotina no AVA",
            summaryStatus: "Disciplinas e conteúdos conferidos",
            summaryLead: "Materiais e atividades do curso acessíveis",
            nextStep: "Ao terminar, você saberá consultar conteúdos e atividades no AVA. A próxima fase apresenta a Monitoria e os canais de apoio acadêmico.",
            unlockNote: "Confira cada disciplina para acompanhar os materiais e atividades disponibilizados pelo professor.",
            overview: [
                { label: "Objetivo", value: "Consultar uma disciplina no AVA" },
                { label: "Foco", value: "Conteúdos, atividades e notas" },
                { label: "Saída", value: "Recursos da disciplina localizados" }
            ],
            beforeStart: [
                "Acesse o AVA a partir do site da UniSales.",
                "No primeiro acesso, use RA como usuário e CPF como senha inicial; depois, siga a troca de senha solicitada.",
                "Tenha em mente seu curso e período para conferir as disciplinas da home."
            ],
            highlights: [
                "A home reúne as disciplinas em que você está matriculado.",
                "Dentro da disciplina, consulte os conteúdos do professor e as Unidades de Aprendizagem disponíveis.",
                "Abra atividades para ler as instruções e reconheça onde consultar as notas disponíveis."
            ],
            taskContext: [
                "Entre com RA e a senha do AVA até carregar a home; no primeiro acesso, siga a troca da senha inicial.",
                "Confira as disciplinas da home e abra uma correspondente ao seu curso e período.",
                "Na disciplina, localize uma unidade ou conteúdo e abra pelo menos um material.",
                "Localize uma atividade ou avaliação e reconheça onde consultar notas quando estiverem disponíveis."
            ]
        },
        "10000000-0000-4000-8000-000000000007": {
            eyebrow: "Monitoria e apoio acadêmico",
            helper: "Entenda como a Monitoria ajuda nos estudos e nos sistemas acadêmicos, encontre monitor e horários e prepare sua dúvida.",
            sectionTitle: "Da dúvida ao canal de apoio",
            sectionDescription: "Identifique o apoio adequado e saiba como procurar e retornar ao monitor do seu curso.",
            summaryLabel: "Orientação para buscar apoio",
            summaryStatus: "Monitor e canal identificados",
            summaryLead: "Dúvida preparada para a Monitoria",
            nextStep: "Você encerra a trilha sabendo quando recorrer à Monitoria e onde consultar o canal e o horário de atendimento do seu curso.",
            unlockNote: "A Monitoria apoia dúvidas sobre disciplinas, métodos de estudo e recursos como AVA, Biblioteca Virtual e Portal.",
            overview: [
                { label: "Objetivo", value: "Saber quando procurar a Monitoria" },
                { label: "Foco", value: "Monitor, horário e dúvida" },
                { label: "Saída", value: "Canal de atendimento identificado" }
            ],
            beforeStart: [
                "Identifique a disciplina, tema ou sistema em que precisa de orientação.",
                "Consulte os monitores e horários divulgados para o seu curso.",
                "Confira o canal informado, como Teams, e-mail institucional ou atendimento presencial."
            ],
            highlights: [
                "Alunos monitores ajudam a comunidade acadêmica com estudos e recursos institucionais.",
                "Horários e canais variam conforme o curso e devem ser consultados na divulgação institucional.",
                "Uma dúvida com disciplina, tema e dificuldade identificados facilita a orientação."
            ],
            taskContext: [
                "Reconheça quando a dúvida é de Monitoria e quando precisa da coordenação ou do Multiatendimento.",
                "Localize o monitor relacionado ao seu curso e confira o horário e o canal de atendimento.",
                "Resuma a disciplina ou tema, a dúvida e o que você já tentou para levar ao monitor.",
                "Guarde onde consultar o canal e os horários para retornar ao monitor quando precisar."
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
        if (CHECKLIST_COPY[checklist.id]) return CHECKLIST_COPY[checklist.id];

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

    function buildGuideActionLink(action) {
        if (!action || !isSafeAccessUrl(action.url)) return "";

        return `
            <a
                class="guide-action-link"
                href="${escapeHtml(action.url)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                <i data-lucide="external-link" aria-hidden="true"></i>
                <span>${escapeHtml(action.label || "Abrir acesso")}</span>
                <i class="guide-action-link-arrow" data-lucide="arrow-up-right" aria-hidden="true"></i>
            </a>
        `;
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
        const access = buildGuideActionLink(guide.access);

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

    function buildGuideHelpItem(item) {
        const contactKey = item.action?.contact;
        const contact = contactKey ? window.UniCheckContacts?.[contactKey] : null;
        const action = contact ? buildGuideActionLink({
            label: item.action.label,
            url: contact.href
        }) : "";

        return `
            <div class="detail-guide-help-item">
                <strong>${escapeHtml(item.title)}</strong>
                <p>${escapeHtml(item.text)}</p>
                ${action}
            </div>
        `;
    }

    function buildCompletionControl(checklist, task) {
        const helperId = `completion-helper-${task.id}`;
        const errorId = `completion-error-${task.id}`;

        if (task.completed) {
            return `
                <section class="detail-completion-action is-completed" aria-label="Conclusão da etapa">
                    <button class="complete-task-button is-completed" type="button" disabled>
                        <i data-lucide="check-circle-2" aria-hidden="true"></i>
                        <span>Etapa concluída</span>
                    </button>
                    <p class="completion-helper">Seu progresso está protegido. Você pode revisar esta orientação quando quiser.</p>
                </section>
            `;
        }

        return `
            <section class="detail-completion-action" aria-label="Conclusão da etapa">
                <button
                    class="complete-task-button"
                    type="button"
                    data-action="complete-task"
                    data-completion-button
                    data-checklist-id="${escapeHtml(checklist.id)}"
                    data-task-id="${escapeHtml(task.id)}"
                    aria-describedby="${escapeHtml(helperId)} ${escapeHtml(errorId)}"
                    disabled
                >
                    <i data-lucide="check-circle" aria-hidden="true"></i>
                    <span data-completion-button-label>Concluir etapa</span>
                </button>
                <p class="completion-helper" id="${escapeHtml(helperId)}" data-completion-helper>
                    Confira as orientações acima para concluir.
                </p>
                <p class="completion-error" id="${escapeHtml(errorId)}" data-completion-error role="alert" hidden></p>
            </section>
        `;
    }

    function buildPhaseCompletion(checklist, options = {}) {
        if (!checklist.completed) return "";

        const nextTitle = options.nextChecklistTitle;
        const nextChecklistId = options.nextChecklistId;
        const nextCopy = nextTitle
            ? `<p>Próxima fase liberada: <strong>${escapeHtml(nextTitle)}</strong></p>`
            : "<p>Você concluiu todas as fases desta jornada.</p>";
        const nextAction = nextTitle && nextChecklistId ? `
            <button
                class="phase-next-button"
                type="button"
                data-action="open-checklist"
                data-checklist-id="${escapeHtml(nextChecklistId)}"
            >
                Ir para a próxima fase
                <i data-lucide="arrow-right" aria-hidden="true"></i>
            </button>
        ` : "";

        return `
            <section class="phase-completion-card" data-phase-completion aria-labelledby="phase-completion-title">
                <span class="phase-completion-icon" aria-hidden="true"><i data-lucide="badge-check"></i></span>
                <div>
                    <span class="phase-completion-kicker">Fase concluída</span>
                    <h4 id="phase-completion-title">${escapeHtml(checklist.title)}</h4>
                    ${nextCopy}
                    ${nextAction}
                </div>
            </section>
        `;
    }

    function buildSelectedTask(checklist, copy, selectedTaskId, options = {}) {
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

                    <section class="detail-guide-section detail-guide-completion" data-completion-observer>
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
                                ${help.map(buildGuideHelpItem).join("")}
                            </div>
                        </section>
                    ` : ""}

                    ${buildCompletionControl(checklist, task)}
                    ${buildPhaseCompletion(checklist, options)}
                </div>
            </article>
        `;
    }

    function getPhaseAccent(checklist) {
        const phaseIndex = Math.max((checklist.phase || 1) - 1, 0);
        return PHASE_ACCENTS[phaseIndex % PHASE_ACCENTS.length];
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
                    const isLocked = task.locked === true;
                    const stateLabel = isLocked ? "Bloqueada" : task.completed ? "Concluída" : "Pendente";
                    const stateIcon = isLocked ? "lock" : task.completed ? "check" : "circle";

                    return `
                        <li
                            class="detail-trail-item ${task.completed ? "is-completed" : ""} ${isSelected ? "is-selected" : ""} ${isLocked ? "is-locked" : ""}"
                            data-task-card
                            data-task-id="${escapeHtml(task.id)}"
                        >
                            <button
                                class="detail-trail-select"
                                type="button"
                                data-action="select-task"
                                data-checklist-id="${escapeHtml(checklist.id)}"
                                data-task-id="${escapeHtml(task.id)}"
                                aria-label="Etapa ${index + 1}, ${escapeHtml(title)}, ${stateLabel.toLowerCase()}${isSelected ? ", selecionada" : ""}"
                                aria-current="${isSelected ? "step" : "false"}"
                                aria-controls="checklist-selected-step"
                                ${isLocked ? "disabled" : ""}
                            >
                                <span class="detail-trail-check" aria-hidden="true">
                                    <i data-lucide="${stateIcon}"></i>
                                </span>
                                <span class="detail-trail-copy">
                                    <span class="detail-trail-meta">
                                        <span>Etapa ${getTaskNumber(index)}${isSelected ? " · selecionada" : ""}</span>
                                        <span>${stateLabel}</span>
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
        if (checklist.tasks.some(task => task.id === requestedTaskId && task.locked !== true)) {
            return requestedTaskId;
        }

        return checklist.tasks.find(task => !task.completed && task.locked !== true)?.id
            || checklist.tasks.find(task => task.locked !== true)?.id
            || null;
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
                </header>

                <div class="detail-workspace">
                    ${buildTrailPanel(checklist, copy, selectedTaskId)}
                    ${buildSelectedTask(checklist, copy, selectedTaskId, options)}
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
