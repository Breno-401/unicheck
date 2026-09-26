const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const themeKey = 'unicheck.landing.theme';

function createHarness({ savedTheme = null, systemTheme = 'light', storageBlocked = false } = {}) {
    const storage = new Map(savedTheme ? [[themeKey, savedTheme]] : []);
    const listeners = {};
    const attributes = {};
    const buttonAttributes = {};
    const buttonListeners = {};
    const html = {
        dataset: {},
        setAttribute(name, value) {
            attributes[name] = String(value);
            if (name === 'data-theme') this.dataset.theme = String(value);
        }
    };
    const button = {
        setAttribute(name, value) { buttonAttributes[name] = String(value); },
        addEventListener(name, listener) { (buttonListeners[name] ||= []).push(listener); }
    };
    const meta = { content: '' };
    const media = {
        matches: systemTheme === 'dark',
        addEventListener(name, listener) { (listeners[name] ||= []).push(listener); }
    };
    const documentListeners = {};
    const document = {
        documentElement: html,
        querySelector(selector) {
            if (selector === '[data-theme-toggle]') return button;
            if (selector === 'meta[name="theme-color"]') return meta;
            return null;
        },
        addEventListener(name, listener) { (documentListeners[name] ||= []).push(listener); }
    };
    const localStorage = {
        getItem(key) {
            if (storageBlocked) throw new Error('storage unavailable');
            return storage.get(key) ?? null;
        },
        setItem(key, value) {
            if (storageBlocked) throw new Error('storage unavailable');
            storage.set(key, String(value));
        }
    };
    const window = { localStorage, matchMedia: () => media };
    const context = vm.createContext({ window, document, localStorage });
    vm.runInContext(read('Unicheck/landing/js/landing-theme.js'), context);
    return {
        html, attributes, button, buttonAttributes, buttonListeners, documentListeners,
        meta, media, listeners, storage,
        ready() { (documentListeners.DOMContentLoaded || []).forEach(listener => listener()); },
        click() { (buttonListeners.click || []).forEach(listener => listener()); }
    };
}

test('tema salvo prevalece sobre o sistema e é aplicado antes da folha de estilos', () => {
    const harness = createHarness({ savedTheme: 'light', systemTheme: 'dark' });
    assert.equal(harness.html.dataset.theme, 'light');
    assert.ok(harness.html.dataset.theme, 'o tema deve ser definido imediatamente ao carregar o script');

    const html = read('Unicheck/landing/index.html');
    assert.ok(html.indexOf('js/landing-theme.js') < html.indexOf('css/main.css'));
});

test('sem preferência salva usa o tema do sistema', () => {
    assert.equal(createHarness({ systemTheme: 'dark' }).html.dataset.theme, 'dark');
    assert.equal(createHarness({ systemTheme: 'light' }).html.dataset.theme, 'light');
});

test('toggle sincroniza tema, persistência e estado acessível', () => {
    const harness = createHarness();
    harness.ready();
    assert.equal(harness.buttonAttributes['aria-pressed'], 'false');
    harness.click();
    assert.equal(harness.html.dataset.theme, 'dark');
    assert.equal(harness.storage.get(themeKey), 'dark');
    assert.equal(harness.buttonAttributes['aria-pressed'], 'true');
    assert.equal(harness.buttonAttributes['aria-label'], 'Ativar tema claro');
    assert.equal(harness.meta.content, '#0b1f22');
});

test('preferência do sistema atualiza o tema enquanto o visitante não escolhe um', () => {
    const harness = createHarness({ systemTheme: 'light' });
    harness.ready();
    harness.media.matches = true;
    harness.listeners.change.forEach(listener => listener({ matches: true }));
    assert.equal(harness.html.dataset.theme, 'dark');
    assert.equal(harness.buttonAttributes['aria-pressed'], 'true');
});

test('falha de localStorage não impede aplicação do tema nem o toggle', () => {
    const harness = createHarness({ systemTheme: 'dark', storageBlocked: true });
    harness.ready();
    assert.equal(harness.html.dataset.theme, 'dark');
    assert.doesNotThrow(() => harness.click());
    assert.equal(harness.html.dataset.theme, 'light');
});

test('a seção de checklist é substituída por fluxo desktop e timeline mobile', () => {
    const html = read('Unicheck/landing/index.html');
    const css = read('Unicheck/landing/css/landing-flow.css');
    assert.match(html, /id="sobre"[^>]*data-journey-flow/);
    assert.match(html, /journey-flow__desktop/);
    assert.match(html, /journey-flow__mobile/);
    assert.match(html, /universidade[\s\S]*unicheck[\s\S]*aluno/i);
    assert.equal([...html.matchAll(/class="journey-flow__outcome"/g)].length, 3);
    assert.match(html, /Jornada organizada/);
    assert.doesNotMatch(html, /Checklist_portada\.jpg|Comece sem se perder\./);
    assert.match(css, /prefers-reduced-motion:\s*reduce/);
    assert.match(css, /journey-flow__desktop[\s\S]*max-width:\s*7\d\dpx/);
    assert.match(css, /journey-flow__mobile[\s\S]*max-width:\s*7\d\dpx/);
});
