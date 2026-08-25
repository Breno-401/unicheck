(function () {
    "use strict";

    const TASK_XP = 10;
    const PHASE_XP = 40;
    const LEVELS = [
        { level: 1, name: "Calouro", minXp: 0 },
        { level: 2, name: "Explorador", minXp: 100 },
        { level: 3, name: "Organizado", minXp: 220 },
        { level: 4, name: "Conectado", minXp: 380 },
        { level: 5, name: "Veterano UniCheck", minXp: 560 }
    ];

    function calculateFromCounts({ completedTasks = 0, completedPhases = 0 } = {}) {
        const xp = Math.max(0, completedTasks) * TASK_XP + Math.max(0, completedPhases) * PHASE_XP;
        const currentIndex = LEVELS.findLastIndex(level => xp >= level.minXp);
        const currentLevel = LEVELS[Math.max(0, currentIndex)];
        const nextLevel = LEVELS[currentIndex + 1] || null;
        const span = nextLevel ? nextLevel.minXp - currentLevel.minXp : 1;
        const levelProgress = nextLevel
            ? Math.min(100, Math.round(((xp - currentLevel.minXp) / span) * 100))
            : 100;
        return { xp, currentLevel, nextLevel, levelProgress, completedTasks, completedPhases };
    }

    function calculateFromChecklists(checklists = []) {
        const completedTasks = checklists.reduce((total, checklist) =>
            total + (checklist.tasks || checklist.items || []).filter(task => task.completed).length, 0);
        const completedPhases = checklists.filter(checklist => checklist.completed).length;
        return calculateFromCounts({ completedTasks, completedPhases });
    }

    function getChecklistCompletionRewards({ taskCompleted = false, phaseCompleted = false } = {}) {
        const rewards = [];
        if (taskCompleted) rewards.push({ type: "task", xp: TASK_XP, label: "Tarefa concluida" });
        if (phaseCompleted) rewards.push({ type: "phase", xp: PHASE_XP, label: "Fase concluida" });
        return rewards;
    }

    window.UniCheckProgression = {
        TASK_XP,
        PHASE_XP,
        LEVELS,
        calculateFromCounts,
        calculateFromChecklists,
        getChecklistCompletionRewards
    };
})();
