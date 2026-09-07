const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const progressionSource = fs.readFileSync(require.resolve("../Unicheck/js/services/progression.js"), "utf8");

function loadProgression() {
    const window = {};
    vm.runInNewContext(progressionSource, { window, console });
    return window.UniCheckProgression;
}

test("XP e calculado pelo conjunto concluido sem credito duplicavel", () => {
    const progression = loadProgression();
    const checklists = [{
        completed: false,
        tasks: [
            { id: "task-1", completed: true },
            { id: "task-2", completed: false }
        ]
    }];

    const first = progression.calculateFromChecklists(checklists);
    const repeated = progression.calculateFromChecklists(checklists);

    assert.equal(first.xp, progression.TASK_XP);
    assert.equal(repeated.xp, first.xp);
    assert.equal(first.completedTasks, 1);
});

test("transicao de nivel preserva XP excedente no novo nivel", () => {
    const progression = loadProgression();
    const before = progression.calculateFromCounts({ completedTasks: 17, completedPhases: 1 });
    const after = progression.calculateFromCounts({ completedTasks: 18, completedPhases: 1 });

    assert.equal(before.xp, 210);
    assert.equal(before.currentLevel.level, 2);
    assert.equal(before.levelXp, 110);
    assert.equal(before.levelXpMax, 120);
    assert.equal(after.xp, 220);
    assert.equal(after.currentLevel.level, 3);
    assert.equal(after.levelXp, 0);
});

test("conclusao de fase combina recompensa da etapa e da fase uma unica vez", () => {
    const progression = loadProgression();
    const rewards = progression.getChecklistCompletionRewards({ taskCompleted: true, phaseCompleted: true });

    assert.deepEqual(Array.from(rewards, reward => reward.xp), [progression.TASK_XP, progression.PHASE_XP]);
    assert.equal(rewards.reduce((total, reward) => total + reward.xp, 0), 50);
});
