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
        const session = await window.UniCheckAuth?.getSession?.();
        const user = session?.user;

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
        const user = await getCurrentUser();

        const { data, error } = await client
            .from(PROFILE_TABLE)
            .select("nome, email, foto_url")
            .eq(PROFILE_USER_ID_COLUMN, user.id)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (data) {
            const profile = normalizeProfile(data, user);
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
            throw insertError;
        }

        const profile = normalizeProfile(inserted, user);
        persistLocalProfile(profile);
        return profile;
    }

    async function getMyProfile() {
        return ensureProfileRow();
    }

    async function updateMyProfile({ nome, email, foto_url }) {
        const client = getClient();
        const user = await getCurrentUser();

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
            throw authError;
        }

        const { data, error } = await client
            .from(PROFILE_TABLE)
            .upsert(
                {
                    [PROFILE_USER_ID_COLUMN]: user.id,
                    ...cleanProfile
                },
                { onConflict: PROFILE_USER_ID_COLUMN }
            )
            .select("nome, email, foto_url")
            .single();

        if (error) {
            throw error;
        }

        const profile = normalizeProfile(data, {
            ...user,
            email: cleanProfile.email || user.email,
            user_metadata: {
                ...(user.user_metadata || {}),
                full_name: cleanProfile.nome,
                photo_url: cleanProfile.foto_url
            }
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
