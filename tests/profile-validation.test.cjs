const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(
    require.resolve("../Unicheck/js/core/validation.js"),
    "utf8"
);

function loadValidation() {
    const window = {};
    vm.runInNewContext(source, { window });
    return window.UniCheckValidation;
}

const validation = loadValidation();

for (const name of [
    "Breno Clemente",
    "Breno Clemente Pereira",
    "João da Silva",
    "Maria de Souza",
    "Ana Li",
    "João D'Ávila",
    "Maria Clara Costa-Silva",
    "Érica Álvares"
]) {
    test(`nome completo válido: ${name}`, () => {
        const result = validation.validateFullName(name);
        assert.equal(result.valid, true);
        assert.equal(result.value, name);
    });
}

for (const [name, code] of [
    ["Breno", "incomplete"],
    ["João", "incomplete"],
    ["", "required"],
    ["     ", "required"],
    ["   Breno   ", "incomplete"],
    ["João de", "incomplete"],
    ["123 Silva", "contains_number"],
    ["Breno123 Pereira", "contains_number"],
    ["@Breno Pereira", "invalid_character"],
    ["Breno 😀 Pereira", "invalid_character"],
    [`Ana ${"M".repeat(101)}`, "too_long"]
]) {
    test(`nome completo inválido: ${JSON.stringify(name)}`, () => {
        const result = validation.validateFullName(name);
        assert.equal(result.valid, false);
        assert.equal(result.code, code);
        assert.ok(result.error);
    });
}

test("nome completo remove bordas e reduz espaços internos", () => {
    const result = validation.validateFullName("   Breno     Clemente   ");
    assert.equal(result.valid, true);
    assert.equal(result.value, "Breno Clemente");
});

test("nome completo normaliza Unicode sem capitalização agressiva", () => {
    assert.equal(validation.normalizeFullName("  maria  d\u0065\u0301 souza  "), "maria dé souza");
});

test("e-mail remove espaços das bordas e normaliza caixa", () => {
    const result = validation.validateEmail("  Pessoa@Exemplo.COM  ");
    assert.equal(result.valid, true);
    assert.equal(result.value, "pessoa@exemplo.com");
});

test("e-mail vazio, malformado e longo são rejeitados", () => {
    assert.equal(validation.validateEmail("   ").code, "required");
    assert.equal(validation.validateEmail("pessoa@localhost").code, "invalid_format");
    assert.equal(validation.validateEmail(`${"a".repeat(310)}@exemplo.com`).code, "too_long");
});

test("RA opcional vira null, preserva conteúdo e respeita o limite existente", () => {
    assert.equal(validation.validateRa("   ").value, null);
    assert.equal(validation.validateRa("  2026-ABC  ").value, "2026-ABC");
    assert.equal(validation.validateRa("x".repeat(41)).code, "too_long");
});

test("data de nascimento deve existir, ser real e não estar no futuro", () => {
    const today = new Date(2026, 8, 9);
    assert.equal(validation.validateBirthDate("", today).code, "required");
    assert.equal(validation.validateBirthDate("2026-02-30", today).code, "invalid_date");
    assert.equal(validation.validateBirthDate("2026-09-10", today).code, "future_date");
    assert.equal(validation.validateBirthDate("2000-02-29", today).valid, true);
});

test("regra de senha de cadastro existente permanece centralizada", () => {
    assert.equal(validation.validateRegistrationPassword("").code, "required");
    assert.equal(validation.validateRegistrationPassword("Abc123").code, "too_short");
    assert.equal(validation.validateRegistrationPassword("abcdefgh").code, "weak");
    assert.equal(validation.validateRegistrationPassword("Senha123").valid, true);
});
