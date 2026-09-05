(function () {
    const AVATAR_BUCKET = "avatars";
    const MAX_ORIGINAL_AVATAR_SIZE = 5 * 1024 * 1024;
    const AVATAR_DIMENSION = 512;
    const AVATAR_QUALITY = 0.82;
    const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

    const state = {
        profile: {
            nome: "",
            email: "",
            ra: "",
            foto_url: null,
            avatarImage: null,
            avatarText: "US"
        },
        initialProfile: null,
        pendingPhotoFile: null,
        photoRemoved: false,
        previewObjectUrl: null,
        activeSection: "informacoes-pessoais",
        busy: false
    };

    function getClient() {
        const client = window.UniCheckSupabase?.client;
        if (!client) {
            throw new Error("Supabase nao configurado.");
        }
        return client;
    }

    async function getAuthenticatedUser() {
        const { data, error } = await getClient().auth.getUser();
        if (error) throw error;
        if (!data.user) throw new Error("Nenhum usuario autenticado.");
        return data.user;
    }

    function getInitials(name, email) {
        const source = (name || email || "Usuario").trim();
        const parts = source.split(/\s+/).filter(Boolean);
        return parts.slice(0, 2).map(function (part) {
            return part[0]?.toUpperCase() || "";
        }).join("") || "US";
    }

    function cloneProfile(profile) {
        return {
            nome: profile?.nome || "",
            email: profile?.email || "",
            ra: profile?.ra || "",
            foto_url: profile?.foto_url || null,
            avatarImage: profile?.foto_url || profile?.avatarImage || null,
            avatarText: profile?.avatarText || getInitials(profile?.nome, profile?.email)
        };
    }

    function revokePreviewUrl() {
        if (state.previewObjectUrl) {
            URL.revokeObjectURL(state.previewObjectUrl);
            state.previewObjectUrl = null;
        }
    }

    function loadImage(file) {
        return new Promise(function (resolve, reject) {
            const objectUrl = URL.createObjectURL(file);
            const image = new Image();
            image.onload = function () {
                URL.revokeObjectURL(objectUrl);
                resolve(image);
            };
            image.onerror = function () {
                URL.revokeObjectURL(objectUrl);
                reject(new Error("Nao foi possivel carregar a imagem selecionada."));
            };
            image.src = objectUrl;
        });
    }

    function canvasToWebpBlob(canvas) {
        return new Promise(function (resolve, reject) {
            canvas.toBlob(function (blob) {
                if (!blob || blob.type !== "image/webp") {
                    reject(new Error("Este navegador nao conseguiu converter a imagem para WebP."));
                    return;
                }
                resolve(blob);
            }, "image/webp", AVATAR_QUALITY);
        });
    }

    function validateAvatarFile(file) {
        if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
            return "Use uma imagem JPG, PNG ou WebP.";
        }
        if (file.size > MAX_ORIGINAL_AVATAR_SIZE) {
            return "A imagem deve ter no máximo 5 MB.";
        }
        return null;
    }

    async function optimizeAvatar(file) {
        const image = await loadImage(file);
        const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
        const sourceX = (image.naturalWidth - sourceSize) / 2;
        const sourceY = (image.naturalHeight - sourceSize) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = AVATAR_DIMENSION;
        canvas.height = AVATAR_DIMENSION;
        const context = canvas.getContext("2d");

        if (!context) throw new Error("Nao foi possivel processar a imagem neste navegador.");
        context.drawImage(
            image,
            sourceX, sourceY, sourceSize, sourceSize,
            0, 0, AVATAR_DIMENSION, AVATAR_DIMENSION
        );

        const blob = await canvasToWebpBlob(canvas);
        return new File([blob], "avatar.webp", {
            type: "image/webp",
            lastModified: Date.now()
        });
    }

    function initializeTheme() {
        const themeKey = window.UniCheckConfig?.STORAGE_KEYS?.THEME || "theme";
        const savedTheme = localStorage.getItem(themeKey) ||
            (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

        document.documentElement.setAttribute("data-theme", savedTheme);
        document.body.setAttribute("data-theme", savedTheme);

        const toggle = document.getElementById("theme-toggle-switch");
        if (toggle) toggle.checked = savedTheme === "dark";
    }

    function handleThemeToggle(event) {
        const theme = event.target.checked ? "dark" : "light";
        const themeKey = window.UniCheckConfig?.STORAGE_KEYS?.THEME || "theme";

        document.documentElement.setAttribute("data-theme", theme);
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem(themeKey, theme);
        showNotification("Tema " + (theme === "dark" ? "escuro" : "claro") + " ativado.", "success");
    }

    function updateAvatarDisplay() {
        const avatar = document.getElementById("profile-avatar");
        if (!avatar) return;

        const imageUrl = state.profile.avatarImage || state.profile.foto_url;
        if (imageUrl) {
            avatar.style.backgroundImage = "url('" + String(imageUrl).replaceAll("'", "%27") + "')";
            avatar.textContent = "";
            avatar.setAttribute("aria-label", "Foto de perfil de " + (state.profile.nome || "usuario"));
            return;
        }

        avatar.style.backgroundImage = "none";
        avatar.textContent = state.profile.avatarText || getInitials(state.profile.nome, state.profile.email);
        avatar.setAttribute("aria-label", "Iniciais de " + (state.profile.nome || "usuario"));
    }

    function updateProfileView() {
        const nomeField = document.getElementById("nome");
        const emailField = document.getElementById("email");
        const raField = document.getElementById("ra");
        const nameDisplay = document.getElementById("profile-name-display");
        const emailDisplay = document.getElementById("profile-email-display");

        if (nomeField) nomeField.value = state.profile.nome || "";
        if (emailField) emailField.value = state.profile.email || "";
        if (raField) raField.value = state.profile.ra || "";
        if (nameDisplay) nameDisplay.textContent = state.profile.nome || "Usuario";
        if (emailDisplay) emailDisplay.textContent = state.profile.email || "E-mail indisponivel";

        state.profile.avatarText = getInitials(state.profile.nome, state.profile.email);
        updateAvatarDisplay();
    }

    function setBusy(isBusy) {
        state.busy = isBusy;
        document.querySelectorAll("button, input").forEach(function (element) {
            if (element.id === "theme-toggle-switch") return;
            element.disabled = isBusy;
        });
    }

    function validateProfile(profile) {
        if (!profile.nome || profile.nome.trim().length < 2) {
            showNotification("Informe um nome com pelo menos 2 caracteres.", "error");
            return false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(profile.email || "")) {
            showNotification("Informe um e-mail valido.", "error");
            return false;
        }

        return true;
    }

    async function loadProfileData() {
        setBusy(true);
        try {
            const profile = await window.UniCheckProfile.getMyProfile();
            state.profile = cloneProfile(profile);
            state.initialProfile = cloneProfile(profile);
            state.pendingPhotoFile = null;
            state.photoRemoved = false;
            revokePreviewUrl();
            updateProfileView();
        } catch (error) {
            console.error("[ProfileSettings] Falha ao carregar perfil", error);
            showNotification("Nao foi possivel carregar seu perfil.", "error");
            throw error;
        } finally {
            setBusy(false);
        }
    }

    async function uploadPendingAvatar() {
        if (!state.pendingPhotoFile) {
            return state.photoRemoved ? null : state.profile.foto_url;
        }

        const user = await getAuthenticatedUser();
        const objectPath = user.id + "/avatar.webp";
        const { error } = await getClient()
            .storage
            .from(AVATAR_BUCKET)
            .upload(objectPath, state.pendingPhotoFile, {
                upsert: true,
                contentType: state.pendingPhotoFile.type,
                cacheControl: "3600"
            });

        if (error) throw error;

        const { data } = getClient().storage.from(AVATAR_BUCKET).getPublicUrl(objectPath);
        if (!data?.publicUrl) {
            throw new Error("O Supabase nao retornou a URL publica do avatar.");
        }

        return data.publicUrl + "?v=" + Date.now();
    }

    async function removeStoredAvatar() {
        const user = await getAuthenticatedUser();
        const { error } = await getClient()
            .storage
            .from(AVATAR_BUCKET)
            .remove([user.id + "/avatar.webp"]);

        if (error) throw error;
    }

    async function saveProfileData() {
        const nextProfile = {
            nome: document.getElementById("nome")?.value.trim() || "",
            email: document.getElementById("email")?.value.trim() || "",
            ra: document.getElementById("ra")?.value.trim() || "",
            foto_url: state.profile.foto_url
        };

        if (!validateProfile(nextProfile) || state.busy) return false;

        setBusy(true);
        try {
            if (state.photoRemoved && !state.pendingPhotoFile && state.initialProfile?.foto_url) {
                await removeStoredAvatar();
            }

            nextProfile.foto_url = await uploadPendingAvatar();
            const savedProfile = await window.UniCheckProfile.updateMyProfile(nextProfile);

            const requestedEmail = nextProfile.email;
            state.profile = cloneProfile(savedProfile);
            state.initialProfile = cloneProfile(savedProfile);
            state.pendingPhotoFile = null;
            state.photoRemoved = false;
            revokePreviewUrl();
            updateProfileView();

            if (requestedEmail !== savedProfile.email) {
                showNotification("Perfil salvo. Confirme o novo e-mail antes que ele substitua o atual.", "info");
            } else {
                showNotification("Perfil atualizado com sucesso.", "success");
            }

            const user = await getAuthenticatedUser();
            void window.UniCheckActivity?.record?.(user.id, {
                type: "profile_updated",
                title: "Atualizou as configuracoes do perfil",
                context: "Dados pessoais"
            });

            return true;
        } catch (error) {
            console.error("[ProfileSettings] Falha ao salvar perfil", error);
            showNotification(
                window.UniCheckAuth?.normalizeErrorMessage?.(error) || "Nao foi possivel salvar o perfil.",
                "error"
            );
            return false;
        } finally {
            setBusy(false);
        }
    }

    async function handlePhotoSelection(file) {
        const validationError = validateAvatarFile(file);
        if (validationError) {
            showNotification(validationError, "error");
            return;
        }

        setBusy(true);
        showNotification("Otimizando foto...", "info");
        try {
            const optimizedFile = await optimizeAvatar(file);
            revokePreviewUrl();
            state.previewObjectUrl = URL.createObjectURL(optimizedFile);
            state.pendingPhotoFile = optimizedFile;
            state.photoRemoved = false;
            state.profile.avatarImage = state.previewObjectUrl;
            updateAvatarDisplay();
            showNotification("Foto otimizada. Salve para enviar ao seu perfil.", "info");
        } catch (error) {
            console.error("[ProfileSettings] Falha ao otimizar avatar", error);
            showNotification(error.message || "Nao foi possivel otimizar a foto.", "error");
        } finally {
            setBusy(false);
        }
    }

    function setupPhotoControls() {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/jpeg,image/png,image/webp";
        fileInput.hidden = true;
        fileInput.id = "avatar-file-input";
        document.body.appendChild(fileInput);

        function openPicker(event) {
            event.preventDefault();
            if (!state.busy) fileInput.click();
        }

        document.getElementById("change-photo-btn")?.addEventListener("click", openPicker);
        document.getElementById("avatar-upload-trigger")?.addEventListener("click", openPicker);

        fileInput.addEventListener("change", async function (event) {
            const file = event.target.files?.[0];
            if (file) await handlePhotoSelection(file);
            fileInput.value = "";
        });

        document.getElementById("remove-photo-btn")?.addEventListener("click", function () {
            revokePreviewUrl();
            state.pendingPhotoFile = null;
            state.photoRemoved = true;
            state.profile.avatarImage = null;
            state.profile.foto_url = null;
            updateAvatarDisplay();
            showNotification("Foto marcada para remocao. Salve para confirmar.", "info");
        });
    }

    function validatePassword(currentPassword, nextPassword, confirmation) {
        if (!currentPassword) {
            showNotification("Informe sua senha atual.", "error");
            return false;
        }

        if (nextPassword.length < 8) {
            showNotification("A nova senha deve ter pelo menos 8 caracteres.", "error");
            return false;
        }

        if (nextPassword !== confirmation) {
            showNotification("As novas senhas nao coincidem.", "error");
            return false;
        }

        if (currentPassword === nextPassword) {
            showNotification("A nova senha deve ser diferente da atual.", "error");
            return false;
        }

        return true;
    }

    async function updatePassword() {
        const currentField = document.getElementById("senha-atual");
        const nextField = document.getElementById("nova-senha");
        const confirmationField = document.getElementById("confirmar-senha");
        const currentPassword = currentField?.value || "";
        const nextPassword = nextField?.value || "";
        const confirmation = confirmationField?.value || "";

        if (!validatePassword(currentPassword, nextPassword, confirmation) || state.busy) return false;

        setBusy(true);
        try {
            const user = await getAuthenticatedUser();
            if (!user.email) throw new Error("A conta autenticada nao possui e-mail.");

            const { error: signInError } = await getClient().auth.signInWithPassword({
                email: user.email,
                password: currentPassword
            });
            if (signInError) throw new Error("A senha atual esta incorreta.");

            const { error: updateError } = await getClient().auth.updateUser({ password: nextPassword });
            if (updateError) throw updateError;

            document.getElementById("passwordForm")?.reset();
            showNotification("Senha atualizada com sucesso.", "success");
            return true;
        } catch (error) {
            console.error("[ProfileSettings] Falha ao atualizar senha", error);
            showNotification(
                window.UniCheckAuth?.normalizeErrorMessage?.(error) || error.message || "Nao foi possivel atualizar a senha.",
                "error"
            );
            return false;
        } finally {
            setBusy(false);
        }
    }

    function syncActionArea() {
        const actions = document.getElementById("actions-section");
        const saveLabel = document.getElementById("save-action-label");
        const cancelLabel = document.querySelector("#cancelProfileChanges span");

        if (!actions) return;

        if (state.activeSection === "preferencias") {
            actions.classList.add("is-hidden");
            return;
        }

        actions.classList.remove("is-hidden");
        if (state.activeSection === "seguranca") {
            if (saveLabel) saveLabel.textContent = "Atualizar senha";
            if (cancelLabel) cancelLabel.textContent = "Limpar campos";
        } else {
            if (saveLabel) saveLabel.textContent = "Salvar alterações";
            if (cancelLabel) cancelLabel.textContent = "Cancelar";
        }
    }

    function activateSection(targetId) {
        const target = document.getElementById(targetId);
        if (!target) return;

        state.activeSection = targetId;

        document.querySelectorAll(".profile-info-section").forEach(function (section) {
            section.classList.toggle("is-hidden", section.id !== targetId);
        });

        document.querySelectorAll(".profile-menu-link").forEach(function (link) {
            const active = link.getAttribute("href") === "#" + targetId;
            link.classList.toggle("active", active);
            if (active) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        syncActionArea();
        history.replaceState(null, "", "#" + targetId);

        if (typeof lucide !== "undefined") lucide.createIcons();
    }

    function setupNavigation() {
        document.querySelectorAll(".profile-menu-link").forEach(function (link) {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                activateSection(link.getAttribute("href").slice(1));
            });
        });

        const requestedSection = window.location.hash.slice(1);
        if (requestedSection && document.getElementById(requestedSection)) {
            activateSection(requestedSection);
        } else {
            syncActionArea();
        }
    }

    function cancelCurrentChanges() {
        if (state.activeSection === "seguranca") {
            document.getElementById("passwordForm")?.reset();
            showNotification("Campos de senha limpos.", "info");
            return;
        }

        if (state.initialProfile) {
            revokePreviewUrl();
            state.profile = cloneProfile(state.initialProfile);
            state.pendingPhotoFile = null;
            state.photoRemoved = false;
            updateProfileView();
            showNotification("Alteracoes descartadas.", "info");
        }
    }

    function setupActions() {
        document.getElementById("saveProfileChanges")?.addEventListener("click", async function () {
            if (state.activeSection === "seguranca") {
                await updatePassword();
            } else {
                await saveProfileData();
            }
        });

        document.getElementById("cancelProfileChanges")?.addEventListener("click", cancelCurrentChanges);

        document.getElementById("profileForm")?.addEventListener("submit", async function (event) {
            event.preventDefault();
            await saveProfileData();
        });

        document.getElementById("passwordForm")?.addEventListener("submit", async function (event) {
            event.preventDefault();
            await updatePassword();
        });
    }

    function showNotification(message, type) {
        document.querySelector(".profile-notification")?.remove();

        const notification = document.createElement("div");
        notification.className = "profile-notification notification-" + (type || "info");
        notification.setAttribute("role", type === "error" ? "alert" : "status");

        const content = document.createElement("div");
        content.className = "notification-content";

        const icon = document.createElement("i");
        const iconNames = {
            success: "check-circle",
            error: "alert-circle",
            warning: "alert-triangle",
            info: "info"
        };
        icon.setAttribute("data-lucide", iconNames[type] || "info");

        const text = document.createElement("span");
        text.textContent = String(message || "");

        content.append(icon, text);
        notification.appendChild(content);
        document.body.appendChild(notification);

        const liveRegion = document.getElementById("profile-status");
        if (liveRegion) liveRegion.textContent = String(message || "");
        if (typeof lucide !== "undefined") lucide.createIcons();

        requestAnimationFrame(function () {
            notification.classList.add("show");
        });

        window.setTimeout(function () {
            notification.classList.remove("show");
            window.setTimeout(function () {
                notification.remove();
            }, 200);
        }, 3600);
    }

    async function initializeConfigPage() {
        try {
            if (typeof lucide !== "undefined") lucide.createIcons();

            initializeTheme();
            setupNavigation();
            setupPhotoControls();
            setupActions();
            document.getElementById("theme-toggle-switch")?.addEventListener("change", handleThemeToggle);

            const session = await window.UniCheckAuth.requireAuth();
            if (!session) return;

            await loadProfileData();
        } catch (error) {
            console.error("[ProfileSettings] Falha ao inicializar pagina", error);
        }
    }

    window.addEventListener("beforeunload", revokePreviewUrl);

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeConfigPage, { once: true });
    } else {
        initializeConfigPage();
    }
})();
