(function (global) {
    const FULL_NAME_MAX_LENGTH = 100;
    const EMAIL_MAX_LENGTH = 320;
    const RA_MAX_LENGTH = 40;
    const NAME_PARTICLES = new Set(["de", "da", "do", "das", "dos", "e"]);
    const NAME_COMPONENT_PATTERN = /^\p{L}+(?:['\u2019-]\p{L}+)*$/u;
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function normalizeWhitespace(value) {
        return String(value ?? "").normalize("NFC").trim().replace(/\s+/gu, " ");
    }

    function valid(value, extra = {}) {
        return { valid: true, value, error: null, code: null, ...extra };
    }

    function invalid(value, code, error) {
        return { valid: false, value, error, code };
    }

    function normalizeFullName(value) {
        return normalizeWhitespace(value);
    }

    function validateFullName(value) {
        const normalized = normalizeFullName(value);

        if (!normalized) {
            return invalid(normalized, "required", "Informe seu nome e sobrenome.");
        }

        if (Array.from(normalized).length > FULL_NAME_MAX_LENGTH) {
            return invalid(normalized, "too_long", `O nome deve possuir no máximo ${FULL_NAME_MAX_LENGTH} caracteres.`);
        }

        if (/\p{N}/u.test(normalized)) {
            return invalid(normalized, "contains_number", "O nome não pode conter números.");
        }

        const components = normalized.split(" ");
        if (components.some(component => !NAME_COMPONENT_PATTERN.test(component))) {
            return invalid(
                normalized,
                "invalid_character",
                "Use apenas letras, hífen ou apóstrofo no nome."
            );
        }

        const significantComponents = components.filter(component => !NAME_PARTICLES.has(component.toLocaleLowerCase("pt-BR")));
        if (significantComponents.length < 2) {
            return invalid(normalized, "incomplete", "Informe seu nome e sobrenome.");
        }

        return valid(normalized, { significantComponents: significantComponents.length });
    }

    function normalizeEmail(value) {
        return String(value ?? "").trim().toLocaleLowerCase("en-US");
    }

    function validateEmail(value) {
        const normalized = normalizeEmail(value);

        if (!normalized) {
            return invalid(normalized, "required", "Informe seu endereço de e-mail.");
        }

        if (normalized.length > EMAIL_MAX_LENGTH) {
            return invalid(normalized, "too_long", `O e-mail deve possuir no máximo ${EMAIL_MAX_LENGTH} caracteres.`);
        }

        if (!EMAIL_PATTERN.test(normalized)) {
            return invalid(normalized, "invalid_format", "Informe um endereço de e-mail válido.");
        }

        return valid(normalized);
    }

    function normalizeRa(value) {
        return String(value ?? "").trim();
    }

    function validateRa(value) {
        const normalized = normalizeRa(value);
        if (normalized.length > RA_MAX_LENGTH) {
            return invalid(normalized, "too_long", `O RA deve possuir no máximo ${RA_MAX_LENGTH} caracteres.`);
        }
        return valid(normalized || null);
    }

    function validateBirthDate(value, today = new Date()) {
        const normalized = String(value ?? "").trim();
        if (!normalized) {
            return invalid(normalized, "required", "Informe sua data de nascimento.");
        }

        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
        if (!match) {
            return invalid(normalized, "invalid_format", "Informe uma data de nascimento válida.");
        }

        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        const parsed = new Date(Date.UTC(year, month - 1, day));
        const isRealDate = parsed.getUTCFullYear() === year &&
            parsed.getUTCMonth() === month - 1 &&
            parsed.getUTCDate() === day;

        if (!isRealDate) {
            return invalid(normalized, "invalid_date", "Informe uma data de nascimento válida.");
        }

        const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        if (parsed.getTime() > todayUtc) {
            return invalid(normalized, "future_date", "A data de nascimento não pode estar no futuro.");
        }

        return valid(normalized);
    }

    function validateRegistrationPassword(value) {
        const password = String(value ?? "");
        if (!password) return invalid(password, "required", "Crie uma senha.");
        if (password.length < 8) {
            return invalid(password, "too_short", "A senha deve ter pelo menos 8 caracteres.");
        }
        if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
            return invalid(password, "weak", "Use pelo menos uma letra maiúscula, uma minúscula e um número.");
        }
        return valid(password);
    }

    global.UniCheckValidation = Object.freeze({
        FULL_NAME_MAX_LENGTH,
        EMAIL_MAX_LENGTH,
        RA_MAX_LENGTH,
        normalizeFullName,
        validateFullName,
        normalizeEmail,
        validateEmail,
        normalizeRa,
        validateRa,
        validateBirthDate,
        validateRegistrationPassword
    });
})(typeof window !== "undefined" ? window : globalThis);
