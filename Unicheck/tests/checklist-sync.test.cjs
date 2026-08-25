const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const checklistSource = fs.readFileSync(require.resolve("../js/checklist.js"), "utf8");

function createStorage(initial = {}) {
    const values = new Map(Object.entries(initial));
    return {
        getItem: key => values.has(key) ? values.get(key) : null,
        setItem: (key, value) => values.set(key, String(value)),
        removeItem: key => values.delete(key)
    };
}

function loadChecklist({ storage = createStorage(), upsert } = {}) {
    let upsertPayload = null;
    const query = {
        select() { return this; },
        eq() { return this; },
        upsert(payload) { upsertPayload = payload; return this; },
        abortSignal() {
            return upsertPayload && upsert
                ? upsert(upsertPayload)
                : Promise.resolve({ data: [], error: null });
        }
    };
    const window = {
        UniCheckSupabase: { client: { from: () => query } },
        setTimeout,
        clearTimeout
    };
    vm.runInNewContext(checklistSource, { window, localStorage: storage, AbortController, console });
    return { api: window.UniCheckChecklist, storage };
}

const phase = "10000000-0000-4000-8000-000000000001";
const task = "20000000-0000-4000-8000-000000000001";
const progress = completed => ({ [phase]: { tasks: { [task]: completed } } });

test("A: remoto vazio vence cache antigo cheio", () => {
    const { api } = loadChecklist();
    assert.equal(Object.keys(api.reconcileProgressMaps({}, progress(true), {})).length, 0);
});

test("B e C: remoto vence cache vazio ou divergente sem pending", () => {
    const { api } = loadChecklist();
    assert.equal(api.reconcileProgressMaps(progress(true), {}, {})[phase].tasks[task], true);
    assert.equal(api.reconcileProgressMaps(progress(false), progress(true), {})[phase].tasks[task], false);
});

test("D: pending legitimo sobrepoe remoto e e removido apos upsert", async () => {
    let requests = 0;
    const { api } = loadChecklist({ upsert: async () => { requests += 1; return { error: null }; } });
    api.writePendingProgress("user-1", { [task]: { checklistId: phase, completed: true } });
    assert.equal(api.reconcileProgressMaps(progress(false), {}, api.readPendingProgress("user-1"))[phase].tasks[task], true);
    await api.flushPendingProgress("user-1");
    assert.equal(requests, 1);
    assert.equal(Object.keys(api.readPendingProgress("user-1")).length, 0);
});

test("E e F: falha preserva pending e recuperacao envia uma unica vez", async () => {
    let requests = 0;
    let unavailable = true;
    const { api } = loadChecklist({
        upsert: async () => {
            requests += 1;
            return unavailable ? { error: new Error("offline") } : { error: null };
        }
    });
    api.writeCachedProgress("user-1", progress(true));
    api.writePendingProgress("user-1", { [task]: { checklistId: phase, completed: false } });
    await assert.rejects(api.flushPendingProgress("user-1"), /offline/);
    assert.equal(api.readCachedProgress("user-1")[phase].tasks[task], true);
    assert.equal(Object.keys(api.readPendingProgress("user-1")).length, 1);
    unavailable = false;
    await api.flushPendingProgress("user-1");
    await api.flushPendingProgress("user-1");
    assert.equal(requests, 2);
    assert.equal(Object.keys(api.readPendingProgress("user-1")).length, 0);
});

test("cache legado v2 nao e lido pela versao v3", () => {
    const storage = createStorage({
        "unicheck_checklist_progress_v2:user-1": JSON.stringify(progress(true))
    });
    const { api } = loadChecklist({ storage });
    assert.equal(Object.keys(api.readCachedProgress("user-1")).length, 0);
});
