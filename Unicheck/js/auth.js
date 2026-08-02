(function () {
    const PROFILE_STORAGE_KEY = "userProfile";
    const SUPABASE_AUTH_STORAGE_PATTERNS = [
        /^sb-.*auth-token/i,
        /^sb-.*auth-token-code-verifier/i,
        /^sb-.*auth-token-challenge/i,
        /^supabase\.auth\.token$/i
    ];

    function getClient() {
        const client = window.UniCheckSupabase?.client;
        if (!client) {
            throw new Error("Supabase nao configurado. Preencha as chaves em js/config.js.");
        }
        return client;
    }

    function getProfileStorageKey() {
        return window.UniCheckConfig?.STORAGE_KEYS?.USER_PROFILE || PROFILE_STORAGE_KEY;
    }

    function getInitials(name, email) {
        const source = (name || email || "Usuario").trim();
        const parts = source.split(/\s+/).filter(Boolean);
        return parts.slice(0, 2).map(part => part[0]?.toUpperCase() || "").join("") || "US";
    }

    function buildProfile(user) {
        const metadata = user?.user_metadata || {};
        const nome = metadata.full_name || metadata.nome || user?.email?.split("@")[0] || "Usuario";

        const fotoUrl = metadata.photo_url || metadata.foto_url || null;

        return {
            id: user?.id || "",
            nome,
            email: user?.email || "",
            birthDate: metadata.birth_date || "",
            avatarText: getInitials(nome, user?.email),
            foto_url: fotoUrl,
            avatarImage: fotoUrl
        };
    }

    function saveProfile(user) {
        if (!user) return null;
        const profile = buildProfile(user);
        localStorage.setItem(getProfileStorageKey(), JSON.stringify(profile));
        return profile;
    }

    function clearProfile() {
        localStorage.removeItem(getProfileStorageKey());
    }

    function clearSupabaseAuthStorage() {
        const storageKeys = [];

        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);
            if (!key) continue;

            if (SUPABASE_AUTH_STORAGE_PATTERNS.some(pattern => pattern.test(key))) {
                storageKeys.push(key);
            }
        }

        for (let index = 0; index < sessionStorage.length; index += 1) {
            const key = sessionStorage.key(index);
            if (!key) continue;

            if (SUPABASE_AUTH_STORAGE_PATTERNS.some(pattern => pattern.test(key))) {
                storageKeys.push({ key, session: true });
            }
        }

        storageKeys.forEach(entry => {
            if (typeof entry === "string") {
                localStorage.removeItem(entry);
                return;
            }

            if (entry?.session) {
                sessionStorage.removeItem(entry.key);
            }
        });
    }

    function getPlatformHome() {
        return `${window.location.origin}${window.location.pathname.replace(/\/landing\/.*$/i, "/platform/index-interno.html").replace(/\/platform\/.*$/i, "/platform/index-interno.html")}`;
    }

    function getLoginPage() {
        return `${window.location.origin}${window.location.pathname.replace(/\/platform\/.*$/i, "/landing/login_cadastro.html").replace(/\/landing\/.*$/i, "/landing/login_cadastro.html")}`;
    }

    function normalizeErrorMessage(error) {
        const message = error?.message || "Nao foi possivel concluir a autenticacao.";

        if (/invalid login credentials/i.test(message)) {
            return "E-mail ou senha invalidos.";
        }

        if (/email not confirmed/i.test(message)) {
            return "Confirme seu e-mail no link enviado pelo Supabase antes de entrar.";
        }

        if (/already registered/i.test(message)) {
            return "Este e-mail ja esta cadastrado.";
        }

        return message;
    }

    async function getSession() {
        const client = getClient();
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        return data.session;
    }

    async function getUser() {
        const client = getClient();
        const { data, error } = await client.auth.getUser();
        if (error) throw error;
        return data.user || null;
    }

    async function getAuthDebugSnapshot(context, extra = {}) {
        const client = getClient();
        const [sessionResult, userResult] = await Promise.allSettled([
            client.auth.getSession(),
            client.auth.getUser()
        ]);

        const session = sessionResult.status === "fulfilled" ? sessionResult.value.data.session || null : null;
        const user = userResult.status === "fulfilled" ? userResult.value.data.user || null : null;

        const snapshot = {
            context,
            session: session
                ? {
                    userId: session.user?.id || null,
                    email: session.user?.email || null,
                    expiresAt: session.expires_at || null
                }
                : null,
            user: user
                ? {
                    userId: user.id || null,
                    email: user.email || null
                }
                : null,
            sessionError: sessionResult.status === "rejected" ? sessionResult.reason?.message || String(sessionResult.reason) : null,
            userError: userResult.status === "rejected" ? userResult.reason?.message || String(userResult.reason) : null,
            extra
        };

        console.info("[UniCheckAuth] Estado de autenticacao", snapshot);
        return { session, user, snapshot };
    }

    async function restoreSession() {
        const { session, user } = await getAuthDebugSnapshot("restoreSession");

        if (user) {
            saveProfile(user);
            return session || { user };
        }

        clearProfile();
        return null;
    }

    async function register({ fullName, email, password, birthDate }) {
        const client = getClient();
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    birth_date: birthDate
                }
            }
        });

        if (error) throw error;
        if (data.user) saveProfile(data.user);
        return data;
    }

    async function login({ email, password }) {
        const client = getClient();
        const { data, error } = await client.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        if (data.user) saveProfile(data.user);
        return data;
    }

    async function logout(options = {}) {
        const client = getClient();
        const redirectTo = options.redirectTo === undefined ? getLoginPage() : options.redirectTo;
        let signOutError = null;

        try {
            await client.auth.signOut();
        } catch (error) {
            signOutError = error;
            console.error("[UniCheckAuth] Falha ao chamar signOut()", error);
        }

        clearProfile();
        clearSupabaseAuthStorage();

        if (redirectTo) {
            window.location.href = redirectTo;
        }

        if (signOutError) {
            console.warn("[UniCheckAuth] Logout concluido localmente apesar da falha remota.");
        }
    }

    async function requireAuth(options = {}) {
        const redirectTo = options.redirectTo === undefined ? getLoginPage() : options.redirectTo;
        const { session, user } = await getAuthDebugSnapshot("requireAuth", { redirectTo });

        if (user) {
            saveProfile(user);
            return session || { user };
        }

        clearProfile();

        if (redirectTo) {
            window.location.href = redirectTo;
        }

        return null;
    }

    async function onAuthStateChange(callback) {
        const client = getClient();
        return client.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                saveProfile(session.user);
            } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
                clearProfile();
                clearSupabaseAuthStorage();
            } else {
                clearProfile();
            }

            console.info("[UniCheckAuth] auth state change", {
                event,
                userId: session?.user?.id || null,
                email: session?.user?.email || null
            });

            if (typeof callback === "function") {
                callback(event, session);
            }
        });
    }

    onAuthStateChange(() => {});

    window.UniCheckAuth = {
        register,
        login,
        logout,
        getSession,
        getUser,
        restoreSession,
        requireAuth,
        onAuthStateChange,
        getPlatformHome,
        getLoginPage,
        getProfileStorageKey,
        normalizeErrorMessage,
        getAuthDebugSnapshot,
        clearProfile,
        clearSupabaseAuthStorage
    };
})();
