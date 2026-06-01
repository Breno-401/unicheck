(function () {
    const PROFILE_STORAGE_KEY = "userProfile";

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
            ra: metadata.ra || "",
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

    async function restoreSession() {
        const session = await getSession();
        if (session?.user) {
            saveProfile(session.user);
            return session;
        }

        clearProfile();
        return null;
    }

    async function register({ fullName, email, password, ra, birthDate }) {
        const client = getClient();
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    ra,
                    birth_date: birthDate
                }
            }
        });

        if (error) throw error;
        if (data.user) saveProfile(data.user);
        return data;
    }

    async function login({ email, password, ra }) {
        const client = getClient();
        const { data, error } = await client.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        const registeredRa = data.user?.user_metadata?.ra;
        if (ra && registeredRa && ra.trim() !== registeredRa.trim()) {
            await client.auth.signOut();
            clearProfile();
            throw new Error("O RA informado nao corresponde ao cadastro deste usuario.");
        }

        if (data.user) saveProfile(data.user);
        return data;
    }

    async function logout(options = {}) {
        const client = getClient();
        const redirectTo = options.redirectTo === undefined ? getLoginPage() : options.redirectTo;
        const { error } = await client.auth.signOut();
        if (error) throw error;

        clearProfile();

        if (redirectTo) {
            window.location.href = redirectTo;
        }
    }

    async function requireAuth(options = {}) {
        const redirectTo = options.redirectTo === undefined ? getLoginPage() : options.redirectTo;
        const session = await restoreSession();

        if (session?.user) {
            return session;
        }

        if (redirectTo) {
            window.location.href = redirectTo;
        }

        return null;
    }

    function onAuthStateChange(callback) {
        const client = getClient();
        return client.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                saveProfile(session.user);
            } else {
                clearProfile();
            }

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
        restoreSession,
        requireAuth,
        onAuthStateChange,
        getPlatformHome,
        getLoginPage,
        getProfileStorageKey,
        normalizeErrorMessage
    };
})();
