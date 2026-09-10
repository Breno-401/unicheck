const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const benefitsDir = 'Unicheck/platform/pages/beneficios-estudantis/';
const manualDir = 'Unicheck/platform/pages/manual-aluno/';

// Isolated view-model tests: no network, real account, or layout engine.
// Instrument the private closure in the test VM only; do not expose a production API.
function loadPage(kind) {
    const nodes = new Map();
    let document;
    const makeNode = () => ({
        hidden: false, value: '', textContent: '', markup: '', dataset: {}, listeners: {}, attributes: {},
        classList: { add() {}, remove() {}, toggle() {} },
        set innerHTML(value) { this.markup = value; },
        get innerHTML() { return this.markup || this.textContent.replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c])); },
        addEventListener(name, callback) { this.listeners[name] = callback; },
        setAttribute(name, value) { this.attributes[name] = value; },
        removeAttribute(name) { delete this.attributes[name]; },
        querySelector() { return null; }, querySelectorAll() { return []; },
        focus() { document.activeElement = this; }, scrollIntoView() {}
    });
    document = {
        getElementById(id) { if (!nodes.has(id)) nodes.set(id, makeNode()); return nodes.get(id); },
        addEventListener() {}, querySelector() { return makeNode(); },
        createElement: makeNode, body: makeNode(), activeElement: null
    };
    const storage = new Map();
    const window = {
        location: new URL('https://local.test/page.html'), addEventListener() {}, scrollTo() {},
        matchMedia: () => ({ matches: false }),
        history: { pushState() {}, replaceState() {} }
    };
    const context = vm.createContext({ window, document, console, URL,
        history: window.history, requestAnimationFrame: callback => callback(),
        localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) }
    });
    const isBenefits = kind === 'benefits';
    vm.runInContext(read(isBenefits ? benefitsDir + 'beneficios-data.js' : 'Unicheck/js/data/manual-data.js'), context);
    const exports = isBenefits
        ? 'state, cacheElements, bindEvents, getFilteredBenefits, renderBenefits, renderCategoryFilters, clearFilters, createBenefitCard, openDetails, closeModal, toggleFavorite'
        : 'state, cacheElements, bindEvents, filteredArticles, renderDiscovery, renderFilters, resetFilters, openArticle, showDiscovery, renderSection, readHash';
    const source = read(isBenefits ? benefitsDir + 'beneficios-estudantis.js' : manualDir + 'manual-aluno.js');
    vm.runInContext(source.replace(/\}\)\(\);\s*$/, `window.testPage = {${exports}}; })();`), context);
    const api = window.testPage;
    api.cacheElements();
    api.bindEvents();
    return { api, window, document, nodes, storage, data: isBenefits ? window.UniCheckBenefitsData : window.UniCheckManualData };
}

test('catálogo mantém todos os dados comerciais da main; apenas prioridade é adicionada', () => {
    const { data } = loadPage('benefits');
    const originalFields = Array.from(data.benefits, ({ discoveryPriority, ...benefit }) => benefit);
    assert.equal(createHash('sha256').update(JSON.stringify(originalFields)).digest('hex'),
        '4f31e90602135a93d3c83fd6d4554b22ce2b8ac28e1a97f562237cc598263ceb');
    assert.equal(new Set(data.benefits.map(b => b.discoveryPriority)).size, 34);
});

test('descoberta prioriza marcas de uso amplo sem perder benefícios específicos', () => {
    const { api } = loadPage('benefits');
    assert.deepEqual(Array.from(api.getFilteredBenefits().slice(0, 6), b => b.id),
        ['spotify', 'youtube-premium', 'microsoft365', 'adobe', 'notion', 'apple-music']);
    api.state.category = 'development';
    assert.ok(api.getFilteredBenefits().some(b => b.id === 'jetbrains'));
});

test('busca, categoria, tipo e favoritos intersectam; limpar restaura catálogo e página', () => {
    const { api, nodes } = loadPage('benefits');
    Object.assign(api.state, { search: 'universitario spotify', category: 'entertainment', benefitType: 'discount', favoritesOnly: true, favorites: ['spotify'], currentPage: 3 });
    assert.deepEqual(Array.from(api.getFilteredBenefits(), b => b.id), ['spotify']);
    api.renderBenefits();
    assert.equal(api.state.currentPage, 1);
    assert.equal(nodes.get('clearBenefitFilters').hidden, false);
    api.state.category = 'development';
    api.renderBenefits();
    assert.match(nodes.get('platformsGrid').innerHTML, /Nenhum benefício encontrado/);
    api.clearFilters();
    assert.equal(api.getFilteredBenefits().length, 34);
    assert.equal(nodes.get('clearBenefitFilters').hidden, true);
});

test('cards e detalhes preservam oferta e fonte sem datas administrativas', () => {
    const { api, data, nodes } = loadPage('benefits');
    for (const benefit of data.benefits) {
        assert.doesNotMatch(api.createBenefitCard(benefit), /Verificado em|Curadoria|2026-08-16/);
        api.openDetails(benefit.id);
        const body = nodes.get('modalBody').innerHTML;
        assert.doesNotMatch(body, /Consultada em|conferido em|2026-08-16/);
        assert.ok(body.includes(benefit.benefitLabel.replaceAll('&', '&amp;')));
        assert.equal(nodes.get('modalOfficialLink').href, new URL(benefit.officialUrl).href);
        assert.equal(nodes.get('dashboardContainer').inert, true);
    }
    api.closeModal();
    assert.equal(nodes.get('dashboardContainer').inert, false);
});

test('favorito mantém cache e estado acessível, inclusive removendo último resultado', () => {
    const { api, data, nodes, document, storage } = loadPage('benefits');
    api.toggleFavorite('spotify');
    assert.equal(storage.get('platformFavorites:anonymous'), '["spotify"]');
    const card = api.createBenefitCard(data.benefits.find(b => b.id === 'spotify'));
    assert.match(card, /aria-pressed="true"/);
    assert.match(card, /Remover Spotify Premium Universitário dos favoritos/);
    api.state.favoritesOnly = true;
    api.toggleFavorite('spotify');
    assert.equal(api.getFilteredBenefits().length, 0);
    assert.equal(document.activeElement, nodes.get('favoritesFilter'));
});

test('paginação alcança cada benefício sem repetição e ajusta páginas inválidas', () => {
    const { api, nodes } = loadPage('benefits');
    const ids = [];
    for (let page = 1; page <= 3; page++) {
        api.state.currentPage = page;
        api.renderBenefits();
        ids.push(...Array.from(nodes.get('platformsGrid').innerHTML.matchAll(/data-benefit-id="([^"]+)"/g), match => match[1]));
    }
    assert.equal(ids.length, 34);
    assert.equal(new Set(ids).size, 34);
    api.state.currentPage = 999;
    api.renderBenefits();
    assert.equal(api.state.currentPage, 3);
});

test('Manual encontra dúvidas por assunto, acentos, termos separados e instruções', () => {
    const { api } = loadPage('manual');
    const queries = {
        'portal': 'portal-academico', 'financeiro': 'mensalidades-boletos',
        'biblioteca': 'biblioteca-fisica', 'estagio': 'estagio-carreiras',
        'matricula': 'rematricula', 'documentos': 'historico-documentos',
        'atendimento': 'multiatendimento', 'atividades': 'colacao-grau',
        'contrato adesao': 'rematricula', 'RA': 'ra-identidade-estudantil',
        'como emitir boleto': 'mensalidades-boletos'
    };
    for (const [query, expected] of Object.entries(queries)) {
        api.state.query = query;
        assert.ok(api.filteredArticles().some(a => a.id === expected), `${query} deve encontrar ${expected}`);
    }
    api.state.query = 'Portal Acadêmico';
    assert.equal(api.filteredArticles()[0].id, 'portal-academico');
});

test('Manual mantém contexto ao voltar; limpar recupera índice e atalhos', () => {
    const { api, nodes } = loadPage('manual');
    api.state.query = 'boleto';
    api.renderDiscovery();
    assert.equal(nodes.get('manualQuickSection').hidden, true);
    api.openArticle('mensalidades-boletos');
    api.showDiscovery();
    assert.equal(api.state.query, 'boleto');
    assert.match(nodes.get('manualGrid').innerHTML, /mensalidades-boletos/);
    api.state.query = 'inexistente-xyz';
    api.renderDiscovery();
    assert.equal(nodes.get('manualEmpty').hidden, false);
    api.resetFilters();
    assert.equal(nodes.get('manualEmpty').hidden, true);
    assert.equal(nodes.get('manualQuickSection').hidden, false);
    assert.match(nodes.get('manualGrid').innerHTML, /manual-topic-links/);
});

test('Manual mantém seções, ressalvas e referências; detalhes complementares são expansíveis', () => {
    const { api, data, nodes } = loadPage('manual');
    for (const article of data.articles) {
        api.openArticle(article.id);
        const markup = nodes.get('manualDetailBody').innerHTML;
        for (const section of article.sections) {
            assert.ok(markup.includes(section.title), `${article.id}: ${section.title}`);
            for (const item of section.items || []) assert.ok(markup.includes(item));
            if (section.content) assert.ok(markup.includes(section.content));
        }
        assert.equal(nodes.get('manualTemporalNote').hidden, article.temporalFields.length === 0);
        assert.match(nodes.get('manualSourcePages').textContent, /p\./);
    }
    assert.match(api.renderSection({ type: 'knowledge', title: 'Detalhes', content: 'Texto preservado' }), /<details/);
    assert.doesNotMatch(api.renderSection({ type: 'attention', title: 'Atenção', content: 'Restrição' }), /<details/);
});

test('Manual suporta links profundos inválidos e não duplica categorias ou referências', () => {
    const { api, data, window, nodes } = loadPage('manual');
    window.location.hash = '#conteudo=%E0%A4%A';
    assert.doesNotThrow(() => api.readHash());
    assert.equal(nodes.get('manualDetail').hidden, true);
    const ids = new Set(data.articles.map(a => a.id));
    assert.equal(ids.size, data.articles.length);
    for (const article of data.articles) {
        assert.ok(data.categories.some(c => c.id === article.category));
        article.relatedContent.forEach(id => assert.ok(ids.has(id)));
    }
    data.quickAccess.forEach(id => assert.ok(ids.has(id)));
});
