(function () {
    const STORAGE_KEY = "unicheck_checklist_progress_v3";
    const PENDING_SYNC_KEY = "unicheck_checklist_pending_sync_v2";
    const ROUTE_PREFIX = "#checklist=";
    const FALLBACK_IMAGE = "../assets/images/logo.png";
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
        "Portal Academico TOTVS": "../assets/images/TOTVS.jpg",
        "Configuracao de Email": "../assets/images/outlook.png",
        "Biblioteca Virtual": "../assets/images/bibliotecaV.png",
        "Microsoft Teams": "../assets/images/MicrosoftT.png",
        "Plataforma A+": "../assets/images/platafromaA.png",
        "Mentorias": "../assets/images/logo.png"
    };

    const cardCopy = {
        "Primeiros passos na faculdade": {
            eyebrow: "Onboarding da turma",
            description: "Crie a base da jornada com alinhamento de contatos, combinados e comunicacao oficial da turma.",
            highlights: ["Organizacao da turma", "Canais oficiais", "Calendario academico", "Primeiros combinados"],
            footnote: "Essa fase estrutura o ritmo para todo o restante da jornada.",
            unlockHint: "Libera a navegacao dos sistemas e canais institucionais."
        },
        "Portal Academico TOTVS": {
            eyebrow: "Portal do aluno",
            description: "Acesse o portal, valide seu RA e encontre os documentos e menus que sustentam a rotina academica.",
            highlights: ["Portal do Aluno", "Central do aluno", "Documentos e relatorios", "Acesso autenticado"],
            footnote: "Depois disso, o aluno consulta boletos, documentos e avisos com autonomia.",
            unlockHint: "Libera o uso consistente da central do aluno."
        },
        "Configuracao de Email": {
            eyebrow: "Email institucional",
            description: "Ative o email institucional, teste login e garanta que a comunicacao da faculdade chegue sem ruido.",
            highlights: ["Outlook/Webmail", "Senha atualizada", "Canal oficial", "Notificacoes ativas"],
            footnote: "A caixa institucional vira a principal fonte de avisos e recuperacao de acesso.",
            unlockHint: "Prepara o canal mais importante de comunicacao do aluno."
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
        syncInFlight: false,
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
            return;
        }

        try {
            if (window.UniCheckChecklist?.writeCachedProgress) {
                window.UniCheckChecklist.writeCachedProgress(userId, state.progress);
                return;
            }
            localStorage.setItem(getStoredProgressKey(userId), JSON.stringify(state.progress));
        } catch (error) {
            console.error("Erro ao salvar progresso dos checklists:", error);
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
        if (!userId) return;
        if (window.UniCheckChecklist?.writePendingProgress) {
            window.UniCheckChecklist.writePendingProgress(userId, pending);
            return;
        }
        try {
            localStorage.setItem(getPendingSyncKey(userId), JSON.stringify(pending));
        } catch (error) {
            console.error("[UniCheckChecklistView] Erro ao salvar fila de sincronizacao", error);
        }
    }

    function queuePendingSync(checklistId, taskId, completed) {
        const userId = state.user?.id;
        if (!userId) return;
        const pending = getPendingSync(userId);
        pending[taskId] = { checklistId, completed: Boolean(completed) };
        savePendingSync(userId, pending);
    }

    function clearPendingSync(taskId, completed) {
        const userId = state.user?.id;
        if (!userId) return;
        const pending = getPendingSync(userId);
        if (pending[taskId]?.completed !== Boolean(completed)) return;
        delete pending[taskId];
        savePendingSync(userId, pending);
    }

    async function flushPendingSync() {
        const userId = state.user?.id;
        if (!userId || state.syncInFlight) return;
        const snapshot = getPendingSync(userId);
        const entries = Object.entries(snapshot).map(([taskId, value]) => ({
            userId,
            checklistId: value.checklistId,
            taskId,
            completed: value.completed
        }));
        if (!entries.length) return;

        state.syncInFlight = true;
        let synced = false;
        try {
            if (window.UniCheckChecklist.flushPendingProgress) {
                await window.UniCheckChecklist.flushPendingProgress(userId);
            } else {
                await window.UniCheckChecklist.saveProgressBatch(entries);
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
        if (window.UniCheckChecklist?.reconcileProgressMaps) {
            return window.UniCheckChecklist.reconcileProgressMaps(
                remoteMap,
                localMap,
                getPendingSync(state.user?.id)
            );
        }
        const merged = JSON.parse(JSON.stringify(remoteMap || {}));
        Object.entries(getPendingSync(state.user?.id)).forEach(([taskId, pending]) => {
            if (!pending?.checklistId) return;
            merged[pending.checklistId] ||= { tasks: {} };
            merged[pending.checklistId].tasks ||= {};
            merged[pending.checklistId].tasks[taskId] = Boolean(pending.completed);
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
        const haystack = [
            checklist.title,
            checklist.description,
            copy.description,
            copy.eyebrow,
            ...(checklist.tasks || []).map(task => task.text)
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

        window.UniCheckChecklistDetail.render(refs.detailContent, checklist);
    }

    function syncVisibleView() {
        const isDetail = Boolean(state.currentChecklistId);

        refs.listView?.classList.toggle("is-hidden", isDetail);
        refs.detailView?.classList.toggle("is-hidden", !isDetail);

        if (isDetail) {
            renderDetailView();
        } else {
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

    function animateChecklistTransition(before, after, taskId, completed) {
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
            animateNumber(element, beforeCount, afterCount, value => `${value}/${total} itens concluidos`, 320);
        });

        const orb = scope.querySelector("[data-progress-orb]");
        if (orb && !prefersReducedMotion()) {
            const fromAngle = before.progress * 3.6;
            const toAngle = after.progress * 3.6;
            const startedAt = performance.now();
            const animateOrb = now => {
                const elapsed = Math.min((now - startedAt) / 480, 1);
                const eased = 1 - Math.pow(1 - elapsed, 3);
                orb.style.setProperty("--progress-angle", `${fromAngle + (toAngle - fromAngle) * eased}deg`);
                if (elapsed < 1) requestAnimationFrame(animateOrb);
            };
            requestAnimationFrame(animateOrb);
        }

        const taskCard = scope.querySelector(`[data-task-card][data-task-id="${taskId}"]`);
        if (taskCard && !prefersReducedMotion()) {
            taskCard.classList.add(completed ? "just-completed" : "just-reopened");
        }

        if (!before.completed && after.completed && !prefersReducedMotion()) {
            scope.querySelector(".checklist-detail-shell")?.classList.add("phase-completed-feedback");
            scope.querySelector(".detail-summary-card")?.classList.add("phase-complete-pulse");
        }
    }

    function primeTaskInteraction(input) {
        if (prefersReducedMotion()) return;
        const card = input.closest("[data-task-card]");
        card?.classList.add(input.checked ? "task-press-complete" : "task-press-reopen");
    }

    function showXpFeedback(rewards, anchor) {
        if (!Array.isArray(rewards) || !rewards.length) return;
        let stack = anchor?.querySelector(":scope > .xp-feedback-stack--inline") || document.querySelector("body > .xp-feedback-stack");
        if (!stack) {
            stack = document.createElement("div");
            stack.className = `xp-feedback-stack${anchor ? " xp-feedback-stack--inline" : ""}`;
            stack.setAttribute("role", "status");
            stack.setAttribute("aria-live", "polite");
            (anchor || document.body).appendChild(stack);
        }

        rewards.forEach(reward => {
            const feedback = document.createElement("div");
            feedback.className = `xp-feedback xp-feedback--${reward.type}`;
            feedback.innerHTML = `<i data-lucide="sparkles" aria-hidden="true"></i><span><strong>+${reward.xp} XP</strong>${reward.label}</span>`;
            stack.appendChild(feedback);
            window.setTimeout(() => {
                feedback.remove();
                if (!stack.children.length) stack.remove();
            }, 1750);
        });
        window.lucide?.createIcons?.();
    }

    function updateTaskState(checklistId, taskId, completed) {
        const current = state.progress[checklistId] || { tasks: {} };

        state.progress[checklistId] = {
            ...current,
            tasks: {
                ...current.tasks,
                [taskId]: completed
            }
        };
    }

    function toggleTask(checklistId, taskId, completed) {
        const progressionBefore = window.UniCheckProgression?.calculateFromChecklists?.(state.checklists);
        const before = getChecklistById(checklistId);
        const checklistIndex = state.checklists.findIndex(item => item.id === checklistId);
        const nextBefore = state.checklists[checklistIndex + 1] || null;
        updateTaskState(checklistId, taskId, completed);
        hydrateChecklists();
        const after = getChecklistById(checklistId);
        const nextAfter = state.checklists[checklistIndex + 1] || null;

        if (before && after && !before.completed && after.completed && nextBefore?.locked && nextAfter && !nextAfter.locked) {
            state.recentlyUnlockedChecklistId = nextAfter.id;
        }
        syncVisibleView();
        animateChecklistTransition(before, after, taskId, completed);

        const taskWasCompleted = before?.tasks?.find(task => task.id === taskId)?.completed === true;
        const rewards = window.UniCheckProgression?.getChecklistCompletionRewards?.({
            taskCompleted: Boolean(completed && !taskWasCompleted),
            phaseCompleted: Boolean(before && after && !before.completed && after.completed)
        }) || [];
        const taskCard = refs.detailContent?.querySelector(`[data-task-card][data-task-id="${taskId}"]`);
        showXpFeedback(rewards, taskCard);
        window.dispatchEvent(new CustomEvent("unicheck:progression-updated", {
            detail: {
                checklists: state.checklists,
                announceLevelChange: Boolean(completed),
                previousLevel: progressionBefore?.currentLevel?.level
            }
        }));

        // A interface ja reflete o novo estado. Em seguida, persiste no cache
        // por usuario e deixa a escrita remota exclusivamente em background.
        saveStoredProgress(state.user?.id);
        queuePendingSync(checklistId, taskId, completed);

        if (state.user?.id && completed && before && after) {
            const completedTask = after.tasks.find(task => task.id === taskId);
            window.UniCheckActivity?.record?.(state.user.id, {
                type: "checklist_task_completed",
                title: `Concluiu "${completedTask?.text || "Tarefa do checklist"}"`,
                context: after.title
            });

            if (!before.completed && after.completed) {
                window.UniCheckActivity?.record?.(state.user.id, {
                    type: "checklist_phase_completed",
                    title: `Concluiu a fase "${after.title}"`,
                    context: `${after.tasks.length}/${after.tasks.length} tarefas concluídas`
                });
                if (nextBefore?.locked && nextAfter && !nextAfter.locked) {
                    window.UniCheckActivity?.record?.(state.user.id, {
                        type: "checklist_phase_unlocked",
                        title: `Desbloqueou "${nextAfter.title}"`,
                        context: "Próxima fase disponível"
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
        }

        if (state.user?.id) {
            void flushPendingSync();
        }

        return { before, after };
    }

    function openChecklist(checklistId, shouldPushState = true) {
        const checklist = getChecklistById(checklistId);
        if (!checklist || checklist.locked) {
            return;
        }

        state.currentChecklistId = checklistId;
        syncVisibleView();

        if (shouldPushState) {
            updateRoute(checklistId);
        }
    }

    function goBackToList(shouldPushState = true) {
        state.currentChecklistId = null;
        syncVisibleView();

        if (shouldPushState) {
            updateRoute(null);
        }
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

    function handlePageChange(event) {
        const target = event.target;
        if (!(target instanceof HTMLInputElement)) {
            return;
        }

        if (target.getAttribute("data-action") !== "toggle-task") {
            return;
        }

        const checklistId = target.getAttribute("data-checklist-id");
        const taskId = target.getAttribute("data-task-id");

        if (!checklistId || !taskId) {
            return;
        }

        primeTaskInteraction(target);
        const { before, after } = toggleTask(checklistId, taskId, target.checked);

        if (before && after && before.completed !== after.completed && after.completed) {
            showNotification(`"${after.title}" concluido. Proxima fase liberada.`, "success");
        }
    }

    function setupEventListeners() {
        refs.pageContent?.addEventListener("click", handlePageClick);
        refs.pageContent?.addEventListener("change", handlePageChange);
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

        // O guard compartilhado de script-interno.js ja protege esta pagina.
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
