(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.UniCheckProgression = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    const XP_REWARDS = Object.freeze({
        CHECKLIST_TASK: 10,
        CHECKLIST_PHASE: 50,
        MANUAL_SECTION: 0,
        MANUAL_COMPLETION: 0
    });

    const LEVELS = Object.freeze([
        Object.freeze({ level: 1, name: 'Calouro', threshold: 0 }),
        Object.freeze({ level: 2, name: 'Explorador', threshold: 90 }),
        Object.freeze({ level: 3, name: 'Conectado', threshold: 180 }),
        Object.freeze({ level: 4, name: 'Veterano', threshold: 360 }),
        Object.freeze({ level: 5, name: 'Expert Acadêmico', threshold: 540 })
    ]);

    function toCount(value) {
        const number = Number(value);
        return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
    }

    function calculateXp({
        completedTasks = 0,
        completedPhases = 0,
        completedManualSections = 0,
        manualCompleted = false
    } = {}) {
        return (
            toCount(completedTasks) * XP_REWARDS.CHECKLIST_TASK +
            toCount(completedPhases) * XP_REWARDS.CHECKLIST_PHASE +
            toCount(completedManualSections) * XP_REWARDS.MANUAL_SECTION +
            (manualCompleted ? XP_REWARDS.MANUAL_COMPLETION : 0)
        );
    }

    function summarizeChecklists(checklists = []) {
        return (Array.isArray(checklists) ? checklists : []).reduce((summary, checklist) => {
            const tasks = Array.isArray(checklist?.tasks) ? checklist.tasks : [];
            const completedTasks = tasks.filter(task => task?.completed === true).length;
            return {
                completedTasks: summary.completedTasks + completedTasks,
                completedPhases: summary.completedPhases + (tasks.length > 0 && completedTasks === tasks.length ? 1 : 0)
            };
        }, { completedTasks: 0, completedPhases: 0 });
    }

    function getLevelProgress(xpValue) {
        const xp = toCount(xpValue);
        let currentLevel = LEVELS[0];
        for (const level of LEVELS) {
            if (xp >= level.threshold) currentLevel = level;
            else break;
        }

        const currentIndex = LEVELS.indexOf(currentLevel);
        const nextLevel = LEVELS[currentIndex + 1] || null;
        const span = nextLevel ? nextLevel.threshold - currentLevel.threshold : 0;
        const earnedInLevel = Math.max(0, xp - currentLevel.threshold);
        const percentage = nextLevel ? Math.min(100, Math.round((earnedInLevel / span) * 100)) : 100;

        return Object.freeze({
            xp,
            currentLevel,
            nextLevel,
            xpToNextLevel: nextLevel ? Math.max(0, nextLevel.threshold - xp) : 0,
            earnedInLevel,
            levelSpan: span,
            percentage
        });
    }

    function calculateProgression(input = {}) {
        return getLevelProgress(calculateXp(input));
    }

    function calculateFromChecklists(checklists = [], futureSources = {}) {
        return calculateProgression({ ...futureSources, ...summarizeChecklists(checklists) });
    }

    function getChecklistCompletionRewards({ taskCompleted = false, phaseCompleted = false } = {}) {
        const rewards = [];
        if (taskCompleted) rewards.push(Object.freeze({ type: 'task', xp: XP_REWARDS.CHECKLIST_TASK, label: 'Tarefa concluída' }));
        if (phaseCompleted) rewards.push(Object.freeze({ type: 'phase', xp: XP_REWARDS.CHECKLIST_PHASE, label: 'Fase concluída' }));
        return Object.freeze(rewards);
    }

    return Object.freeze({
        XP_REWARDS,
        LEVELS,
        calculateXp,
        summarizeChecklists,
        getLevelProgress,
        calculateProgression,
        calculateFromChecklists,
        getChecklistCompletionRewards
    });
});
