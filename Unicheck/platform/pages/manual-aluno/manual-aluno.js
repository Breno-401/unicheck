(function () {
    const data = window.UniCheckManualData;
    if (!data) return;

    const state = { query: '', category: 'all', activeArticle: null };
    let discoveryFocus = null;
    const elements = {};
    const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const categoryById = (id) => data.categories.find((category) => category.id === id);
    const articleById = (id) => data.articles.find((article) => article.id === id);
    const articlesFor = (categoryId) => data.articles.filter((article) => article.category === categoryId);
    const pageLabel = (pages) => pages.length === 1 ? `p. ${pages[0]}` : `p. ${pages[0]}–${pages[pages.length - 1]}`;
    const categoryOrder = ['vida-academica', 'ferramentas', 'utilidades', 'campus', 'apoio', 'avaliacoes', 'formacao', 'comecando'];
    const orderedCategories = [...data.categories].sort((a, b) => categoryOrder.indexOf(a.id) - categoryOrder.indexOf(b.id));
    const searchIndex = new Map(data.articles.map(article => [article.id, searchableText(article)]));
    const contextParams = () => {
        const params = new URLSearchParams();
        if (state.query.trim()) params.set('busca', state.query);
        if (state.category !== 'all') params.set('categoria', state.category);
        return params;
    };
    const articleHref = id => `#conteudo=${encodeURIComponent(id)}${contextParams().size ? '&' + contextParams() : ''}`;
    const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    function saveDiscovery() {
        history.replaceState({}, '', window.location.pathname + window.location.search + (contextParams().size ? '#' + contextParams() : ''));
    }
    const scrollBehavior = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

    function cacheElements() {
        ['manualDiscovery', 'manualDetail', 'manualSearch', 'clearManualSearch', 'manualResultsStatus', 'manualFilters', 'manualGrid', 'manualCount', 'manualEmpty', 'resetManualFilters', 'manualQuickLinks', 'manualBreadcrumb', 'manualBack', 'manualBackLabel', 'manualDetailCategory', 'manualDetailTime', 'manualDetailTitle', 'manualDetailSummary', 'manualDetailBody', 'manualTemporalNote', 'manualTemporalText', 'manualSourcePages', 'manualRelatedList', 'manualPrevious', 'manualNext'].forEach((id) => { elements[id] = document.getElementById(id); });
    }

    function searchableText(article) {
        const category = categoryById(article.category);
        return normalize([article.title, article.summary, article.content.join(' '), article.keywords.join(' '), category.title, category.shortTitle,
            ...article.sections.flatMap(section => [section.title, section.content || '', ...(section.items || [])])].join(' '));
    }

    function filteredArticles() {
        const query = normalize(state.query.trim());
        const tokens = query.split(/\s+/).filter(term => term && !['a', 'o', 'as', 'os', 'de', 'do', 'da', 'dos', 'das', 'e', 'no', 'na', 'para', 'como'].includes(term));
        const terms = tokens.length ? tokens : query ? [query] : [];
        const score = article => {
            const title = normalize(article.title);
            return (title === query ? 100 : title.includes(query) ? 30 : 0)
                + terms.reduce((sum, term) => sum + (title.includes(term) ? 16 : 0)
                    + (normalize(article.keywords.join(' ')).includes(term) ? 8 : 0)
                    + (normalize(article.summary).includes(term) ? 4 : 0)
                    + (searchIndex.get(article.id).includes(term) ? 1 : 0), 0);
        };
        return data.articles.filter((article) => {
            if (state.category !== 'all' && article.category !== state.category) return false;
            if (!query) return true;
            const haystack = searchIndex.get(article.id);
            return terms.every(term => term.length > 2 ? haystack.includes(term) : haystack.split(/[^a-z0-9]+/).includes(term));
        }).sort((a, b) => query ? score(b) - score(a) : 0);
    }

    function renderFilters() {
        const filters = [{ id: 'all', shortTitle: 'Todos' }, ...orderedCategories];
        elements.manualFilters.innerHTML = filters.map((filter) => `<button type="button" class="manual-filter${state.category === filter.id ? ' is-active' : ''}" data-category="${filter.id}" aria-pressed="${state.category === filter.id}">${filter.shortTitle}</button>`).join('');
    }

    function renderQuickAccess() {
        const labels = { 'portal-academico': 'Portal Acadêmico', 'mensalidades-boletos': 'Boletos', rematricula: 'Rematrícula', 'biblioteca-fisica': 'Biblioteca', 'historico-documentos': 'Histórico', multiatendimento: 'Multiatendimento', 'ra-identidade-estudantil': 'RA', 'frequencia-faltas': 'Frequência' };
        elements.manualQuickLinks.innerHTML = data.quickAccess.map((id) => {
            const article = articleById(id);
            return `<a href="${articleHref(id)}" data-open-article="${id}" aria-label="${article.title}"><i data-lucide="arrow-up-right" aria-hidden="true"></i><span>${labels[id] || article.title}</span></a>`;
        }).join('');
    }

    function categoryCard(category) {
        const count = articlesFor(category.id).length;
        return `<button type="button" class="manual-category" data-open-category="${category.id}"><i data-lucide="${category.icon}" aria-hidden="true"></i><span><strong>${category.title}</strong><small>${category.description}</small><small>${count} orientações</small></span><i data-lucide="chevron-right" aria-hidden="true"></i></button>`;
    }

    function relatedExcerpt(article) {
        const terms = normalize(state.query).split(/\s+/).filter(term => term.length > 2);
        if (!terms.length) return '';
        const passages = [...article.content, ...article.sections.flatMap(section => [section.content || '', ...(section.items || [])])];
        const passage = passages.filter(text => text && text !== article.summary).sort((a, b) =>
            terms.filter(term => normalize(b).includes(term)).length - terms.filter(term => normalize(a).includes(term)).length)[0];
        if (!passage || !terms.some(term => normalize(passage).includes(term))) return '';
        const position = Math.max(0, Math.min(...terms.map(term => normalize(passage).indexOf(term)).filter(index => index >= 0)) - 55);
        return `<p class="manual-result-excerpt">${position ? '…' : ''}${escapeHTML(passage.slice(position, position + 190))}${passage.length > position + 190 ? '…' : ''}</p>`;
    }

    function resultCard(article) {
        const category = categoryById(article.category);
        return `<article class="manual-result-card"><span class="manual-result-category">${category.title}</span><h3><a href="${articleHref(article.id)}" data-open-article="${article.id}">${article.title}</a></h3><p>${article.summary}</p>${relatedExcerpt(article)}<a class="manual-result-action" href="${articleHref(article.id)}" data-open-article="${article.id}" aria-label="Ler ${article.title}"><span>Ler orientação</span><i data-lucide="arrow-right" aria-hidden="true"></i></a></article>`;
    }

    function renderDiscovery() {
        const hasQuery = Boolean(state.query.trim());
        const hasFilter = state.category !== 'all';
        const isResultsView = hasQuery || hasFilter;
        const matches = filteredArticles();
        elements.manualGrid.classList.toggle('is-results', isResultsView);
        elements.manualGrid.innerHTML = isResultsView ? matches.map(resultCard).join('') : orderedCategories.map(categoryCard).join('');
        elements.manualFilters.hidden = !isResultsView;
        document.getElementById('manualQuickSection').hidden = isResultsView;
        document.getElementById('clearManualFilters').hidden = !isResultsView;
        elements.manualEmpty.hidden = !isResultsView || matches.length > 0;
        elements.manualGrid.hidden = isResultsView && matches.length === 0;
        elements.clearManualSearch.hidden = !hasQuery;
        elements.manualCount.textContent = isResultsView ? `${matches.length} ${matches.length === 1 ? 'resultado' : 'resultados'}` : `${data.categories.length} categorias · ${data.articles.length} orientações`;
        const heading = document.getElementById('manualGridTitle');
        heading.textContent = hasQuery ? `Resultados para “${state.query.trim()}”` : hasFilter ? categoryById(state.category).title : 'Encontre por assunto';
        elements.manualResultsStatus.textContent = isResultsView ? `${matches.length} ${matches.length === 1 ? 'orientação encontrada' : 'orientações encontradas'}.` : '';
        elements.manualFilters.querySelectorAll('[data-category]').forEach(button => {
            const selected = state.category === button.dataset.category;
            button.setAttribute('aria-pressed', String(selected));
            button.classList.toggle('is-active', selected);
        });
        refreshIcons();
    }

    function sectionIcon(type) {
        return { overview: 'info', knowledge: 'list-checks', steps: 'route', destination: 'map-pin', attention: 'triangle-alert' }[type] || 'book-open';
    }

    function renderSection(section, index) {
        const ordered = section.type === 'steps';
        const list = section.items ? `<${ordered ? 'ol' : 'ul'}>${section.items.map((item) => `<li>${item}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>` : '';
        const content = `${section.content ? `<p>${section.content}</p>` : ''}${list}`;
        if (section.type === 'knowledge' && section.title !== 'Pontos essenciais') return `<details class="manual-reading-section manual-reading-knowledge"><summary>${section.title}</summary>${content}</details>`;
        return `<section class="manual-reading-section manual-reading-${section.type}" aria-labelledby="manualSection${index}"><div class="manual-reading-heading"><i data-lucide="${sectionIcon(section.type)}" aria-hidden="true"></i><h2 id="manualSection${index}">${section.title}</h2></div>${content}</section>`;
    }

    function renderRelated(article) {
        elements.manualRelatedList.innerHTML = article.relatedContent.slice(0, 3).map((id) => {
            const related = articleById(id);
            return `<a href="${articleHref(id)}" data-open-article="${id}"><span>${related.title}</span><small>${categoryById(related.category).title}</small><i data-lucide="arrow-right" aria-hidden="true"></i></a>`;
        }).join('');
    }

    function setArticleNavigation(article) {
        const categoryArticles = articlesFor(article.category);
        const index = categoryArticles.findIndex((item) => item.id === article.id);
        const previous = categoryArticles[index - 1];
        const next = categoryArticles[index + 1];
        const configure = (button, target, direction) => {
            button.hidden = !target;
            button.dataset.openArticle = target?.id || '';
            if (target) button.href = articleHref(target.id);
            else button.removeAttribute('href');
            button.innerHTML = target ? `${direction === 'previous' ? '<i data-lucide="arrow-left"></i>' : ''}<span><small>${direction === 'previous' ? 'Conteúdo anterior' : 'Próximo conteúdo'}</small><strong>${target.title}</strong></span>${direction === 'next' ? '<i data-lucide="arrow-right"></i>' : ''}` : '';
        };
        configure(elements.manualPrevious, previous, 'previous');
        configure(elements.manualNext, next, 'next');
    }

    function renderNextStep(article) {
        // Only connect destinations already named by this article to existing guidance.
        const destinations = article.sections.find(section => section.type === 'destination')?.items || [];
        const guides = { 'Portal Acadêmico': 'portal-academico', 'Multiatendimento': 'multiatendimento', 'Biblioteca': 'biblioteca-fisica', 'Coordenação do curso': 'coordenacao-curso', 'Ambiente Virtual de Aprendizagem': 'ava-brightspace', 'Aplicativo Meu EduCONNECT': 'meu-educonnect', 'Ouvidoria': 'ouvidoria' };
        const targets = [...new Set(destinations.map(destination => guides[destination]).filter(id => id && id !== article.id))];
        const links = targets.map(id => `<a href="${articleHref(id)}" data-open-article="${id}">Ver como funciona: ${articleById(id).title}<i data-lucide="arrow-right" aria-hidden="true"></i></a>`).join('');
        if (links) return `<section class="manual-next-step"><h2>Seu próximo passo</h2>${links}</section>`;
        const related = articleById(article.relatedContent[0]);
        return related ? `<a class="manual-support-link" href="${articleHref(related.id)}" data-open-article="${related.id}">Continue com: ${related.title}<i data-lucide="arrow-right" aria-hidden="true"></i></a>` : '';
    }

    function openArticle(id, updateHash = true) {
        const article = articleById(id);
        if (!article) return showDiscovery(false);
        const category = categoryById(article.category);
        if (!state.activeArticle) discoveryFocus = document.activeElement;
        state.activeArticle = article.id;
        elements.manualDetailCategory.textContent = category.title;
        elements.manualDetailTime.textContent = `${article.estimatedReadingTime} min de leitura`;
        elements.manualDetailTitle.textContent = article.title;
        elements.manualDetailSummary.textContent = article.summary;
        const sectionOrder = { overview: 0, steps: 1, destination: 2, attention: 3, knowledge: 4 };
        elements.manualDetailBody.innerHTML = [...article.sections].sort((a, b) => sectionOrder[a.type] - sectionOrder[b.type]).map(renderSection).join('')
            + renderNextStep(article);
        elements.manualTemporalNote.hidden = article.temporalFields.length === 0;
        elements.manualTemporalText.textContent = article.temporalFields.length ? `${article.temporalFields.join('; ')} podem sofrer alterações. Consulte o canal institucional para confirmar os dados atuais.` : '';
        elements.manualSourcePages.textContent = pageLabel(article.sourcePages);
        elements.manualBackLabel.textContent = state.query || state.category !== 'all' ? 'Voltar aos resultados' : 'Voltar aos assuntos';
        elements.manualBreadcrumb.innerHTML = `<button type="button" data-show-manual>Manual do Aluno</button><i data-lucide="chevron-right"></i><button type="button" data-show-category="${category.id}">${category.title}</button><i data-lucide="chevron-right"></i><span aria-current="page">${article.title}</span>`;
        renderRelated(article);
        setArticleNavigation(article);
        elements.manualDiscovery.hidden = true;
        elements.manualDetail.hidden = false;
        elements.manualDetail.classList.remove('is-entering');
        requestAnimationFrame(() => elements.manualDetail.classList.add('is-entering'));
        if (updateHash) history.pushState({ article: id }, '', articleHref(id));
        document.title = `${article.title} - Manual do Aluno | UniCheck`;
        window.scrollTo({ top: 0, behavior: scrollBehavior() });
        refreshIcons();
        requestAnimationFrame(() => elements.manualDetailTitle.focus({ preventScroll: true }));
    }

    function showDiscovery(updateHash = true, categoryId = null) {
        const wasReading = Boolean(state.activeArticle);
        state.activeArticle = null;
        if (categoryId) state.category = categoryId;
        elements.manualDetail.hidden = true;
        elements.manualDiscovery.hidden = false;
        document.title = 'Manual do Aluno - UniCheck';
        if (updateHash || categoryId) history.pushState({}, '', window.location.pathname + window.location.search + (contextParams().size ? '#' + contextParams() : ''));
        renderDiscovery();
        if (updateHash || categoryId || wasReading) requestAnimationFrame(() => {
            const target = categoryId ? document.getElementById('manualGridTitle')
                : elements.manualGrid.querySelector(`[data-open-article="${discoveryFocus?.dataset?.openArticle || ''}"]`) || elements.manualSearch;
            target?.focus();
            target?.scrollIntoView?.({ behavior: scrollBehavior(), block: 'nearest' });
        });
    }

    function refreshIcons() { if (window.lucide) window.lucide.createIcons(); }
    function readHash() {
        const params = new URLSearchParams(window.location.hash.slice(1));
        state.query = params.get('busca') || '';
        state.category = categoryById(params.get('categoria')) ? params.get('categoria') : 'all';
        elements.manualSearch.value = state.query;
        params.has('conteudo') ? openArticle(params.get('conteudo'), false) : showDiscovery(false);
    }
    function openFromEvent(event) {
        const button = event.target.closest('[data-open-article]');
        if (!button?.dataset.openArticle || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        openArticle(button.dataset.openArticle);
    }
    function resetFilters() { state.query = ''; state.category = 'all'; elements.manualSearch.value = ''; saveDiscovery(); renderDiscovery(); elements.manualSearch.focus(); }

    function bindEvents() {
        elements.manualSearch.addEventListener('input', (event) => { state.query = event.target.value; state.category = 'all'; saveDiscovery(); renderDiscovery(); });
        elements.clearManualSearch.addEventListener('click', () => { state.query = ''; elements.manualSearch.value = ''; saveDiscovery(); renderDiscovery(); elements.manualSearch.focus(); });
        elements.manualFilters.addEventListener('click', (event) => { const button = event.target.closest('[data-category]'); if (!button) return; state.category = button.dataset.category; saveDiscovery(); renderDiscovery(); });
        elements.manualGrid.addEventListener('click', (event) => { const articleButton = event.target.closest('[data-open-article]'); if (articleButton) return openFromEvent(event); const categoryButton = event.target.closest('[data-open-category]'); if (categoryButton) showDiscovery(false, categoryButton.dataset.openCategory); });
        elements.manualQuickLinks.addEventListener('click', openFromEvent);
        elements.manualRelatedList.addEventListener('click', openFromEvent);
        elements.manualDetailBody.addEventListener('click', openFromEvent);
        elements.manualPrevious.addEventListener('click', openFromEvent);
        elements.manualNext.addEventListener('click', openFromEvent);
        elements.resetManualFilters.addEventListener('click', resetFilters);
        document.getElementById('clearManualFilters').addEventListener('click', resetFilters);
        elements.manualBack.addEventListener('click', () => showDiscovery());
        elements.manualBreadcrumb.addEventListener('click', (event) => { if (event.target.closest('[data-show-manual]')) { state.query = ''; state.category = 'all'; elements.manualSearch.value = ''; showDiscovery(); } const categoryButton = event.target.closest('[data-show-category]'); if (categoryButton) { state.query = ''; elements.manualSearch.value = ''; showDiscovery(true, categoryButton.dataset.showCategory); } });
        window.addEventListener('hashchange', readHash);
    }

    document.addEventListener('DOMContentLoaded', () => { cacheElements(); bindEvents(); renderFilters(); renderQuickAccess(); readHash(); });
})();
