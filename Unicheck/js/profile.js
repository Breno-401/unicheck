(function () {
    // Ajuste PROFILE_USER_ID_COLUMN se a coluna de relacionamento com auth.users
    // na sua tabela users_profile tiver outro nome.
    const PROFILE_TABLE = "users_profile";
    const PROFILE_USER_ID_COLUMN = "user_id";
    const STORAGE_KEY = "userProfile";

    function getClient() {
        const client = window.UniCheckSupabase?.client;
        if (!client) {
            throw new Error("Supabase nao configurado. Verifique js/config.js.");
        }
        return client;
    }

    async function getCurrentUser() {
        const auth = window.UniCheckAuth;
        if (!auth) {
            throw new Error("Modulo de autenticacao nao encontrado.");
        }

        const debug = await auth.getAuthDebugSnapshot?.("profile.getCurrentUser");
        const user = debug?.user || debug?.session?.user || await auth.getUser?.();

        if (!user) {
            throw new Error("Nenhum usuario autenticado.");
        }

        console.info("[UniCheckProfile] Usuario autenticado confirmado", {
            userId: user.id || null,
            email: user.email || null,
            hasSession: Boolean(debug?.session)
        });

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
        const nome = row?.nome || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";
        const email = row?.email || user?.email || "";
        const fotoUrl = row?.foto_url || user?.user_metadata?.photo_url || null;

        return {
            id: user?.id || "",
            nome,
            email,
            foto_url: fotoUrl,
            avatarImage: fotoUrl,
            avatarText: getInitials(nome, email)
        };
    }

    function persistLocalProfile(profile) {
        localStorage.setItem(getStorageKey(), JSON.stringify(profile));
        if (window.ProfileManager?.sync) {
            window.ProfileManager.sync();
        }
        return profile;
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
                .select("nome, email, foto_url")
                .eq(PROFILE_USER_ID_COLUMN, user.id)
                .maybeSingle());
        } catch (queryError) {
            error = queryError;
        }

        if (error) {
            console.error("[UniCheckProfile] Erro ao consultar users_profile", {
                userId: user.id || null,
                message: error?.message || error
            });
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

        const baseProfile = {
            [PROFILE_USER_ID_COLUMN]: user.id,
            nome: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario",
            email: user.email || "",
            foto_url: user.user_metadata?.photo_url || null
        };

        const { data: inserted, error: insertError } = await client
            .from(PROFILE_TABLE)
            .upsert(baseProfile, { onConflict: PROFILE_USER_ID_COLUMN })
            .select("nome, email, foto_url")
            .single();

        if (insertError) {
            console.error("[UniCheckProfile] Erro ao criar perfil base", {
                userId: user.id || null,
                message: insertError?.message || insertError
            });
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
        return ensureProfileRow();
    }

    async function updateMyProfile({ nome, email, foto_url }) {
        const client = getClient();
        const user = await getCurrentUser();

        console.info("[UniCheckProfile] Atualizando perfil", {
            userId: user.id || null,
            emailAnterior: user.email || null
        });

        const cleanProfile = {
            nome: (nome || "").trim(),
            email: (email || "").trim(),
            foto_url: foto_url || null
        };

        const updatePayload = {
            data: {
                ...(user.user_metadata || {}),
                full_name: cleanProfile.nome,
                photo_url: cleanProfile.foto_url
            }
        };

        if (cleanProfile.email && cleanProfile.email !== user.email) {
            updatePayload.email = cleanProfile.email;
        }

        const { error: authError } = await client.auth.updateUser(updatePayload);
        if (authError) {
            console.error("[UniCheckProfile] Erro ao atualizar auth.users", {
                userId: user.id || null,
                message: authError?.message || authError
            });
            throw authError;
        }

        let data = null;
        let tableError = null;

        try {
            ({ data, error: tableError } = await client
                .from(PROFILE_TABLE)
                .upsert(
                    {
                        [PROFILE_USER_ID_COLUMN]: user.id,
                        ...cleanProfile
                    },
                    { onConflict: PROFILE_USER_ID_COLUMN }
                )
                .select("nome, email, foto_url")
                .single());
        } catch (queryError) {
            tableError = queryError;
        }

        if (tableError) {
            console.warn("[UniCheckProfile] Falha ao atualizar users_profile, mantendo perfil local.", {
                userId: user.id || null,
                message: tableError?.message || tableError
            });
        }

        const profile = normalizeProfile(data || cleanProfile, {
            ...user,
            email: cleanProfile.email || user.email,
            user_metadata: {
                ...(user.user_metadata || {}),
                full_name: cleanProfile.nome,
                photo_url: cleanProfile.foto_url
            }
        });

        console.info("[UniCheckProfile] Perfil atualizado com sucesso", {
            userId: user.id || null,
            nome: profile.nome,
            email: profile.email
        });
        persistLocalProfile(profile);
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
