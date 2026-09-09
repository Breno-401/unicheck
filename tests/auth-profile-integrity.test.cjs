const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const validationSource = fs.readFileSync(require.resolve("../Unicheck/js/core/validation.js"), "utf8");
const authSource = fs.readFileSync(require.resolve("../Unicheck/js/core/auth.js"), "utf8");
const profileSource = fs.readFileSync(require.resolve("../Unicheck/js/services/profile.js"), "utf8");
const loginSource = fs.readFileSync(require.resolve("../Unicheck/landing/js/login.js"), "utf8");
const loginHtml = fs.readFileSync(require.resolve("../Unicheck/landing/login-cadastro.html"), "utf8");
const profileHtml = fs.readFileSync(require.resolve("../Unicheck/platform/pages/configuracoes-perfil/configuracoes-perfil.html"), "utf8");
const migrationSource = fs.readFileSync(
    require.resolve("../Unicheck/supabase/migrations/20260909191400_professionalize_profile_validation.sql"),
    "utf8"
);
const baselineMigration = fs.readFileSync(
    require.resolve("../Unicheck/supabase/migrations/20260824_prerelease_reset.sql"),
    "utf8"
);

function createStorage() {
    const data = new Map();
    return {
        get length() { return data.size; },
        key(index) { return [...data.keys()][index] ?? null; },
        getItem(key) { return data.get(key) ?? null; },
        setItem(key, value) { data.set(key, String(value)); },
        removeItem(key) { data.delete(key); }
    };
}

function loadAuth() {
    const calls = [];
    const client = {
        auth: {
            onAuthStateChange: () => ({ data: { subscription: {} } }),
            signUp: async payload => {
                calls.push(payload);
                return { data: { user: null, session: null }, error: null };
            },
            signInWithPassword: async payload => ({ data: { session: { user: { id: "user-1", email: payload.email } } }, error: null })
        }
    };
    const window = {
        UniCheckSupabase: { client },
        UniCheckConfig: { STORAGE_KEYS: { USER_PROFILE: "userProfile" } },
        location: { origin: "https://example.test", pathname: "/Unicheck/landing/login-cadastro.html" }
    };
    const context = { window, localStorage: createStorage(), sessionStorage: createStorage(), console };
    vm.runInNewContext(validationSource, context);
    vm.runInNewContext(authSource, context);
    return { auth: window.UniCheckAuth, calls };
}

function loadProfileService() {
    const authPayloads = [];
    const tablePayloads = [];
    let currentTablePayload = null;
    const query = {
        update(payload) {
            currentTablePayload = payload;
            tablePayloads.push(payload);
            return this;
        },
        insert(payload) {
            currentTablePayload = payload;
            return this;
        },
        eq() { return this; },
        select() { return this; },
        async single() {
            return {
                data: { ...currentTablePayload, email: "old@example.com" },
                error: null
            };
        }
    };
    const user = { id: "user-1", email: "old@example.com", user_metadata: {} };
    const window = {
        UniCheckSupabase: {
            client: {
                auth: {
                    async updateUser(payload) {
                        authPayloads.push(payload);
                        return { data: { user }, error: null };
                    }
                },
                from: () => query
            }
        },
        UniCheckAuth: { getSession: async () => ({ user }) },
        UniCheckConfig: { STORAGE_KEYS: { USER_PROFILE: "userProfile" } },
        dispatchEvent() {}
    };
    const context = {
        window,
        localStorage: createStorage(),
        CustomEvent: class {},
        console
    };
    vm.runInNewContext(validationSource, context);
    vm.runInNewContext(profileSource, context);
    return { profile: window.UniCheckProfile, authPayloads, tablePayloads };
}

test("serviço de Auth recusa cadastro inválido antes do Supabase", async () => {
    const { auth, calls } = loadAuth();
    await assert.rejects(
        auth.register({ fullName: "Breno", email: "breno@example.com", birthDate: "2000-01-01", password: "Senha123" }),
        /nome e sobrenome/i
    );
    assert.equal(calls.length, 0);
});

test("serviço de Auth normaliza cadastro mesmo quando chamado fora do formulário", async () => {
    const { auth, calls } = loadAuth();
    await auth.register({
        fullName: "  Breno    Clemente  ",
        email: "  BRENO@EXAMPLE.COM ",
        birthDate: "2000-01-01",
        password: "Senha123"
    });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].email, "breno@example.com");
    assert.equal(calls[0].options.data.full_name, "Breno Clemente");
});

test("erros técnicos desconhecidos não são exibidos ao usuário", () => {
    const { auth } = loadAuth();
    const message = auth.normalizeErrorMessage(new Error("relation users_profile does not exist at SQL line 42"));
    assert.equal(message, "Não foi possível concluir a operação. Tente novamente.");
    assert.doesNotMatch(message, /users_profile|SQL/i);
});

test("serviço de perfil revalida, normaliza e persiste somente a allowlist", async () => {
    const { profile, authPayloads, tablePayloads } = loadProfileService();

    await assert.rejects(
        profile.updateMyProfile({ nome: "Breno", email: "old@example.com", ra: "", id: "attacker" }),
        /nome e sobrenome/i
    );
    assert.equal(authPayloads.length, 0);
    assert.equal(tablePayloads.length, 0);

    await profile.updateMyProfile({
        nome: "  Breno    Clemente ",
        email: " NEW@EXAMPLE.COM ",
        ra: "   ",
        foto_url: null,
        id: "attacker",
        created_at: "forged"
    });

    assert.equal(authPayloads[0].email, "new@example.com");
    assert.equal(authPayloads[0].data.full_name, "Breno Clemente");
    assert.deepEqual(Object.keys(tablePayloads[0]).sort(), ["foto_url", "nome", "ra"]);
    assert.equal(tablePayloads[0].nome, "Breno Clemente");
    assert.equal(tablePayloads[0].ra, null);
});

test("formulários carregam validação compartilhada e semântica de erro", () => {
    assert.match(loginHtml, /js\/core\/validation\.js[\s\S]*js\/core\/auth\.js/);
    assert.match(profileHtml, /js\/core\/validation\.js[\s\S]*js\/core\/auth\.js/);
    assert.match(loginHtml, /id="nomeCadastro"[^>]*maxlength="100"[^>]*aria-describedby="nomeCadastroError"/);
    assert.match(profileHtml, /id="nome"[^>]*maxlength="100"[^>]*aria-describedby="nomeError"/);
    assert.match(profileHtml, /id="email"[^>]*aria-describedby="emailHint emailError"/);
});

test("guardas de reentrada protegem login e cadastro além do disabled", () => {
    assert.match(loginSource, /if \(loginPending\) return;/);
    assert.match(loginSource, /if \(registerPending\) return;/);
    assert.match(loginSource, /finally \{[\s\S]*?loginPending = false;[\s\S]*?setSubmitLoading/);
    assert.match(loginSource, /finally \{[\s\S]*?registerPending = false;[\s\S]*?setSubmitLoading/);
});

test("migration valida nome, normaliza campos e mantém ownership da RLS", () => {
    assert.match(migrationSource, /check \(public\.is_valid_full_name\(nome\)\)[\s\S]*not valid/i);
    assert.match(migrationSource, /new\.nome := public\.normalize_full_name\(new\.nome\)/i);
    assert.match(migrationSource, /new\.email := canonical_email/i);
    assert.match(migrationSource, /revoke update \(email\) on table public\.users_profile from authenticated/i);
    assert.match(migrationSource, /after update of email on auth\.users/i);
    assert.match(baselineMigration, /users_profile_update_own[\s\S]*using \(id = \(select auth\.uid\(\)\)\)[\s\S]*with check \(id = \(select auth\.uid\(\)\)\)/i);
});

test("payload persistido continua sendo allowlist e não envia id ou e-mail no update", () => {
    const persistedBlock = profileSource.match(/const persistedProfile = \{([\s\S]*?)\n        \};/)?.[1] || "";
    assert.match(persistedBlock, /nome: cleanProfile\.nome/);
    assert.match(persistedBlock, /ra: cleanProfile\.ra/);
    assert.match(persistedBlock, /foto_url: cleanProfile\.foto_url/);
    assert.doesNotMatch(persistedBlock, /\bid\b|email/);
});
