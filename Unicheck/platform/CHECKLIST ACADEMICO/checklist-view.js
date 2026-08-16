(function () {
    const STORAGE_KEY = "unicheck_checklist_progress_v2";
    const PENDING_SYNC_KEY = "unicheck_checklist_pending_sync_v1";
    const ROUTE_PREFIX = "#checklist=";
    const FALLBACK_IMAGE = "../img-interno/logo.png";
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
        "Portal Academico TOTVS": "../img-interno/TOTVS.jpg",
        "Configuracao de Email": "../img-interno/outlook.png",
        "Biblioteca Virtual": "../img-interno/bibliotecaV.png",
        "Microsoft Teams": "../img-interno/MicrosoftT.png",
        "Plataforma A+": "../img-interno/platafromaA.png",
        "Mentorias": "../img-interno/logo.png"
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
            await window.UniCheckChecklist.saveProgressBatch(entries);
            entries.forEach(entry => clearPendingSync(entry.taskId, entry.completed));
            synced = true;
        } catch (error) {
            console.error("[UniCheckChecklistView] Sincronizacao remota pendente; progresso local preservado", {
                message: error?.message || String(error),
                code: error?.code || null,
                itemCount: entries.length,
                userId
            });
        } finally {
            state.syncInFlight = false;
            if (synced && Object.keys(getPendingSync(userId)).length) {
                void flushPendingSync();
            }
        }
    }

    function mergeProgressMaps(remoteMap = {}, localMap = {}) {
        const merged = { ...remoteMap };

        // O estado local e atualizado antes da chamada remota. Ele prevalece
        // para que uma sincronizacao temporariamente indisponivel nao desmarque
        // uma acao que o usuario acabou de realizar neste navegador.
        Object.entries(localMap).forEach(([checklistId, value]) => {
            merged[checklistId] = {
                ...(merged[checklistId] || {}),
                ...(value || {}),
                tasks: {
                    ...((merged[checklistId] || {}).tasks || {}),
                    ...((value || {}).tasks || {})
                }
            };
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
                class="platform-card checklist-card ${checklist.locked ? "locked" : ""} ${checklist.completed ? "completed" : ""}"
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
                        <span class="progress-text">${checklist.progress}%</span>
                    </div>
                    <div class="card-status-row">
                        <span class="card-status-meta">${stats.completedTasks}/${stats.totalTasks} itens</span>
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

    function persistTaskState(checklistId, taskId, completed) {
        const current = state.progress[checklistId] || { tasks: {} };

        state.progress[checklistId] = {
            ...current,
            tasks: {
                ...current.tasks,
                [taskId]: completed
            }
        };

        saveStoredProgress(state.user?.id);
    }

    function toggleTask(checklistId, taskId, completed) {
        persistTaskState(checklistId, taskId, completed);
        queuePendingSync(checklistId, taskId, completed);
        hydrateChecklists();
        syncVisibleView();

        if (state.user?.id) {
            void flushPendingSync();
        }
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

            const remoteProgress = await window.UniCheckChecklist.fetchUserProgressMap(state.user.id);
            state.progress = mergeProgressMaps(remoteProgress, state.progress);
            saveStoredProgress(state.user.id);

            hydrateChecklists();
            syncFromLocation();
            renderListView();
        } catch (error) {
            console.error("[UniCheckChecklistView] Progresso remoto indisponivel; mantendo progresso local", {
                message: error?.message || error,
                code: error?.code || null,
                details: error?.details || null,
                hint: error?.hint || null,
                userId: state.user?.id || null
            });
            showNotification("Progresso local carregado; sincronizacao pendente.", "info");
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

        const before = getChecklistById(checklistId);
        toggleTask(checklistId, taskId, target.checked);
        const after = getChecklistById(checklistId);

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
