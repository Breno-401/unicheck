(function () {
    const STORAGE_KEY = "unicheck_checklist_progress_v3";
    const PENDING_SYNC_KEY = "unicheck_checklist_pending_sync_v2";
    const ROUTE_PREFIX = "#checklist=";
    const FALLBACK_IMAGE = "../../assets/images/logo.png";
    const MIN_TASK_DWELL_MS = 6000;
    const AUTO_ADVANCE_DELAY_MS = 760;
    const PHASE_ACCENTS = [
        { color: "#0b61ff", gradient: "linear-gradient(135deg, #0b61ff, #31b0ff)" },
        { color: "#06b6d4", gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)" },
        { color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6, #c084fc)" },
        { color: "#10b981", gradient: "linear-gradient(135deg, #10b981, #34d399)" },
        { color: "#4f46e5", gradient: "linear-gradient(135deg, #4f46e5, #818cf8)" },
        { color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)" },
        { color: "#ec4899", gradient: "linear-gradient(135deg, #ec4899, #fb7185)" }
    ];

    const checklistImages = {
        "Portal Academico TOTVS": "../../assets/images/TOTVS.jpg",
        "Configuracao de Email": "../../assets/images/outlook.png",
        "Biblioteca Virtual": "../../assets/images/bibliotecaV.png",
        "Microsoft Teams": "../../assets/images/MicrosoftT.png",
        "Plataforma A+": "../../assets/images/platafromaA.png",
        "Mentorias": "../../assets/images/logo.png"
    };

    const cardCopy = {
        "Primeiros passos na faculdade": {
            eyebrow: "Onboarding da turma",
            description: "Identifique o representante, entre no grupo certo e encontre as datas e os setores que orientam a primeira semana.",
            highlights: ["Representante de turma", "Grupo dos alunos", "Calendário acadêmico", "Coordenação ou secretaria"],
            footnote: "Esta fase separa os combinados da turma dos processos institucionais.",
            unlockHint: "Prepara contatos e datas antes dos acessos acadêmicos."
        },
        "Portal Academico TOTVS": {
            eyebrow: "Portal do aluno",
            description: "Entre no Portal TOTVS e aprenda os caminhos reais para notas, faltas, grade, requerimentos, relatórios e financeiro.",
            highlights: ["RA e primeiro acesso", "Notas e faltas", "Grade curricular", "Secretaria e financeiro"],
            footnote: "Os guias usam os mesmos nomes exibidos nos menus do Portal.",
            unlockHint: "Torna as consultas do Portal do Aluno previsíveis."
        },
        "Configuracao de Email": {
            eyebrow: "Email institucional",
            description: "Descubra seu endereço real, entre na conta Microsoft 365 correta e valide o envio e o recebimento de mensagens.",
            highlights: ["Minha conta no AVA", "@souunisales.com.br", "Microsoft 365", "Teste de mensagens"],
            footnote: "As credenciais desta fase são tratadas separadamente do Portal TOTVS.",
            unlockHint: "Confirma o canal institucional antes das outras plataformas."
        },
        "Biblioteca Virtual": {
            eyebrow: "Pesquisa e acervo",
            description: "Organize o acesso ao acervo digital e deixe a busca por livros, artigos e bases rapida e confiavel.",
            highlights: ["Acervo digital", "Artigos e livros", "Busca por disciplina", "Materiais da area"],
            footnote: "Uma biblioteca pronta reduz tempo perdido nas primeiras pesquisas.",
            unlockHint: "Abre caminho para leitura, consulta e pesquisa academica."
        },
        "Microsoft Teams": {
            eyebrow: "Comunicacao da turma",
            description: "Configure equipes, canais e alertas para transformar o Teams no centro da comunicacao da turma.",
            highlights: ["Equipe da disciplina", "Arquivos e canais", "Aulas e avisos", "Reunioes online"],
            footnote: "A rotina de aula fica mais fluida quando o canal certo ja esta pronto.",
            unlockHint: "Integra avisos, encontros e compartilhamento de arquivos."
        },
        "Plataforma A+": {
            eyebrow: "Ferramenta complementar",
            description: "Conclua o acesso inicial e deixe a plataforma complementar pronta para materiais e recursos extras.",
            highlights: ["Acesso inicial", "Materiais extras", "Uso complementar", "Permissoes validas"],
            footnote: "Essa etapa amplia os recursos sem fragmentar a experiencia do aluno.",
            unlockHint: "Completa a malha de ferramentas complementares."
        },
        "Mentorias": {
            eyebrow: "Apoio academico",
            description: "Encontre o canal de apoio, entenda como agendar e deixe claro quando e como pedir suporte.",
            highlights: ["Canal de apoio", "Agendamento", "Acompanhamento", "Orientacao recorrente"],
            footnote: "A mentoria fecha a jornada com suporte continuo e mais seguranca.",
            unlockHint: "Entrega o ultimo nivel de apoio para o semestre."
        }
    };

    const state = {
        rawChecklists: [],
        checklists: [],
        progress: {},
        searchTerm: "",
        user: null,
        currentChecklistId: null,
        selectedTaskIds: {},
        mobileStageOpen: false,
        syncInFlight: false,
        completionInFlight: new Set(),
        sessionCompletions: new Map(),
        taskGate: null,
        autoAdvanceTimer: null,
        recentlyUnlockedChecklistId: null,
        initialized: false
    };

    const refs = {
        pageContent: null,
        listView: null,
        grid: null,
        detailView: null,
        detailContent: null,
        searchInput: null
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

    function getStoredProgressKey(userId) {
        return `${STORAGE_KEY}:${userId || "anonymous"}`;
    }

    function getStoredProgress(userId) {
        if (!userId) {
            return {};
        }

        if (window.UniCheckChecklist?.readCachedProgress) {
            return window.UniCheckChecklist.readCachedProgress(userId);
        }

        try {
            const raw = localStorage.getItem(getStoredProgressKey(userId));
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            console.error("Erro ao ler progresso dos checklists:", error);
            return {};
        }
    }

    function saveStoredProgress(userId) {
        if (!userId) {
            return false;
        }

        try {
            if (window.UniCheckChecklist?.writeCachedProgress) {
                return window.UniCheckChecklist.writeCachedProgress(userId, state.progress) !== false;
            }
            localStorage.setItem(getStoredProgressKey(userId), JSON.stringify(state.progress));
            return true;
        } catch (error) {
            console.error("Erro ao salvar progresso dos checklists:", error);
            return false;
        }
    }

    function getPendingSyncKey(userId) {
        return `${PENDING_SYNC_KEY}:${userId}`;
    }

    function getPendingSync(userId) {
        if (!userId) return {};
        if (window.UniCheckChecklist?.readPendingProgress) {
            return window.UniCheckChecklist.readPendingProgress(userId);
        }
        try {
            const raw = localStorage.getItem(getPendingSyncKey(userId));
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            console.error("[UniCheckChecklistView] Erro ao ler fila de sincronizacao", error);
            return {};
        }
    }

    function savePendingSync(userId, pending) {
        if (!userId) return false;
        if (window.UniCheckChecklist?.writePendingProgress) {
            return window.UniCheckChecklist.writePendingProgress(userId, pending) !== false;
        }
        try {
            localStorage.setItem(getPendingSyncKey(userId), JSON.stringify(pending));
            return true;
        } catch (error) {
            console.error("[UniCheckChecklistView] Erro ao salvar fila de sincronizacao", error);
            return false;
        }
    }

    function queuePendingSync(checklistId, taskId, completed) {
        const userId = state.user?.id;
        if (!userId || completed !== true) return false;
        const pending = getPendingSync(userId);
        pending[taskId] = { checklistId, completed: true };
        return savePendingSync(userId, pending) !== false;
    }

    function clearPendingSync(taskId, completed) {
        const userId = state.user?.id;
        if (!userId) return;
        const pending = getPendingSync(userId);
        if (pending[taskId]?.completed !== Boolean(completed)) return;
        delete pending[taskId];
        return savePendingSync(userId, pending);
    }

    async function flushPendingSync() {
        const userId = state.user?.id;
        if (!userId || state.syncInFlight) return;
        const snapshot = getPendingSync(userId);
        const entries = Object.entries(snapshot).map(([taskId, value]) => ({
            userId,
            checklistId: value.checklistId,
            taskId,
            completed: true
        })).filter(entry => snapshot[entry.taskId]?.completed === true);
        if (!entries.length) return;

        state.syncInFlight = true;
        let synced = false;
        try {
            if (window.UniCheckChecklist.flushPendingProgress) {
                await window.UniCheckChecklist.flushPendingProgress(userId);
            } else {
                await window.UniCheckChecklist.completeProgressBatch(entries);
                entries.forEach(entry => clearPendingSync(entry.taskId, entry.completed));
            }
            synced = true;
        } catch (error) {
            if (!error?.unicheckChecklistLogged) {
                console.error("[UniCheckChecklistView] Sincronizacao remota pendente; progresso local preservado", {
                    message: error?.message || String(error),
                    code: error?.code || null,
                    itemCount: entries.length,
                    userId
                });
            }
        } finally {
            state.syncInFlight = false;
            if (synced && Object.keys(getPendingSync(userId)).length) {
                void flushPendingSync();
            }
        }
    }

    function mergeProgressMaps(remoteMap = {}, localMap = {}) {
        let merged;
        if (window.UniCheckChecklist?.reconcileProgressMaps) {
            merged = window.UniCheckChecklist.reconcileProgressMaps(
                remoteMap,
                localMap,
                getPendingSync(state.user?.id)
            );
        } else {
            merged = JSON.parse(JSON.stringify(remoteMap || {}));
            Object.entries(getPendingSync(state.user?.id)).forEach(([taskId, pending]) => {
                if (!pending?.checklistId || pending.completed !== true) return;
                merged[pending.checklistId] ||= { tasks: {} };
                merged[pending.checklistId].tasks ||= {};
                merged[pending.checklistId].tasks[taskId] = true;
            });
        }
        state.sessionCompletions.forEach((checklistId, taskId) => {
            merged[checklistId] ||= { tasks: {} };
            merged[checklistId].tasks ||= {};
            merged[checklistId].tasks[taskId] = true;
        });
        return merged;
    }

    function resolveChecklistImage(checklist) {
        if (checklist.imageUrl) {
            return checklist.imageUrl;
        }

        const normalizedTitle = normalizeTitleKey(checklist.title);
        const imageEntry = Object.entries(checklistImages).find(([title]) => normalizeTitleKey(title) === normalizedTitle);

        return imageEntry ? imageEntry[1] : FALLBACK_IMAGE;
    }

    function getCardCopy(checklist) {
        const normalizedTitle = normalizeTitleKey(checklist.title);
        const copyEntry = Object.entries(cardCopy).find(([title]) => normalizeTitleKey(title) === normalizedTitle);

        return copyEntry ? copyEntry[1] : {
            eyebrow: `Fase ${checklist.phase || 1}`,
            description: checklist.description || "Card de conclusao da fase academica.",
            highlights: ["Progresso sincronizado", "Fluxo continuo", "Checklist objetivo"],
            footnote: "Conclua os itens para avanzar com seguranca.",
            unlockHint: "Mantem o fluxo sequencial entre as fases."
        };
    }

    function getPhaseAccent(index) {
        return PHASE_ACCENTS[index % PHASE_ACCENTS.length];
    }

    function getChecklistStats(checklist) {
        const completedTasks = checklist.tasks.filter(task => task.completed).length;
        const totalTasks = checklist.tasks.length;
        const remainingTasks = Math.max(totalTasks - completedTasks, 0);

        return {
            completedTasks,
            totalTasks,
            remainingTasks
        };
    }

    function matchesSearch(checklist, searchTerm) {
        if (!searchTerm) {
            return true;
        }

        const copy = getCardCopy(checklist);
        const guideContent = (checklist.tasks || []).flatMap(task => {
            const guide = window.UniCheckChecklistContent?.getGuide?.(task.id);
            if (!guide) return [];
            return [
                guide.title,
                guide.description,
                guide.nextAction,
                guide.where,
                guide.completionCriteria,
                guide.whyItMatters,
                ...(guide.steps || []).flatMap(step => [step.text, step.path]),
                ...(guide.quickHelp || []).flatMap(item => [item.title, item.text])
            ];
        });
        const haystack = [
            checklist.title,
            checklist.description,
            copy.description,
            copy.eyebrow,
            ...(checklist.tasks || []).map(task => task.text),
            ...guideContent
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return haystack.includes(searchTerm.toLowerCase());
    }

    function hydrateChecklists() {
        state.checklists = window.UniCheckChecklist
            .applyProgress(state.rawChecklists, state.progress)
            .map((checklist, index) => ({
                ...checklist,
                imageUrl: resolveChecklistImage(checklist),
                accent: getPhaseAccent(index)
            }));
    }

    function getChecklistById(checklistId) {
        return state.checklists.find(checklist => checklist.id === checklistId) || null;
    }

    function getRouteChecklistId() {
        if (!window.location.hash.startsWith(ROUTE_PREFIX)) {
            return null;
        }

        return decodeURIComponent(window.location.hash.slice(ROUTE_PREFIX.length));
    }

    function updateRoute(checklistId) {
        const basePath = `${window.location.pathname}${window.location.search}`;
        const nextUrl = checklistId
            ? `${basePath}${ROUTE_PREFIX}${encodeURIComponent(checklistId)}`
            : basePath;

        window.history.pushState({ checklistId: checklistId || null }, "", nextUrl);
    }

    function createCardActionLabel(checklist) {
        if (checklist.locked) {
            return { icon: "lock", label: "Bloqueado" };
        }

        if (checklist.completed) {
            return { icon: "check-circle", label: "Revisar fase" };
        }

        return {
            icon: "arrow-right",
            label: checklist.progress > 0 ? "Continuar" : "Iniciar"
        };
    }

    function buildChecklistCard(checklist, index) {
        const action = createCardActionLabel(checklist);
        const copy = getCardCopy(checklist);
        const stats = getChecklistStats(checklist);
        const nextChecklist = state.checklists[index + 1] || null;
        const lockMessage = index === 0
            ? "Sempre liberado"
            : "Complete a fase anterior para liberar esta etapa";

        return `
            <article
                class="platform-card checklist-card ${checklist.locked ? "locked" : ""} ${checklist.completed ? "completed" : ""} ${state.recentlyUnlockedChecklistId === checklist.id ? "just-unlocked" : ""}"
                style="--phase-accent: ${checklist.accent.gradient}; --phase-accent-color: ${checklist.accent.color};"
                data-action="${checklist.locked ? "" : "open-checklist"}"
                data-checklist-id="${escapeHtml(checklist.id)}"
                aria-disabled="${checklist.locked ? "true" : "false"}"
            >
                ${checklist.locked ? `
                    <div class="lock-overlay">
                        <i data-lucide="lock"></i>
                        <span>${escapeHtml(lockMessage)}</span>
                    </div>
                ` : ""}
                <div class="card-header">
                    <div class="card-identity">
                        <img
                            src="${escapeHtml(checklist.imageUrl)}"
                            alt="${escapeHtml(checklist.title)}"
                            class="platform-logo"
                            onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'"
                        >
                        <div class="phase-info">
                            <div class="phase-badges">
                                <span class="phase-number">Fase ${escapeHtml(checklist.phase || index + 1)}</span>
                                <span class="card-status-pill ${checklist.completed ? "is-completed" : ""}">
                                    ${checklist.completed ? "Concluida" : checklist.progress > 0 ? "Em andamento" : "Nao iniciada"}
                                </span>
                            </div>
                            <span class="phase-title">${escapeHtml(checklist.title)}</span>
                            <span class="card-eyebrow">${escapeHtml(copy.eyebrow)}</span>
                        </div>
                    </div>
                    <span class="card-lock-hint">${escapeHtml(checklist.locked ? lockMessage : copy.unlockHint || "Fluxo guiado em andamento")}</span>
                </div>
                <div class="card-content">
                    <p class="platform-description">${escapeHtml(copy.description)}</p>
                    <div class="card-highlights">
                        ${copy.highlights.slice(0, 3).map(highlight => `
                            <span class="card-highlight">${escapeHtml(highlight)}</span>
                        `).join("")}
                    </div>
                    <div class="progress-section">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${checklist.progress}%"></div>
                        </div>
                        <span class="progress-text" data-progress-number>${checklist.progress}%</span>
                    </div>
                    <div class="card-status-row">
                        <span class="card-status-meta" data-progress-count>${stats.completedTasks}/${stats.totalTasks} itens</span>
                        <span class="card-status-meta">${checklist.completed ? "Proxima fase liberada" : nextChecklist ? `Desbloqueia ${escapeHtml(nextChecklist.title)}` : "Bloqueio ativo"}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button
                        class="btn btn-primary open-checklist"
                        type="button"
                        data-action="open-checklist"
                        data-checklist-id="${escapeHtml(checklist.id)}"
                        ${checklist.locked ? "disabled" : ""}
                    >
                        <i data-lucide="${action.icon}"></i>
                        ${escapeHtml(action.label)}
                    </button>
                </div>
            </article>
        `;
    }

    function buildListHeader(completedCount, activeCount, lockedCount) {
        return `
            <section class="checklists-header-strip">
                <div class="checklists-header-copy">
                    <span class="hero-kicker">Trilha academica</span>
                    <h2>Fases organizadas em ordem, com leitura simples e progresso claro.</h2>
                </div>
                <div class="checklists-header-stats">
                    <span><strong>${completedCount}</strong> concluidos</span>
                    <span><strong>${activeCount}</strong> ativos</span>
                    <span><strong>${lockedCount}</strong> bloqueados</span>
                </div>
            </section>
        `;
    }

    function renderListView() {
        if (!refs.grid) {
            return;
        }

        const filteredChecklists = state.checklists.filter(checklist => matchesSearch(checklist, state.searchTerm));
        const completedCount = state.checklists.filter(checklist => checklist.completed).length;
        const lockedCount = state.checklists.filter(checklist => checklist.locked).length;
        const activeCount = Math.max(state.checklists.length - completedCount - lockedCount, 0);

        if (!state.checklists.length) {
            refs.grid.innerHTML = `
                <div class="checklist-list-empty platform-card">
                    <div class="card-content">
                        <p class="platform-description">Nenhum checklist encontrado no momento.</p>
                    </div>
                </div>
            `;
        } else if (!filteredChecklists.length) {
            refs.grid.innerHTML = `
                ${buildListHeader(completedCount, activeCount, lockedCount)}
                <div class="checklist-empty-state platform-card">
                    <div class="card-content">
                        <p class="platform-description">Nenhum resultado combina com "${escapeHtml(state.searchTerm)}".</p>
                    </div>
                </div>
            `;
        } else {
            refs.grid.innerHTML = `
                ${buildListHeader(completedCount, activeCount, lockedCount)}
                <div class="checklists-cards-grid">
                    ${filteredChecklists
                        .map(checklist => {
                            const originalIndex = state.checklists.findIndex(item => item.id === checklist.id);
                            return buildChecklistCard(checklist, originalIndex);
                        })
                        .join("")}
                </div>
            `;
        }

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

        if (state.recentlyUnlockedChecklistId) {
            const unlockedId = state.recentlyUnlockedChecklistId;
            window.setTimeout(() => {
                refs.grid?.querySelector(`[data-checklist-id="${unlockedId}"].just-unlocked`)?.classList.remove("just-unlocked");
                if (state.recentlyUnlockedChecklistId === unlockedId) {
                    state.recentlyUnlockedChecklistId = null;
                }
            }, prefersReducedMotion() ? 0 : 650);
        }
    }

    function clearTaskGateBindings() {
        if (!state.taskGate) return;
        state.taskGate.observer?.disconnect?.();
        state.taskGate.removeViewportListener?.();
        state.taskGate.observer = null;
        state.taskGate.removeViewportListener = null;
    }

    function resetTaskGate() {
        if (!state.taskGate) return;
        clearTaskGateBindings();
        if (state.taskGate.timerId) {
            window.clearTimeout(state.taskGate.timerId);
        }
        state.taskGate = null;
    }

    function updateCompletionControl() {
        const gate = state.taskGate;
        if (!gate) return;
        const button = refs.detailContent?.querySelector(
            `[data-completion-button][data-task-id="${gate.taskId}"]`
        );
        const helper = refs.detailContent?.querySelector(
            `[data-selected-task-id="${gate.taskId}"] [data-completion-helper]`
        );
        if (!button || state.completionInFlight.has(gate.taskId)) return;

        const elapsed = performance.now() - gate.startedAt;
        gate.eligible = gate.contentLoaded && gate.completionViewed && elapsed >= MIN_TASK_DWELL_MS;
        button.disabled = !gate.eligible;
        button.classList.toggle("is-eligible", gate.eligible);
        if (helper) {
            helper.textContent = gate.eligible
                ? "Tudo certo — você já pode concluir esta etapa."
                : "Confira as orientações acima para concluir.";
        }
    }

    function markCompletionRegionViewed(taskId) {
        const gate = state.taskGate;
        if (!gate || gate.taskId !== taskId || gate.completionViewed) return;
        gate.completionViewed = true;
        updateCompletionControl();
    }

    function isCompletionRegionVisible(target, scrollRoot) {
        if (!target) return false;
        const targetRect = target.getBoundingClientRect();
        const rootRect = scrollRoot === window
            ? { top: 0, bottom: window.innerHeight }
            : scrollRoot.getBoundingClientRect();
        const visibleHeight = Math.max(0, Math.min(targetRect.bottom, rootRect.bottom) - Math.max(targetRect.top, rootRect.top));
        return visibleHeight >= Math.min(48, targetRect.height * 0.35);
    }

    function setupTaskEligibility(checklist, taskId) {
        const task = checklist?.tasks?.find(item => item.id === taskId);
        if (!task || task.completed) {
            resetTaskGate();
            return;
        }

        const gateKey = `${checklist.id}:${task.id}`;
        if (state.taskGate?.key !== gateKey) {
            resetTaskGate();
            state.taskGate = {
                key: gateKey,
                checklistId: checklist.id,
                taskId: task.id,
                startedAt: performance.now(),
                contentLoaded: true,
                completionViewed: false,
                eligible: false,
                timerId: null,
                observer: null,
                removeViewportListener: null
            };
        } else {
            clearTaskGateBindings();
            state.taskGate.contentLoaded = true;
        }

        const gate = state.taskGate;
        const stage = refs.detailContent?.querySelector(`[data-selected-task-id="${task.id}"]`);
        const completionRegion = stage?.querySelector("[data-completion-observer]");
        if (!stage || !completionRegion) return;

        const usesPageScroll = window.matchMedia?.("(max-width: 900px)").matches === true;
        const scrollRoot = usesPageScroll ? window : stage;
        const assessVisibility = () => {
            if (state.taskGate !== gate) return;
            if (isCompletionRegionVisible(completionRegion, scrollRoot)) {
                markCompletionRegionViewed(task.id);
            }
        };

        if (window.IntersectionObserver) {
            gate.observer = new window.IntersectionObserver(entries => {
                if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.25)) {
                    markCompletionRegionViewed(task.id);
                }
            }, { root: usesPageScroll ? null : stage, threshold: [0.25, 0.5] });
            gate.observer.observe(completionRegion);
        }

        scrollRoot.addEventListener("scroll", assessVisibility, { passive: true });
        window.addEventListener("resize", assessVisibility, { passive: true });
        gate.removeViewportListener = () => {
            scrollRoot.removeEventListener("scroll", assessVisibility);
            window.removeEventListener("resize", assessVisibility);
        };

        if (gate.timerId) window.clearTimeout(gate.timerId);
        const remaining = Math.max(0, MIN_TASK_DWELL_MS - (performance.now() - gate.startedAt));
        gate.timerId = window.setTimeout(updateCompletionControl, remaining + 20);
        updateCompletionControl();
        window.requestAnimationFrame(assessVisibility);
    }

    function renderDetailView() {
        if (!refs.detailContent) {
            return;
        }

        const checklist = getChecklistById(state.currentChecklistId);
        if (!checklist) {
            refs.detailContent.innerHTML = `
                <div class="detail-empty-state">
                    <i data-lucide="alert-circle"></i>
                    <p>Checklist nao encontrado.</p>
                </div>
            `;
            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }
            return;
        }

        const checklistIndex = state.checklists.findIndex(item => item.id === checklist.id);
        const nextChecklist = state.checklists[checklistIndex + 1] || null;
        const selectedTaskId = window.UniCheckChecklistDetail.render(refs.detailContent, checklist, {
            selectedTaskId: state.selectedTaskIds[checklist.id],
            mobileStageOpen: state.mobileStageOpen,
            nextChecklistId: nextChecklist?.id || null,
            nextChecklistTitle: nextChecklist?.title || null
        });

        if (selectedTaskId) {
            state.selectedTaskIds[checklist.id] = selectedTaskId;
            const mobileTrailOnly = window.matchMedia?.("(max-width: 900px)").matches === true && !state.mobileStageOpen;
            if (mobileTrailOnly) {
                resetTaskGate();
            } else {
                setupTaskEligibility(checklist, selectedTaskId);
            }
        }
    }

    function syncVisibleView() {
        const isDetail = Boolean(state.currentChecklistId);

        refs.listView?.classList.toggle("is-hidden", isDetail);
        refs.detailView?.classList.toggle("is-hidden", !isDetail);

        if (isDetail) {
            renderDetailView();
        } else {
            resetTaskGate();
            renderListView();
        }
    }

    function prefersReducedMotion() {
        return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
    }

    function animateNumber(element, from, to, formatter, duration = 420) {
        if (!element) return;
        if (prefersReducedMotion() || from === to) {
            element.textContent = formatter(to);
            return;
        }
        const startedAt = performance.now();
        const tick = now => {
            const elapsed = Math.min((now - startedAt) / duration, 1);
            const eased = 1 - Math.pow(1 - elapsed, 3);
            element.textContent = formatter(Math.round(from + (to - from) * eased));
            if (elapsed < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    function animateChecklistTransition(before, after, taskId, levelChanged = false) {
        if (!before || !after) return;
        const scope = refs.detailContent;
        if (!scope) return;

        const beforeCount = before.tasks.filter(task => task.completed).length;
        const afterCount = after.tasks.filter(task => task.completed).length;
        const total = after.tasks.length;

        scope.querySelectorAll("[data-progress-fill]").forEach(fill => {
            fill.style.transition = "none";
            fill.style.width = `${before.progress}%`;
            void fill.offsetWidth;
            requestAnimationFrame(() => {
                fill.style.transition = prefersReducedMotion() ? "none" : "width 480ms cubic-bezier(0.22, 1, 0.36, 1)";
                fill.style.width = `${after.progress}%`;
            });
        });

        scope.querySelectorAll("[data-progress-number]").forEach(element => {
            animateNumber(element, before.progress, after.progress, value => `${value}%`);
        });
        scope.querySelectorAll("[data-progress-count]").forEach(element => {
            animateNumber(element, beforeCount, afterCount, value => `${value} de ${total} concluídas`, 320);
        });

        const taskCard = scope.querySelector(`[data-task-card][data-task-id="${taskId}"]`);
        if (taskCard && !prefersReducedMotion()) {
            taskCard.classList.add("just-completed");
        }

        if (!before.completed && after.completed && !levelChanged && !prefersReducedMotion()) {
            scope.querySelector(".checklist-detail-shell")?.classList.add("phase-completed-feedback");
            scope.querySelector(".detail-trail-panel")?.classList.add("phase-complete-pulse");
            scope.querySelector("[data-phase-completion]")?.classList.add("is-celebrating");
        }
    }

    function updateTaskState(checklistId, taskId) {
        const current = state.progress[checklistId] || { tasks: {} };

        state.progress[checklistId] = {
            ...current,
            tasks: {
                ...current.tasks,
                [taskId]: true
            }
        };
    }

    function setCompletionLoading(button, loading) {
        if (!button) return;
        button.disabled = loading || !state.taskGate?.eligible;
        button.classList.toggle("is-loading", loading);
        button.setAttribute("aria-busy", String(loading));
        const label = button.querySelector("[data-completion-button-label]");
        if (label) label.textContent = loading ? "Concluindo..." : "Concluir etapa";
        const icon = button.querySelector("[data-lucide]");
        if (icon) icon.setAttribute("data-lucide", loading ? "loader-circle" : "check-circle");
        window.lucide?.createIcons?.();
    }

    function showCompletionError(taskId, message) {
        const error = refs.detailContent?.querySelector(
            `[data-selected-task-id="${taskId}"] [data-completion-error]`
        );
        if (!error) return;
        error.textContent = message;
        error.hidden = false;
    }

    function recordCompletionActivity(before, after, taskId, nextBefore, nextAfter) {
        if (!state.user?.id || !before || !after) return;
        const completedTask = after.tasks.find(task => task.id === taskId);
        const completedGuide = window.UniCheckChecklistContent?.getGuide?.(taskId);
        window.UniCheckActivity?.record?.(state.user.id, {
            type: "checklist_task_completed",
            title: `Concluiu "${completedGuide?.title || completedTask?.text || "Tarefa do checklist"}"`,
            context: after.title,
            metadata: { checklistId: after.id, taskId }
        });

        if (before.completed || !after.completed) return;
        window.UniCheckActivity?.record?.(state.user.id, {
            type: "checklist_phase_completed",
            title: `Concluiu a fase "${after.title}"`,
            context: `${after.tasks.length}/${after.tasks.length} tarefas concluídas`,
            metadata: { checklistId: after.id }
        });
        if (nextBefore?.locked && nextAfter && !nextAfter.locked) {
            window.UniCheckActivity?.record?.(state.user.id, {
                type: "checklist_phase_unlocked",
                title: `Desbloqueou "${nextAfter.title}"`,
                context: "Próxima fase disponível",
                metadata: { checklistId: nextAfter.id }
            });
            window.UniCheckNotifications?.record?.(state.user.id, {
                eventKey: `phase_unlocked:${nextAfter.id}`,
                type: "phase_unlocked",
                title: "Nova fase desbloqueada",
                message: `${nextAfter.title} está disponível.`,
                destination: `checklist:${nextAfter.id}`
            });
        } else if (!nextAfter) {
            window.UniCheckNotifications?.record?.(state.user.id, {
                eventKey: "journey_completed:v1",
                type: "journey_completed",
                title: "Jornada acadêmica concluída",
                message: "Você concluiu todas as fases do Checklist Acadêmico.",
                destination: `checklist:${after.id}`
            });
        }
    }

    function scheduleNextPendingTask(checklist, completedTaskId) {
        if (!checklist || checklist.completed) return;
        const nextTask = checklist.tasks.find(task => !task.completed && task.locked !== true);
        if (!nextTask) return;
        if (state.autoAdvanceTimer) window.clearTimeout(state.autoAdvanceTimer);
        state.autoAdvanceTimer = window.setTimeout(() => {
            state.autoAdvanceTimer = null;
            if (state.currentChecklistId !== checklist.id) return;
            if (state.selectedTaskIds[checklist.id] !== completedTaskId) return;
            selectTask(checklist.id, nextTask.id, false, true);
        }, prefersReducedMotion() ? 0 : AUTO_ADVANCE_DELAY_MS);
    }

    async function completeTask(checklistId, taskId, button) {
        const gate = state.taskGate;
        const before = getChecklistById(checklistId);
        const taskWasCompleted = before?.tasks?.find(task => task.id === taskId)?.completed === true;
        if (!before || taskWasCompleted) {
            return { status: "already-completed" };
        }
        if (state.completionInFlight.has(taskId)) {
            return { status: "in-flight" };
        }
        if (!gate?.eligible || gate.checklistId !== checklistId || gate.taskId !== taskId) {
            updateCompletionControl();
            return { status: "not-eligible" };
        }

        state.completionInFlight.add(taskId);
        setCompletionLoading(button, true);
        await new Promise(resolve => window.setTimeout(resolve, 80));

        const progressionBefore = window.UniCheckProgression?.calculateFromChecklists?.(state.checklists);
        const checklistIndex = state.checklists.findIndex(item => item.id === checklistId);
        const nextBefore = state.checklists[checklistIndex + 1] || null;
        const progressBefore = JSON.parse(JSON.stringify(state.progress));

        updateTaskState(checklistId, taskId);
        const acceptedLocally = saveStoredProgress(state.user?.id) && queuePendingSync(checklistId, taskId, true);
        if (!acceptedLocally) {
            state.progress = progressBefore;
            saveStoredProgress(state.user?.id);
            state.completionInFlight.delete(taskId);
            setCompletionLoading(button, false);
            const message = "Não foi possível salvar esta conclusão. Tente novamente.";
            showCompletionError(taskId, message);
            showNotification(message, "error");
            return { status: "failed" };
        }
        state.sessionCompletions.set(taskId, checklistId);

        hydrateChecklists();
        const after = getChecklistById(checklistId);
        const nextAfter = state.checklists[checklistIndex + 1] || null;
        const progressionAfter = window.UniCheckProgression?.calculateFromChecklists?.(state.checklists);
        const phaseCompleted = Boolean(before && after && !before.completed && after.completed);
        const levelChanged = Boolean(
            progressionBefore?.currentLevel?.level !== progressionAfter?.currentLevel?.level
        );

        if (before && after && !before.completed && after.completed && nextBefore?.locked && nextAfter && !nextAfter.locked) {
            state.recentlyUnlockedChecklistId = nextAfter.id;
        }
        syncVisibleView();
        animateChecklistTransition(before, after, taskId, levelChanged);

        const rewards = window.UniCheckProgression?.getChecklistCompletionRewards?.({
            taskCompleted: true,
            phaseCompleted
        }) || [];
        window.dispatchEvent(new CustomEvent("unicheck:progression-updated", {
            detail: {
                checklists: state.checklists,
                previousProgression: progressionBefore,
                progression: progressionAfter,
                gainedXp: rewards.reduce((total, reward) => total + reward.xp, 0),
                phaseCompleted,
                phaseTitle: phaseCompleted ? after?.title : null,
                nextPhaseTitle: phaseCompleted ? nextAfter?.title || null : null
            }
        }));

        recordCompletionActivity(before, after, taskId, nextBefore, nextAfter);

        if (state.user?.id) {
            void flushPendingSync();
        }

        state.completionInFlight.delete(taskId);
        if (phaseCompleted) {
            showNotification(`Fase "${after.title}" concluída.`, "success");
        } else {
            scheduleNextPendingTask(after, taskId);
        }

        return { status: "completed", before, after, rewards };
    }

    function openChecklist(checklistId, shouldPushState = true) {
        const checklist = getChecklistById(checklistId);
        if (!checklist || checklist.locked) {
            return;
        }

        if (state.autoAdvanceTimer && state.currentChecklistId !== checklistId) {
            window.clearTimeout(state.autoAdvanceTimer);
            state.autoAdvanceTimer = null;
        }
        state.currentChecklistId = checklistId;
        state.mobileStageOpen = false;
        syncVisibleView();

        if (shouldPushState) {
            updateRoute(checklistId);
        }
    }

    function goBackToList(shouldPushState = true) {
        if (state.autoAdvanceTimer) {
            window.clearTimeout(state.autoAdvanceTimer);
            state.autoAdvanceTimer = null;
        }
        state.currentChecklistId = null;
        state.mobileStageOpen = false;
        syncVisibleView();

        if (shouldPushState) {
            updateRoute(null);
        }
    }

    function selectTask(checklistId, taskId, shouldFocusStage = false, isAutomatic = false) {
        const checklist = getChecklistById(checklistId);
        const task = checklist?.tasks?.find(item => item.id === taskId);
        if (!checklist || checklist.id !== state.currentChecklistId || !task || task.locked === true) {
            return;
        }

        if (!isAutomatic && state.autoAdvanceTimer) {
            window.clearTimeout(state.autoAdvanceTimer);
            state.autoAdvanceTimer = null;
        }

        state.selectedTaskIds[checklistId] = taskId;
        state.mobileStageOpen = true;
        renderDetailView();
        const stage = refs.detailContent?.querySelector("#checklist-selected-step");
        if (shouldFocusStage) {
            stage?.focus?.({ preventScroll: true });
        }

        window.requestAnimationFrame(() => {
            if (window.matchMedia?.("(max-width: 900px)").matches) {
                stage?.scrollIntoView?.({
                    behavior: prefersReducedMotion() ? "auto" : "smooth",
                    block: isAutomatic ? "nearest" : "start"
                });
            }
        });
    }

    function returnToTrail() {
        resetTaskGate();
        state.mobileStageOpen = false;
        renderDetailView();

        window.requestAnimationFrame(() => {
            const taskId = state.selectedTaskIds[state.currentChecklistId];
            const selector = `[data-action="select-task"][data-task-id="${taskId}"]`;
            refs.detailContent?.querySelector(selector)?.focus?.({ preventScroll: true });
        });
    }

    function syncFromLocation() {
        const routeChecklistId = getRouteChecklistId();
        if (routeChecklistId && getChecklistById(routeChecklistId) && !getChecklistById(routeChecklistId).locked) {
            openChecklist(routeChecklistId, false);
            return;
        }

        goBackToList(false);
    }

    function showNotification(message, type = "info") {
        const existing = document.querySelector(".profile-notification");
        if (existing) {
            existing.remove();
        }

        const icons = {
            success: "check-circle",
            error: "alert-circle",
            info: "info"
        };

        const notification = document.createElement("div");
        notification.className = `profile-notification notification-${type}`;
        if (document.querySelector(".xp-reward")) {
            notification.classList.add("profile-notification--below-xp-reward");
        }
        notification.setAttribute("role", "status");
        notification.setAttribute("aria-live", "polite");
        notification.innerHTML = `
            <div class="notification-content">
                <i data-lucide="${icons[type] || icons.info}"></i>
                <span>${escapeHtml(message)}</span>
            </div>
        `;

        document.body.appendChild(notification);

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

        requestAnimationFrame(() => notification.classList.add("show"));
        window.setTimeout(() => {
            notification.classList.remove("show");
            window.setTimeout(() => notification.remove(), 250);
        }, 2200);
    }

    async function loadChecklists() {
        try {
            if (!state.user?.id) {
                throw new Error("Usuario autenticado nao encontrado para carregar checklists.");
            }

            // Envia apenas operacoes explicitamente enfileiradas e faz um unico
            // SELECT final para confirmar o estado remoto autoritativo.
            await flushPendingSync();
            const remoteProgress = await window.UniCheckChecklist.fetchUserProgressMap(state.user.id);
            state.progress = mergeProgressMaps(remoteProgress, state.progress);
            saveStoredProgress(state.user.id);

            hydrateChecklists();
            window.UniCheckProgressionProfile?.renderFromChecklists?.(state.checklists);
            syncFromLocation();
            renderListView();
        } catch (error) {
            if (!error?.unicheckChecklistLogged) {
                console.error("[UniCheckChecklistView] Progresso remoto indisponivel; mantendo progresso local", {
                    message: error?.message || error,
                    code: error?.code || null,
                    details: error?.details || null,
                    hint: error?.hint || null,
                    userId: state.user?.id || null
                });
            }
            if (Object.keys(getPendingSync(state.user?.id)).length) {
                showNotification("Alteracoes locais pendentes de sincronizacao.", "info");
            }
        }
    }

    function createLayoutIfNeeded() {
        refs.pageContent = document.querySelector(".page-content");
        if (!refs.pageContent) {
            throw new Error("Container .page-content nao encontrado.");
        }

        refs.pageContent.innerHTML = `
            <section class="checklist-view" id="checklistListView">
                <div class="checklists-grid" id="checklistsGrid"></div>
            </section>
            <section class="checklist-detail-view is-hidden" id="checklistDetailView">
                <div class="checklist-detail-content" id="checklistDetailContent"></div>
            </section>
        `;

        refs.listView = document.getElementById("checklistListView");
        refs.grid = document.getElementById("checklistsGrid");
        refs.detailView = document.getElementById("checklistDetailView");
        refs.detailContent = document.getElementById("checklistDetailContent");
        refs.searchInput = document.querySelector(".header-search-enhanced .search-input");
    }

    function handlePageClick(event) {
        const actionElement = event.target.closest("[data-action]");
        if (!actionElement) {
            return;
        }

        const action = actionElement.getAttribute("data-action");

        if (action === "select-task") {
            const checklistId = actionElement.getAttribute("data-checklist-id");
            const taskId = actionElement.getAttribute("data-task-id");
            if (checklistId && taskId) {
                selectTask(checklistId, taskId, event.detail === 0);
            }
            return;
        }

        if (action === "back-to-trail") {
            returnToTrail();
            return;
        }

        if (action === "complete-task") {
            const checklistId = actionElement.getAttribute("data-checklist-id");
            const taskId = actionElement.getAttribute("data-task-id");
            if (checklistId && taskId) {
                void completeTask(checklistId, taskId, actionElement);
            }
            return;
        }

        if (action === "open-checklist") {
            const checklistId = actionElement.getAttribute("data-checklist-id");
            if (checklistId) {
                openChecklist(checklistId);
            }
            return;
        }

        if (action === "back-to-list") {
            goBackToList();
        }
    }

    function setupEventListeners() {
        refs.pageContent?.addEventListener("click", handlePageClick);
        window.addEventListener("popstate", syncFromLocation);
        window.addEventListener("online", flushPendingSync);

        refs.searchInput?.addEventListener("input", event => {
            state.searchTerm = event.target.value.trim();
            if (!state.currentChecklistId) {
                renderListView();
            }
        });
    }

    async function init() {
        if (state.initialized) {
            return;
        }
        state.initialized = true;

        if (!window.UniCheckChecklistData) {
            console.error("[UniCheckChecklistView] Estrutura local dos checklists nao foi carregada.");
            return;
        }
        try {
            await window.UniCheckChecklistData.load();
        } catch (error) {
            console.error("[UniCheckChecklistView] Nao foi possivel carregar os checklists canonicos.", error);
            return;
        }
        state.rawChecklists = window.UniCheckChecklistData.getChecklists();

        // O guard compartilhado de platform-shell.js ja protege esta pagina.
        // Aqui apenas recuperamos a mesma sessao para identificar o progresso.
        const authSession = await window.UniCheckAuth?.getSession?.();

        if (!authSession?.user) {
            console.warn("[UniCheckChecklistView] Acesso bloqueado sem usuario autenticado.");
            return;
        }

        state.user = authSession.user;

        createLayoutIfNeeded();
        state.progress = getStoredProgress(state.user.id);
        setupEventListeners();
        hydrateChecklists();
        window.UniCheckProgressionProfile?.renderFromChecklists?.(state.checklists);
        syncFromLocation();
        renderListView();

        // A estrutura e o cache local ja estao visiveis. Somente a consulta
        // unica de progresso continua em background.
        void loadChecklists();
    }

    window.UniCheckChecklistView = {
        init
    };
})();
