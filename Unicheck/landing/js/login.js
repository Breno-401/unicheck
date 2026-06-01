document.addEventListener("DOMContentLoaded", () => {
    const auth = window.UniCheckAuth;
    const toast = document.getElementById("toast");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const tabButtons = document.querySelectorAll("[data-tab-target]");
    const formPanels = document.querySelectorAll(".form-panel");
    const senhaCadastroInput = document.getElementById("senhaCadastro");
    const strengthBar = document.getElementById("strength");
    const strengthText = document.getElementById("strengthText");
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");
    const togglePasswordButtons = document.querySelectorAll("[data-toggle-password]");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const raRegex = /^[A-Za-z0-9._-]{4,20}$/;

    let toastTimeout = null;

    if (!auth) {
        console.error("UniCheckAuth nao encontrado. Verifique a inclusao de js/config.js e js/auth.js.");
    }

    function showToast(message, type) {
        if (!toast) return;
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.remove("show"), 2800);
    }

    function setActiveTab(targetId) {
        tabButtons.forEach(button => {
            const isActive = button.getAttribute("data-tab-target") === targetId;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-selected", String(isActive));
        });

        formPanels.forEach(panel => {
            const isActive = panel.id === targetId;
            panel.classList.toggle("is-active", isActive);
            panel.hidden = !isActive;
        });
    }

    function getErrorElement(inputId) {
        return document.getElementById(`${inputId}Error`);
    }

    function setFieldError(input, message) {
        if (!(input instanceof HTMLInputElement)) return false;
        const errorEl = getErrorElement(input.id);
        input.classList.add("error");
        input.setAttribute("aria-invalid", "true");
        if (errorEl) errorEl.textContent = message;
        return false;
    }

    function clearFieldError(input) {
        if (!(input instanceof HTMLInputElement)) return;
        const errorEl = getErrorElement(input.id);
        input.classList.remove("error");
        input.removeAttribute("aria-invalid");
        if (errorEl) errorEl.textContent = "";
    }

    function validateLogin() {
        const emailInput = document.getElementById("loginEmail");
        const raInput = document.getElementById("matriculasenha");
        const passwordInput = document.getElementById("loginSenha");

        if (!(emailInput instanceof HTMLInputElement)) return false;
        if (!(raInput instanceof HTMLInputElement)) return false;
        if (!(passwordInput instanceof HTMLInputElement)) return false;

        let valid = true;
        clearFieldError(emailInput);
        clearFieldError(raInput);
        clearFieldError(passwordInput);

        if (!emailInput.value.trim()) valid = setFieldError(emailInput, "Informe seu e-mail.");
        else if (!emailRegex.test(emailInput.value.trim())) valid = setFieldError(emailInput, "Informe um e-mail valido.");

        if (!raInput.value.trim()) valid = setFieldError(raInput, "Informe seu registro academico.");
        else if (!raRegex.test(raInput.value.trim())) valid = setFieldError(raInput, "RA invalido. Use 4 a 20 caracteres.");

        if (!passwordInput.value) valid = setFieldError(passwordInput, "Informe sua senha.");
        else if (!passwordRegex.test(passwordInput.value)) valid = setFieldError(passwordInput, "Senha deve ter 8+ caracteres, letra maiuscula e numero.");

        return valid;
    }

    function validateRegister() {
        const nomeInput = document.getElementById("nomeCadastro");
        const emailInput = document.getElementById("emailCadastro");
        const nascimentoInput = document.getElementById("nascimentoCadastro");
        const raInput = document.getElementById("matriculaCadastro");
        const senhaInput = document.getElementById("senhaCadastro");

        if (!(nomeInput instanceof HTMLInputElement)) return false;
        if (!(emailInput instanceof HTMLInputElement)) return false;
        if (!(nascimentoInput instanceof HTMLInputElement)) return false;
        if (!(raInput instanceof HTMLInputElement)) return false;
        if (!(senhaInput instanceof HTMLInputElement)) return false;

        let valid = true;
        [nomeInput, emailInput, nascimentoInput, raInput, senhaInput].forEach(clearFieldError);

        if (nomeInput.value.trim().length < 3) valid = setFieldError(nomeInput, "Informe seu nome completo.");
        if (!emailRegex.test(emailInput.value.trim())) valid = setFieldError(emailInput, "Informe um e-mail valido.");
        if (!nascimentoInput.value) valid = setFieldError(nascimentoInput, "Informe sua data de nascimento.");
        if (!raRegex.test(raInput.value.trim())) valid = setFieldError(raInput, "RA invalido. Use 4 a 20 caracteres.");
        if (!passwordRegex.test(senhaInput.value)) valid = setFieldError(senhaInput, "Senha fraca. Use 8+ caracteres, maiuscula e numero.");

        return valid;
    }

    function evaluatePasswordStrength(password) {
        let value = 0;
        if (/[a-z]/.test(password)) value += 1;
        if (/[A-Z]/.test(password)) value += 1;
        if (/\d/.test(password)) value += 1;
        if (/[$@#&!%^*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) value += 1;
        if (password.length >= 12) value += 1;
        return value;
    }

    function updateStrengthUI(password) {
        if (!strengthBar || !strengthText) return;
        const score = evaluatePasswordStrength(password);
        const labels = ["Muito fraca", "Fraca", "Media", "Boa", "Forte"];
        const colors = ["#ff6b6b", "#ff9a5a", "#ffc85f", "#7fd17f", "#18c58f"];

        strengthBar.style.width = `${score * 20}%`;
        strengthBar.style.background = colors[score - 1] || "transparent";
        strengthText.textContent = `Forca da senha: ${labels[score - 1] || "fraca"}`;
    }

    function setSubmitLoading(button, isLoading) {
        if (!(button instanceof HTMLButtonElement)) return;
        button.disabled = isLoading;
        button.textContent = isLoading ? "Processando..." : button.dataset.defaultLabel || button.textContent;
    }

    function handleTogglePassword(button) {
        const inputId = button.dataset.togglePassword;
        if (!inputId) return;

        const input = document.getElementById(inputId);
        if (!(input instanceof HTMLInputElement)) return;

        const isHidden = input.type === "password";
        input.type = isHidden ? "text" : "password";
        button.textContent = isHidden ? "Ocultar" : "Mostrar";
        button.setAttribute("aria-pressed", String(isHidden));
        button.setAttribute("aria-label", isHidden ? "Ocultar senha" : "Mostrar senha");
    }

    tabButtons.forEach(button => {
        if (!(button instanceof HTMLButtonElement)) return;
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-tab-target");
            if (!targetId) return;
            setActiveTab(targetId);
        });
    });

    togglePasswordButtons.forEach(button => {
        if (!(button instanceof HTMLButtonElement)) return;
        button.addEventListener("click", () => handleTogglePassword(button));
    });

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", event => {
            event.preventDefault();
            showToast("Recuperacao de senha pode ser adicionada depois via Supabase Auth.", "error");
        });
    }

    if (senhaCadastroInput instanceof HTMLInputElement) {
        senhaCadastroInput.addEventListener("input", () => updateStrengthUI(senhaCadastroInput.value));
    }

    document.addEventListener("input", event => {
        const target = event.target;
        if (target instanceof HTMLInputElement) clearFieldError(target);
    });

    if (loginForm) {
        loginForm.addEventListener("submit", async event => {
            event.preventDefault();
            const submitButton = document.getElementById("loginSubmit");
            if (!validateLogin()) {
                showToast("Corrija os erros para entrar.", "error");
                return;
            }

            setSubmitLoading(submitButton, true);
            try {
                const emailInput = document.getElementById("loginEmail");
                const raInput = document.getElementById("matriculasenha");
                const passwordInput = document.getElementById("loginSenha");

                await auth.login({
                    email: emailInput.value.trim(),
                    ra: raInput.value.trim(),
                    password: passwordInput.value
                });

                showToast("Login realizado com sucesso!", "success");
                setTimeout(() => {
                    window.location.href = "../platform/index-interno.html";
                }, 700);
            } catch (error) {
                showToast(auth?.normalizeErrorMessage(error) || "Nao foi possivel entrar.", "error");
            } finally {
                setSubmitLoading(submitButton, false);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async event => {
            event.preventDefault();
            const submitButton = document.getElementById("registerSubmit");
            if (!validateRegister()) {
                showToast("Corrija os erros para concluir o cadastro.", "error");
                return;
            }

            setSubmitLoading(submitButton, true);
            try {
                const nomeInput = document.getElementById("nomeCadastro");
                const emailInput = document.getElementById("emailCadastro");
                const nascimentoInput = document.getElementById("nascimentoCadastro");
                const raInput = document.getElementById("matriculaCadastro");
                const senhaInput = document.getElementById("senhaCadastro");

                const result = await auth.register({
                    fullName: nomeInput.value.trim(),
                    email: emailInput.value.trim(),
                    birthDate: nascimentoInput.value,
                    ra: raInput.value.trim(),
                    password: senhaInput.value
                });

                if (result.session) {
                    showToast("Cadastro realizado com sucesso!", "success");
                } else {
                    showToast("Cadastro realizado. Verifique seu e-mail para confirmar a conta.", "success");
                }

                setSubmitLoading(submitButton, false);
                registerForm.reset();
                updateStrengthUI("");
                setActiveTab("loginPanel");
            } catch (error) {
                setSubmitLoading(submitButton, false);
                showToast(auth?.normalizeErrorMessage(error) || "Nao foi possivel concluir o cadastro.", "error");
            }
        });
    }

    document.querySelectorAll("button[type='submit']").forEach(button => {
        if (!(button instanceof HTMLButtonElement)) return;
        button.dataset.defaultLabel = button.textContent;
    });

    auth?.restoreSession()
        .then(session => {
            if (session?.user) {
                window.location.href = "../platform/index-interno.html";
            }
        })
        .catch(error => {
            console.warn("Nao foi possivel restaurar a sessao:", error);
        });
});
