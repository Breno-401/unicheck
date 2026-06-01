let userProfile = {
    nome: "",
    email: "",
    foto_url: null,
    avatarImage: null,
    avatarText: "US"
};

function initializeTheme() {
    try {
        const themeKey = window.UniCheckConfig?.STORAGE_KEYS?.THEME || "theme";
        const savedTheme = localStorage.getItem(themeKey) ||
            (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

        document.body.setAttribute("data-theme", savedTheme);
        updateThemeToggleState(savedTheme);
    } catch (error) {
        console.warn("Erro ao inicializar tema:", error);
        document.body.setAttribute("data-theme", "light");
    }
}

function updateThemeToggleState(theme) {
    const darkModeToggle = document.querySelector("#preferencias .switch input[type='checkbox']");
    if (!darkModeToggle) return;

    const newToggle = darkModeToggle.cloneNode(true);
    darkModeToggle.parentNode.replaceChild(newToggle, darkModeToggle);
    newToggle.checked = theme === "dark";
    newToggle.addEventListener("change", handleThemeToggle);
}

function handleThemeToggle(event) {
    try {
        const newTheme = event.target.checked ? "dark" : "light";
        const themeKey = window.UniCheckConfig?.STORAGE_KEYS?.THEME || "theme";
        document.body.setAttribute("data-theme", newTheme);
        localStorage.setItem(themeKey, newTheme);
        showNotification(`Modo ${newTheme === "dark" ? "escuro" : "claro"} ativado`, "success");
    } catch (error) {
        console.error("Erro ao alternar tema:", error);
    }
}

function setupThemeToggle() {
    const themeToggle = document.querySelector("#preferencias .switch input[type='checkbox']");
    if (!themeToggle) return;
    themeToggle.removeEventListener("change", handleThemeToggle);
    themeToggle.addEventListener("change", handleThemeToggle);
}

function getInitials(name, email) {
    const source = (name || email || "Usuario").trim();
    const parts = source.split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(part => part[0]?.toUpperCase() || "").join("") || "US";
}

function updateAvatarDisplay() {
    const avatar = document.getElementById("profile-avatar");
    if (!avatar) return;

    if (userProfile.avatarImage) {
        avatar.style.backgroundImage = `url(${userProfile.avatarImage})`;
        avatar.style.backgroundSize = "cover";
        avatar.style.backgroundPosition = "center";
        avatar.textContent = "";
        return;
    }

    avatar.style.backgroundImage = "none";
    avatar.style.backgroundSize = "";
    avatar.style.backgroundPosition = "";
    avatar.textContent = userProfile.avatarText || "US";
}

function updateFormFields() {
    const nomeField = document.getElementById("nome");
    const emailField = document.getElementById("email");
    const profileNameDisplay = document.getElementById("profile-name-display");

    if (nomeField) nomeField.value = userProfile.nome || "";
    if (emailField) emailField.value = userProfile.email || "";
    if (profileNameDisplay) profileNameDisplay.textContent = userProfile.nome || "Usuario";

    updateAvatarDisplay();
}

function validateProfileData(profile) {
    if (!profile.nome || profile.nome.trim().length < 3) {
        showNotification("Nome deve ter pelo menos 3 caracteres.", "error");
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email || "")) {
        showNotification("Informe um e-mail valido.", "error");
        return false;
    }

    return true;
}

async function loadProfileData() {
    try {
        const profile = await window.UniCheckProfile.getMyProfile();
        userProfile = {
            ...userProfile,
            ...profile,
            avatarImage: profile.foto_url || profile.avatarImage || null,
            avatarText: profile.avatarText || getInitials(profile.nome, profile.email)
        };
        updateFormFields();
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        showNotification("Nao foi possivel carregar seu perfil.", "error");
    }
}

async function saveProfileData() {
    const nomeField = document.getElementById("nome");
    const emailField = document.getElementById("email");

    const nextProfile = {
        nome: nomeField ? nomeField.value.trim() : userProfile.nome,
        email: emailField ? emailField.value.trim() : userProfile.email,
        foto_url: userProfile.avatarImage || null
    };

    if (!validateProfileData(nextProfile)) {
        return false;
    }

    try {
        const savedProfile = await window.UniCheckProfile.updateMyProfile(nextProfile);
        userProfile = {
            ...userProfile,
            ...savedProfile,
            avatarImage: savedProfile.foto_url || null,
            avatarText: savedProfile.avatarText || getInitials(savedProfile.nome, savedProfile.email)
        };
        updateFormFields();

        if (nextProfile.email !== savedProfile.email) {
            showNotification("Perfil salvo. Confirme o novo e-mail no fluxo do Supabase, se solicitado.", "info");
        } else {
            showNotification("Perfil atualizado com sucesso!", "success");
        }

        return true;
    } catch (error) {
        console.error("Erro ao salvar perfil:", error);
        showNotification(
            window.UniCheckAuth?.normalizeErrorMessage?.(error) || "Nao foi possivel salvar seu perfil.",
            "error"
        );
        return false;
    }
}

function setupPhotoUpload() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    fileInput.id = "avatar-file-input";
    document.body.appendChild(fileInput);

    const openPicker = event => {
        event.preventDefault();
        fileInput.click();
    };

    const changePhotoBtn = document.getElementById("change-photo-btn");
    if (changePhotoBtn) {
        changePhotoBtn.addEventListener("click", openPicker);
    }

    const cameraIcon = document.getElementById("avatar-upload-trigger");
    if (cameraIcon) {
        cameraIcon.addEventListener("click", openPicker);
        cameraIcon.style.cursor = "pointer";
    }

    fileInput.addEventListener("change", event => {
        const file = event.target.files?.[0];
        if (!file) return;
        handlePhotoUpload(file);
        fileInput.value = "";
    });

    const removePhotoBtn = document.getElementById("remove-photo-btn");
    if (removePhotoBtn) {
        removePhotoBtn.addEventListener("click", event => {
            event.preventDefault();
            userProfile.avatarImage = null;
            userProfile.foto_url = null;
            updateAvatarDisplay();
            showNotification("Foto removida. Clique em salvar para confirmar.", "info");
        });
    }
}

function handlePhotoUpload(file) {
    if (!file.type.startsWith("image/")) {
        showNotification("Selecione uma imagem valida.", "error");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showNotification("A imagem deve ter no maximo 5MB.", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = event => {
        const imageUrl = event.target?.result;
        if (typeof imageUrl !== "string") {
            showNotification("Nao foi possivel processar a imagem.", "error");
            return;
        }

        userProfile.avatarImage = imageUrl;
        userProfile.foto_url = imageUrl;
        updateAvatarDisplay();
        showNotification("Foto pronta para salvar.", "success");
    };
    reader.onerror = () => {
        showNotification("Erro ao carregar a imagem.", "error");
    };
    reader.readAsDataURL(file);
}

async function updatePassword() {
    const senhaAtualField = document.getElementById("senha-atual");
    const novaSenhaField = document.getElementById("nova-senha");
    const confirmarSenhaField = document.getElementById("confirmar-senha");

    const novaSenha = novaSenhaField ? novaSenhaField.value : "";
    const confirmarSenha = confirmarSenhaField ? confirmarSenhaField.value : "";

    if (!novaSenha || !confirmarSenha) {
        showNotification("Preencha a nova senha e a confirmacao.", "error");
        return false;
    }

    if (novaSenha.length < 8) {
        showNotification("A nova senha deve ter pelo menos 8 caracteres.", "error");
        return false;
    }

    if (novaSenha !== confirmarSenha) {
        showNotification("As senhas nao coincidem.", "error");
        return false;
    }

    try {
        const client = window.UniCheckSupabase?.client;
        const { error } = await client.auth.updateUser({ password: novaSenha });
        if (error) throw error;

        if (senhaAtualField) senhaAtualField.value = "";
        if (novaSenhaField) novaSenhaField.value = "";
        if (confirmarSenhaField) confirmarSenhaField.value = "";

        showNotification("Senha atualizada com sucesso!", "success");
        return true;
    } catch (error) {
        console.error("Erro ao atualizar senha:", error);
        showNotification("Nao foi possivel atualizar a senha.", "error");
        return false;
    }
}

function setupNavigation() {
    document.querySelectorAll(".profile-menu-link").forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();

            document.querySelectorAll(".profile-menu-link").forEach(item => {
                item.classList.remove("active");
            });
            this.classList.add("active");

            document.querySelectorAll(".profile-info-section").forEach(section => {
                section.classList.add("is-hidden");
            });

            const targetId = this.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove("is-hidden");
            }

            setTimeout(() => {
                if (typeof lucide !== "undefined") {
                    lucide.createIcons();
                }
            }, 100);
        });
    });
}

function setupActionButtons() {
    const saveButton = document.getElementById("saveProfileChanges");
    if (saveButton) {
        saveButton.addEventListener("click", async event => {
            event.preventDefault();
            const activeSection = document.querySelector(".profile-info-section:not(.is-hidden)");

            if (activeSection?.id === "seguranca") {
                await updatePassword();
                return;
            }

            await saveProfileData();
        });
    }

    const cancelButton = document.getElementById("cancelProfileChanges");
    if (cancelButton) {
        cancelButton.addEventListener("click", async event => {
            event.preventDefault();
            await loadProfileData();
            showNotification("Alteracoes descartadas.", "info");
        });
    }
}

function showNotification(message, type = "info") {
    const existingNotification = document.querySelector(".profile-notification");
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement("div");
    notification.className = `profile-notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i data-lucide="${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    setTimeout(() => {
        notification.classList.add("show");
    }, 10);

    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: "check-circle",
        error: "alert-circle",
        info: "info",
        warning: "alert-triangle"
    };
    return icons[type] || "info";
}

async function initializeConfigPage() {
    try {
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

        initializeTheme();
        setupNavigation();
        setupThemeToggle();
        setupPhotoUpload();
        setupActionButtons();
        await loadProfileData();
    } catch (error) {
        console.error("Erro ao inicializar pagina de configuracoes:", error);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeConfigPage);
} else {
    initializeConfigPage();
}

window.addEventListener("load", function () {
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
});
