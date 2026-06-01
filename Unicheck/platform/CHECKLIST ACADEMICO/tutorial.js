const TUTORIAL_CONFIG = {
    phaseOrder: 2,
    themeKey: "tutorial-theme"
};

const EMBEDDED_MODE = new URLSearchParams(window.location.search).get("embedded") === "1";

const tutorialState = {
    user: null,
    checklist: null,
    savingTaskId: null
};

document.addEventListener("DOMContentLoaded", () => {
    initializeTheme();
    initializeActionHandlers();
    initializeEmbeddedMode();
    initializeTutorial().catch(error => {
        console.error("Erro ao inicializar tutorial TOTVS:", error);
        showNotification("Nao foi possivel carregar o tutorial da fase.", "error");
    });
});

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector(".theme-icon");
    const isLight = body.classList.toggle("light-theme");

    localStorage.setItem(TUTORIAL_CONFIG.themeKey, isLight ? "light" : "dark");

    if (themeIcon) {
        themeIcon.setAttribute("data-lucide", isLight ? "sun" : "moon");
    }

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}

function initializeTheme() {
    const savedTheme = localStorage.getItem(TUTORIAL_CONFIG.themeKey);
    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
        document.querySelector(".theme-icon")?.setAttribute("data-lucide", "sun");
    }
}

function initializeActionHandlers() {
    document.addEventListener("click", event => {
        const actionElement = event.target.closest("[data-action]");
        if (!actionElement) return;

        const action = actionElement.getAttribute("data-action");
        if (action === "toggle-theme") {
            toggleTheme();
            return;
        }

        if (action === "toggle-db-task") {
            event.preventDefault();
            const stepIndex = Number(actionElement.getAttribute("data-step-index"));
            if (Number.isInteger(stepIndex) && stepIndex >= 0) {
                toggleTutorialTaskByIndex(stepIndex);
            }
        }
    });
}

function initializeEmbeddedMode() {
    if (!EMBEDDED_MODE) {
        return;
    }

    document.body.classList.add("embedded-mode");
}

async function initializeTutorial() {
    if (!window.UniCheckChecklist) {
        throw new Error("Modulo js/checklist.js nao carregado.");
    }

    tutorialState.user = await window.UniCheckChecklist.getCurrentUser();
    tutorialState.checklist = await window.UniCheckChecklist.fetchChecklistByPhase(TUTORIAL_CONFIG.phaseOrder);

    if (!tutorialState.checklist) {
        throw new Error(`Checklist da fase ${TUTORIAL_CONFIG.phaseOrder} nao encontrado.`);
    }

    if (!tutorialState.user?.id) {
        throw new Error("Usuario nao autenticado.");
    }

    const progressMap = await window.UniCheckChecklist.fetchUserProgressMap(tutorialState.user.id);
    tutorialState.checklist = window.UniCheckChecklist.applyProgress([tutorialState.checklist], progressMap)[0];

    bindTutorialCards();
    refreshTutorialUI();

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}

function bindTutorialCards() {
    const stepCards = Array.from(document.querySelectorAll(".step-card"));

    stepCards.forEach((card, index) => {
        const task = tutorialState.checklist.tasks[index];
        const checkbox = card.querySelector('input[type="checkbox"]');
        const label = card.querySelector(".step-checkbox-label");
        const labelText = card.querySelector(".step-checkbox-text");

        if (!checkbox || !label || !task) {
            card.classList.add("is-disabled");
            return;
        }

        checkbox.checked = Boolean(task.completed);
        checkbox.dataset.taskId = task.id;
        checkbox.dataset.checklistId = tutorialState.checklist.id;

        label.dataset.action = "toggle-db-task";
        label.dataset.stepIndex = String(index);
        label.setAttribute("role", "button");
        label.setAttribute("tabindex", "0");

        if (labelText) {
            labelText.textContent = task.completed ? "Concluido" : "Marcar como concluido";
        }

        let helper = card.querySelector(".tutorial-task-binding");
        if (!helper) {
            helper = document.createElement("p");
            helper.className = "tutorial-task-binding";
            card.querySelector(".step-content")?.appendChild(helper);
        }
        helper.textContent = task.text;
    });
}

function refreshTutorialUI() {
    const checklist = tutorialState.checklist;
    if (!checklist) return;

    const titleElement = document.querySelector(".brand-subtitle");
    if (titleElement) {
        titleElement.textContent = checklist.title;
    }

    checklist.tasks.forEach((task, index) => {
        const card = document.querySelector(`.step-card[data-step="${index + 1}"]`);
        const checkbox = card?.querySelector('input[type="checkbox"]');
        const label = card?.querySelector(".step-checkbox-label");
        const labelText = card?.querySelector(".step-checkbox-text");

        if (!card || !checkbox || !label) return;

        checkbox.checked = Boolean(task.completed);
        label.classList.toggle("is-completed", Boolean(task.completed));
        label.classList.toggle("is-saving", tutorialState.savingTaskId === task.id);
        card.classList.toggle("completed", Boolean(task.completed));
        card.querySelector(".step-number")?.classList.toggle("completed", Boolean(task.completed));

        if (labelText) {
            if (tutorialState.savingTaskId === task.id) {
                labelText.textContent = "Salvando...";
            } else {
                labelText.textContent = task.completed ? "Concluido" : "Marcar como concluido";
            }
        }
    });

    notifyParent();

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}

async function toggleTutorialTaskByIndex(index) {
    const task = tutorialState.checklist?.tasks?.[index];
    if (!task || !tutorialState.user?.id || tutorialState.savingTaskId) {
        return;
    }

    const nextValue = !Boolean(task.completed);
    tutorialState.savingTaskId = task.id;
    refreshTutorialUI();

    try {
        await window.UniCheckChecklist.saveTaskProgress({
            userId: tutorialState.user.id,
            checklistId: tutorialState.checklist.id,
            taskId: task.id,
            completed: nextValue
        });

        tutorialState.checklist.tasks = tutorialState.checklist.tasks.map(currentTask => (
            currentTask.id === task.id ? { ...currentTask, completed: nextValue } : currentTask
        ));

        tutorialState.checklist = window.UniCheckChecklist.applyProgress([tutorialState.checklist], {
            [tutorialState.checklist.id]: {
                tasks: tutorialState.checklist.tasks.reduce((accumulator, currentTask) => {
                    accumulator[currentTask.id] = Boolean(currentTask.completed);
                    return accumulator;
                }, {})
            }
        })[0];

        showNotification("Progresso salvo no banco.", "success");
    } catch (error) {
        console.error("Erro ao salvar etapa do tutorial:", error);
        showNotification("Nao foi possivel salvar esta etapa.", "error");
    } finally {
        tutorialState.savingTaskId = null;
        refreshTutorialUI();
    }
}

function notifyParent() {
    const payload = {
        type: "unicheck-tutorial-progress-saved",
        checklistId: tutorialState.checklist?.id || null,
        progress: tutorialState.checklist?.progress || 0,
        tasks: (tutorialState.checklist?.tasks || []).reduce((accumulator, task) => {
            accumulator[task.id] = Boolean(task.completed);
            return accumulator;
        }, {})
    };

    if (window.parent && window.parent !== window) {
        window.parent.postMessage(payload, "*");
    }
}

function showNotification(message, type = "info") {
    const existingNotification = document.querySelector(".tutorial-notification");
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement("div");
    notification.className = `tutorial-notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i data-lucide="${type === "success" ? "check-circle" : type === "error" ? "alert-circle" : "info"}"></i>
            <span>${message}</span>
        </div>
    `;

    Object.assign(notification.style, {
        position: "fixed",
        top: "100px",
        right: "20px",
        background: "var(--glass-bg)",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--glass-border)",
        borderRadius: "12px",
        padding: "1rem 1.5rem",
        color: "var(--text-primary)",
        zIndex: "9999",
        transform: "translateX(400px)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        maxWidth: "320px",
        boxShadow: "var(--glass-shadow)"
    });

    document.body.appendChild(notification);
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    setTimeout(() => {
        notification.style.transform = "translateX(0)";
    }, 50);

    setTimeout(() => {
        notification.style.transform = "translateX(400px)";
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

window.TutorialAPI = {
    toggleTheme
};
