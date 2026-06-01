(function () {
    const STORAGE_KEY = "unicheck_checklist_progress_v2";
    const ROUTE_PREFIX = "#checklist=";
    const FALLBACK_IMAGE = "../img-interno/logo.png";

    const checklistImages = {
        "Portal Acadêmico TOTVS": "../img-interno/TOTVS.jpg",
        "Configuração de Email": "../img-interno/outlook.png",
        "Biblioteca Virtual": "../img-interno/bibliotecaV.png",
        "Microsoft Teams": "../img-interno/MicrosoftT.png",
        "Plataforma A": "../img-interno/platafromaA.png",
        "Mentorias": "../img-interno/logo.png"
    };

    const state = {
        rawChecklists: [],
        checklists: [],
        progress: {},
        user: null,
        currentChecklistId: null,
        initialized: false
    };

    const refs = {
        pageContent: null,
        listView: null,
        grid: null,
        detailView: null,
        detailContent: null
    };

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function getStoredProgress() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            console.error("Erro ao ler progresso dos checklists:", error);
            return {};
        }
    }

    function saveStoredProgress() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
        } catch (error) {
            console.error("Erro ao salvar progresso dos checklists:", error);
        }
    }

    function mergeProgressMaps(remoteMap = {}, localMap = {}) {
        const merged = { ...localMap };

        Object.entries(remoteMap).forEach(([checklistId, value]) => {
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
        return checklist.imageUrl || checklistImages[checklist.title] || FALLBACK_IMAGE;
    }

    function hydrateChecklists() {
        state.checklists = window.UniCheckChecklist
            .applyProgress(state.rawChecklists, state.progress)
            .map(checklist => ({
                ...checklist,
                imageUrl: resolveChecklistImage(checklist)
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
            icon: checklist.title === "Portal Acadêmico TOTVS" ? "monitor-play" : "arrow-right",
            label: checklist.progress > 0 ? "Continuar" : "Iniciar"
        };
    }

    function buildChecklistCard(checklist, index) {
        const action = createCardActionLabel(checklist);
        const lockMessage = index === 0
            ? "Sempre liberado"
            : `Complete a fase ${index} para desbloquear`;

        return `
            <article
                class="platform-card ${checklist.locked ? "locked" : ""} ${checklist.completed ? "completed" : ""}"
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
                    <img
                        src="${escapeHtml(checklist.imageUrl)}"
                        alt="${escapeHtml(checklist.title)}"
                        class="platform-logo"
                        onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'"
                    >
                    <div class="phase-info">
                        <span class="phase-number">Fase ${escapeHtml(checklist.phase || index + 1)}</span>
                        <span class="phase-title">${escapeHtml(checklist.title)}</span>
                    </div>
                </div>
                <div class="card-content">
                    <p class="platform-description">${escapeHtml(checklist.description || "Sem descricao cadastrada.")}</p>
                    <div class="progress-section">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${checklist.progress}%"></div>
                        </div>
                        <span class="progress-text">${checklist.progress}%</span>
                    </div>
                    <div class="card-status-row">
                        <span class="card-status-pill ${checklist.completed ? "is-completed" : ""}">
                            ${checklist.completed ? "Concluido" : checklist.progress > 0 ? "Em andamento" : "Nao iniciado"}
                        </span>
                        <span class="card-status-meta">${checklist.tasks.filter(task => task.completed).length}/${checklist.tasks.length} itens</span>
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

    function renderListView() {
        if (!refs.grid) return;

        if (!state.checklists.length) {
            refs.grid.innerHTML = `
                <div class="platform-card">
                    <div class="card-content">
                        <p class="platform-description">Nenhum checklist encontrado no momento.</p>
                    </div>
                </div>
            `;
        } else {
            refs.grid.innerHTML = state.checklists.map(buildChecklistCard).join("");
        }

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }

    function renderDetailView() {
        if (!refs.detailContent) return;

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

    function updateDetailSummaryView(checklist) {
        if (!checklist || !refs.detailContent || refs.detailView?.classList.contains("is-hidden")) {
            return;
        }

        const summaryValue = refs.detailContent.querySelector(".detail-summary-value");
        const progressFill = refs.detailContent.querySelector(".detail-progress-fill");
        const progressText = refs.detailContent.querySelector(".detail-progress-text");
        const status = refs.detailContent.querySelector(".detail-summary-status");

        if (summaryValue) {
            summaryValue.textContent = `${checklist.progress}%`;
        }

        if (progressFill) {
            progressFill.style.width = `${checklist.progress}%`;
        }

        if (progressText) {
            progressText.textContent = `${checklist.tasks.filter(task => task.completed).length}/${checklist.tasks.length} itens concluidos`;
        }

        if (status) {
            status.textContent = checklist.completed ? "Checklist concluido" : "Checklist em andamento";
            status.classList.toggle("is-completed", checklist.completed);
        }
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

        saveStoredProgress();
    }

    async function toggleTask(checklistId, taskId, completed) {
        persistTaskState(checklistId, taskId, completed);

        if (state.user?.id) {
            try {
                await window.UniCheckChecklist.saveTaskProgress({
                    userId: state.user.id,
                    checklistId,
                    taskId,
                    completed
                });
            } catch (error) {
                console.error("Erro ao sincronizar progresso com Supabase:", error);
                showNotification("Nao foi possivel salvar o progresso no banco.", "error");
            }
        }

        hydrateChecklists();
        syncVisibleView();
        renderListView();
    }

    function openChecklist(checklistId, shouldPushState = true) {
        const checklist = getChecklistById(checklistId);
        if (!checklist || checklist.locked) return;

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

    function renderLoadingState() {
        if (!refs.grid) return;

        refs.grid.innerHTML = `
            <div class="platform-card">
                <div class="card-content">
                    <p class="platform-description">Carregando checklists...</p>
                </div>
            </div>
        `;
    }

    async function loadChecklists() {
        renderLoadingState();

        try {
            if (state.user?.id) {
                const remoteProgress = await window.UniCheckChecklist.fetchUserProgressMap(state.user.id);
                state.progress = mergeProgressMaps(remoteProgress, state.progress);
                saveStoredProgress();
            }

            state.rawChecklists = await window.UniCheckChecklist.fetchAllChecklists();
            hydrateChecklists();
            syncFromLocation();
            renderListView();
        } catch (error) {
            console.error("Erro ao carregar checklists:", error);
            refs.grid.innerHTML = `
                <div class="platform-card">
                    <div class="card-content">
                        <p class="platform-description">Nao foi possivel carregar os checklists agora.</p>
                    </div>
                </div>
            `;
            showNotification("Falha ao carregar checklists.", "error");
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
    }

    function handlePageClick(event) {
        const actionElement = event.target.closest("[data-action]");
        if (!actionElement) return;

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

    async function handlePageChange(event) {
        const target = event.target;
        if (!(target instanceof HTMLInputElement)) return;
        if (target.getAttribute("data-action") !== "toggle-task") return;

        const checklistId = target.getAttribute("data-checklist-id");
        const taskId = target.getAttribute("data-task-id");

        if (!checklistId || !taskId) return;

        const before = getChecklistById(checklistId);
        await toggleTask(checklistId, taskId, target.checked);
        const after = getChecklistById(checklistId);

        if (before && after && before.completed !== after.completed && after.completed) {
            showNotification(`"${after.title}" concluido. Proxima fase liberada.`, "success");
        }
    }

    function handleTutorialMessages(event) {
        if (event.data?.type === "unicheck-tutorial-back") {
            goBackToList();
            return;
        }

        if (event.data?.type === "unicheck-tutorial-progress-saved") {
            const checklistId = event.data.checklistId;
            const tasks = event.data.tasks || {};
            if (!checklistId) return;

            state.progress[checklistId] = {
                ...(state.progress[checklistId] || {}),
                tasks: {
                    ...((state.progress[checklistId] || {}).tasks || {}),
                    ...tasks
                }
            };

            saveStoredProgress();
            hydrateChecklists();
            renderListView();

            if (state.currentChecklistId === checklistId) {
                updateDetailSummaryView(getChecklistById(checklistId));
            }
        }
    }

    function setupEventListeners() {
        refs.pageContent?.addEventListener("click", handlePageClick);
        refs.pageContent?.addEventListener("change", handlePageChange);
        window.addEventListener("popstate", syncFromLocation);
        window.addEventListener("message", handleTutorialMessages);
    }

    async function init() {
        if (state.initialized) return;
        state.initialized = true;

        createLayoutIfNeeded();
        state.progress = getStoredProgress();
        try {
            state.user = await window.UniCheckChecklist.getCurrentUser();
            if (state.user?.id) {
                const remoteProgress = await window.UniCheckChecklist.fetchUserProgressMap(state.user.id);
                state.progress = mergeProgressMaps(remoteProgress, state.progress);
                saveStoredProgress();
            }
        } catch (error) {
            console.error("Erro ao carregar usuario/progresso remoto:", error);
        }
        setupEventListeners();
        await loadChecklists();
    }

    window.UniCheckChecklistView = {
        init
    };
})();
