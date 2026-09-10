(function () {
    // users_profile.id e a chave primaria e tambem referencia auth.users.id.
    const PROFILE_TABLE = "users_profile";
    const PROFILE_USER_ID_COLUMN = "id";
    const STORAGE_KEY = "userProfile";
    const SUCCESS_TTL_MS = 5 * 60 * 1000;
    const ERROR_COOLDOWN_MS = 30 * 1000;
    let inFlight = null;
    let memoryEntry = null;
    let retryAfter = 0;

    function getClient() {
        const client = window.UniCheckSupabase?.client;
        if (!client) {
            throw new Error("Supabase nao configurado. Verifique js/core/config.js.");
        }
        return client;
    }

    function getValidation() {
        const validation = window.UniCheckValidation;
        if (!validation) throw new Error("Módulo de validação não carregado.");
        return validation;
    }

    function createPublicError(message) {
        const error = new Error(message);
        error.code = "UNICHECK_VALIDATION";
        error.isUserSafe = true;
        return error;
    }

    async function getCurrentUser() {
        const auth = window.UniCheckAuth;
        if (!auth) {
            throw new Error("Modulo de autenticacao nao encontrado.");
        }

        const session = await auth.getSession?.();
        const user = session?.user || null;

        if (!user) {
            throw new Error("Nenhum usuario autenticado.");
        }

        return user;
    }

    function getInitials(name, email) {
        const source = (name || email || "Usuario").trim();
        const parts = source.split(/\s+/).filter(Boolean);
        return parts.slice(0, 2).map(part => part[0]?.toUpperCase() || "").join("") || "US";
    }

    function getStorageKey() {
        return window.UniCheckConfig?.STORAGE_KEYS?.USER_PROFILE || STORAGE_KEY;
    }

    function getStoredProfile() {
        try {
            const rawProfile = localStorage.getItem(getStorageKey());
            return rawProfile ? JSON.parse(rawProfile) : null;
        } catch (error) {
            console.warn("[UniCheckProfile] Falha ao ler perfil em cache", error);
            return null;
        }
    }

    function normalizeProfile(row, user) {
        const validation = window.UniCheckValidation;
        const nome = validation?.normalizeFullName(
            row?.nome || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario"
        ) || "Usuario";
        const email = validation?.normalizeEmail(row?.email || user?.email || "") || "";
        // Avatar is sourced exclusively from public.users_profile. Auth metadata
        // must never become an image store (especially for data URLs/base64).
        const fotoUrl = row?.foto_url || null;

        return {
            id: user?.id || "",
            nome,
            email,
            ra: row?.ra || "",
            foto_url: fotoUrl,
            avatarImage: fotoUrl,
            avatarText: getInitials(nome, email)
        };
    }

    function persistLocalProfile(profile) {
        localStorage.setItem(getStorageKey(), JSON.stringify(profile));
        window.dispatchEvent(new CustomEvent("unicheck:profile-updated", { detail: { profile } }));
        return profile;
    }

    function logRemoteError(context, error, userId) {
        console.error(context, {
            userId: userId || null,
            code: error?.code || null,
            message: error?.message || String(error),
            details: error?.details || null,
            hint: error?.hint || null,
            status: error?.status || error?.statusCode || error?.response?.status || null
        });
    }

    async function ensureProfileRow() {
        const client = getClient();
        const cachedProfile = getStoredProfile();
        const user = await getCurrentUser().catch(error => {
            if (cachedProfile?.id) {
                console.warn("[UniCheckProfile] Usuario autenticado indisponivel, usando perfil em cache.", error);
                return { id: cachedProfile.id, email: cachedProfile.email || "", user_metadata: cachedProfile };
            }
            throw error;
        });

        console.info("[UniCheckProfile] Buscando perfil no Supabase", {
            userId: user.id || null,
            email: user.email || null
        });

        let data = null;
        let error = null;

        try {
            ({ data, error } = await client
                .from(PROFILE_TABLE)
                .select("nome, email, foto_url, ra")
                .eq(PROFILE_USER_ID_COLUMN, user.id)
                .maybeSingle());
        } catch (queryError) {
            error = queryError;
        }

        if (error) {
            logRemoteError("[UniCheckProfile] Erro ao consultar users_profile", error, user.id);
            retryAfter = Date.now() + ERROR_COOLDOWN_MS;
            const fallbackProfile = normalizeProfile(cachedProfile, user);
            persistLocalProfile(fallbackProfile);
            return fallbackProfile;
        }

        if (data) {
            const profile = normalizeProfile(data, user);
            console.info("[UniCheckProfile] Perfil encontrado na tabela users_profile", {
                userId: user.id || null,
                nome: profile.nome,
                email: profile.email
            });
            persistLocalProfile(profile);
            return profile;
        }

        const validation = getValidation();
        const metadataName = validation.validateFullName(user.user_metadata?.full_name || "");
        const baseProfile = {
            [PROFILE_USER_ID_COLUMN]: user.id,
            nome: metadataName.valid ? metadataName.value : "Usuário UniCheck",
            email: validation.normalizeEmail(user.email || ""),
            foto_url: null
        };

        const { data: inserted, error: insertError } = await client
            .from(PROFILE_TABLE)
            .insert(baseProfile)
            .select("nome, email, foto_url, ra")
            .single();

        if (insertError) {
            logRemoteError("[UniCheckProfile] Erro ao criar perfil base", insertError, user.id);
            retryAfter = Date.now() + ERROR_COOLDOWN_MS;
            const fallbackProfile = normalizeProfile(cachedProfile || baseProfile, user);
            persistLocalProfile(fallbackProfile);
            return fallbackProfile;
        }

        const profile = normalizeProfile(inserted, user);
        console.info("[UniCheckProfile] Perfil base criado/atualizado", {
            userId: user.id || null,
            nome: profile.nome,
            email: profile.email
        });
        persistLocalProfile(profile);
        return profile;
    }

    async function getMyProfile() {
        const cachedProfile = getStoredProfile();
        const userId = (await window.UniCheckAuth?.getSession?.())?.user?.id || cachedProfile?.id || null;
        if (memoryEntry?.userId === userId && Date.now() - memoryEntry.loadedAt < SUCCESS_TTL_MS) return memoryEntry.profile;
        if (Date.now() < retryAfter && cachedProfile?.id === userId) return cachedProfile;
        if (inFlight?.userId === userId) return inFlight.promise;

        const promise = ensureProfileRow().then(profile => {
            memoryEntry = { userId: profile.id, profile, loadedAt: Date.now() };
            return profile;
        }).finally(() => {
            if (inFlight?.promise === promise) inFlight = null;
        });
        inFlight = { userId, promise };
        return promise;
    }

    async function updateMyProfile({ nome, email, foto_url, ra }) {
        const client = getClient();
        const user = await getCurrentUser();
        const validation = getValidation();
        const nameResult = validation.validateFullName(nome);
        const emailResult = validation.validateEmail(email);
        const raResult = validation.validateRa(ra);
        const currentEmail = validation.normalizeEmail(user.email || "");

        for (const result of [nameResult, emailResult, raResult]) {
            if (!result.valid) throw createPublicError(result.error);
        }

        console.info("[UniCheckProfile] Atualizando perfil", {
            userId: user.id || null,
            emailAnterior: user.email || null
        });

        const cleanProfile = {
            nome: nameResult.value,
            email: emailResult.value,
            ra: raResult.value,
            foto_url: foto_url || null
        };

        const updatePayload = {
            data: {
                full_name: cleanProfile.nome,
                // Supabase merges metadata updates. Explicit nulls also purge any
                // avatar left by the legacy base64 implementation.
                photo_url: null,
                foto_url: null
            }
        };

        if (cleanProfile.email && cleanProfile.email !== currentEmail) {
            updatePayload.email = cleanProfile.email;
        }

        const { data: authData, error: authError } = await client.auth.updateUser(updatePayload);
        if (authError) {
            console.error("[UniCheckProfile] Erro ao atualizar auth.users", {
                userId: user.id || null,
                message: authError?.message || authError
            });
            throw authError;
        }

        // Com confirmacao de troca de e-mail habilitada, auth.users continua
        // retornando o endereco atual ate o usuario confirmar o novo.
        const confirmedEmail = validation.normalizeEmail(
            authData?.user?.email || currentEmail || cleanProfile.email
        );
        const persistedProfile = {
            nome: cleanProfile.nome,
            ra: cleanProfile.ra,
            foto_url: cleanProfile.foto_url
        };

        let data = null;
        let tableError = null;

        try {
            ({ data, error: tableError } = await client
                .from(PROFILE_TABLE)
                .update(persistedProfile)
                .eq(PROFILE_USER_ID_COLUMN, user.id)
                .select("nome, email, foto_url, ra")
                .single());

            if (tableError?.code === "PGRST116") {
                ({ data, error: tableError } = await client
                    .from(PROFILE_TABLE)
                    .insert({
                        [PROFILE_USER_ID_COLUMN]: user.id,
                        email: confirmedEmail,
                        ...persistedProfile
                    })
                    .select("nome, email, foto_url, ra")
                    .single());
            }
        } catch (queryError) {
            tableError = queryError;
        }

        if (tableError) {
            logRemoteError("[UniCheckProfile] Falha ao atualizar users_profile.", tableError, user.id);
            throw tableError;
        }

        const profile = normalizeProfile(data || persistedProfile, {
            ...(authData?.user || user),
            email: confirmedEmail,
            user_metadata: {
                ...(authData?.user?.user_metadata || user.user_metadata || {}),
                full_name: cleanProfile.nome
            }
        });

        console.info("[UniCheckProfile] Perfil atualizado com sucesso", {
            userId: user.id || null,
            nome: profile.nome,
            email: profile.email
        });
        persistLocalProfile(profile);
        memoryEntry = { userId: profile.id, profile, loadedAt: Date.now() };
        return profile;
    }

    window.UniCheckProfile = {
        PROFILE_TABLE,
        PROFILE_USER_ID_COLUMN,
        getMyProfile,
        updateMyProfile,
        persistLocalProfile
    };
})();
