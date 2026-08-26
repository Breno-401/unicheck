(function () {
    const data = window.UniCheckManualData;
    if (!data) return;

    const state = { query: '', category: 'all', activeArticle: null };
    const elements = {};
    const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const categoryById = (id) => data.categories.find((category) => category.id === id);
    const articleById = (id) => data.articles.find((article) => article.id === id);
    const articlesFor = (categoryId) => data.articles.filter((article) => article.category === categoryId);
    const pageLabel = (pages) => pages.length === 1 ? `p. ${pages[0]}` : `p. ${pages[0]}–${pages[pages.length - 1]}`;

    function cacheElements() {
        ['manualDiscovery', 'manualDetail', 'manualSearch', 'clearManualSearch', 'manualResultsStatus', 'manualFilters', 'manualGrid', 'manualCount', 'manualEmpty', 'resetManualFilters', 'manualQuickLinks', 'manualBreadcrumb', 'manualBack', 'manualBackLabel', 'manualDetailCategory', 'manualDetailTime', 'manualDetailTitle', 'manualDetailSummary', 'manualDetailBody', 'manualTemporalNote', 'manualTemporalText', 'manualSourcePages', 'manualRelatedList', 'manualPrevious', 'manualNext'].forEach((id) => { elements[id] = document.getElementById(id); });
    }

    function searchableText(article) {
        const category = categoryById(article.category);
        return normalize([article.title, article.summary, article.content.join(' '), article.keywords.join(' '), category.title, category.shortTitle].join(' '));
    }

    function filteredArticles() {
        const query = normalize(state.query.trim());
        return data.articles.filter((article) => {
            if (state.category !== 'all' && article.category !== state.category) return false;
            if (!query) return true;
            const haystack = searchableText(article);
            return query.length > 2 ? haystack.includes(query) : haystack.split(/[^a-z0-9]+/).includes(query);
        });
    }

    function renderFilters() {
        const filters = [{ id: 'all', shortTitle: 'Todos' }, ...data.categories];
        elements.manualFilters.innerHTML = filters.map((filter) => `<button type="button" class="manual-filter${state.category === filter.id ? ' is-active' : ''}" data-category="${filter.id}" aria-pressed="${state.category === filter.id}">${filter.shortTitle}</button>`).join('');
    }

    function renderQuickAccess() {
        elements.manualQuickLinks.innerHTML = data.quickAccess.map((id) => {
            const article = articleById(id);
            return `<button type="button" data-open-article="${id}"><i data-lucide="arrow-up-right"></i><span>${article.title}</span></button>`;
        }).join('');
    }

    function categoryCard(category) {
        const count = articlesFor(category.id).length;
        return `<article class="manual-card"><span class="manual-card-icon"><i data-lucide="${category.icon}"></i></span><div class="manual-card-copy"><h3>${category.title}</h3><p>${category.description}</p></div><div class="manual-card-footer"><span>${count} ${count === 1 ? 'conteúdo' : 'conteúdos'}</span><button type="button" data-open-category="${category.id}" aria-label="Explorar ${category.title}">Explorar <i data-lucide="arrow-right"></i></button></div></article>`;
    }

    function resultCard(article) {
        const category = categoryById(article.category);
        return `<article class="manual-result-card"><span class="manual-result-category">${category.title}</span><h3>${article.title}</h3><p>${article.summary}</p><button type="button" data-open-article="${article.id}" aria-label="Ler ${article.title}"><span>Ler orientação</span><i data-lucide="arrow-right"></i></button></article>`;
    }

    function renderDiscovery() {
        const hasQuery = Boolean(state.query.trim());
        const hasFilter = state.category !== 'all';
        const isResultsView = hasQuery || hasFilter;
        const matches = filteredArticles();
        elements.manualGrid.classList.toggle('is-results', isResultsView);
        elements.manualGrid.innerHTML = isResultsView ? matches.map(resultCard).join('') : data.categories.map(categoryCard).join('');
        elements.manualEmpty.hidden = !isResultsView || matches.length > 0;
        elements.manualGrid.hidden = isResultsView && matches.length === 0;
        elements.clearManualSearch.hidden = !hasQuery;
        elements.manualCount.textContent = isResultsView ? `${matches.length} ${matches.length === 1 ? 'resultado' : 'resultados'}` : `${data.categories.length} categorias · ${data.articles.length} orientações`;
        const heading = document.getElementById('manualGridTitle');
        heading.textContent = hasQuery ? `Resultados para “${state.query.trim()}”` : hasFilter ? categoryById(state.category).title : 'Explore por categoria';
        elements.manualResultsStatus.textContent = isResultsView ? `${matches.length} orientação${matches.length === 1 ? '' : 'ões'} encontrada${matches.length === 1 ? '' : 's'}.` : '';
        renderFilters();
        refreshIcons();
    }

    function sectionIcon(type) {
        return { overview: 'info', knowledge: 'list-checks', steps: 'route', destination: 'map-pin', attention: 'triangle-alert' }[type] || 'book-open';
    }

    function renderSection(section) {
        const ordered = section.type === 'steps';
        const list = section.items ? `<${ordered ? 'ol' : 'ul'}>${section.items.map((item) => `<li>${item}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>` : '';
        return `<section class="manual-reading-section manual-reading-${section.type}"><div class="manual-reading-heading"><i data-lucide="${sectionIcon(section.type)}"></i><h2>${section.title}</h2></div>${section.content ? `<p>${section.content}</p>` : ''}${list}</section>`;
    }

    function renderRelated(article) {
        elements.manualRelatedList.innerHTML = article.relatedContent.slice(0, 3).map((id) => {
            const related = articleById(id);
            return `<button type="button" data-open-article="${id}"><span>${related.title}</span><small>${categoryById(related.category).title}</small><i data-lucide="arrow-right"></i></button>`;
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
            button.innerHTML = target ? `${direction === 'previous' ? '<i data-lucide="arrow-left"></i>' : ''}<span><small>${direction === 'previous' ? 'Conteúdo anterior' : 'Próximo conteúdo'}</small><strong>${target.title}</strong></span>${direction === 'next' ? '<i data-lucide="arrow-right"></i>' : ''}` : '';
        };
        configure(elements.manualPrevious, previous, 'previous');
        configure(elements.manualNext, next, 'next');
    }

    function openArticle(id, updateHash = true) {
        const article = articleById(id);
        if (!article) return showDiscovery(false);
        const category = categoryById(article.category);
        state.activeArticle = article.id;
        elements.manualDetailCategory.textContent = category.title;
        elements.manualDetailTime.textContent = `${article.estimatedReadingTime} min de leitura`;
        elements.manualDetailTitle.textContent = article.title;
        elements.manualDetailSummary.textContent = article.summary;
        elements.manualDetailBody.innerHTML = article.sections.map(renderSection).join('');
        elements.manualTemporalNote.hidden = article.temporalFields.length === 0;
        elements.manualTemporalText.textContent = article.temporalFields.length ? `${article.temporalFields.join('; ')} podem sofrer alterações. Consulte o canal institucional para confirmar os dados atuais.` : '';
        elements.manualSourcePages.textContent = pageLabel(article.sourcePages);
        elements.manualBackLabel.textContent = `Voltar para ${category.title}`;
        elements.manualBreadcrumb.innerHTML = `<button type="button" data-show-manual>Manual do Aluno</button><i data-lucide="chevron-right"></i><button type="button" data-show-category="${category.id}">${category.title}</button><i data-lucide="chevron-right"></i><span aria-current="page">${article.title}</span>`;
        renderRelated(article);
        setArticleNavigation(article);
        elements.manualDiscovery.hidden = true;
        elements.manualDetail.hidden = false;
        elements.manualDetail.classList.remove('is-entering');
        requestAnimationFrame(() => elements.manualDetail.classList.add('is-entering'));
        if (updateHash) history.pushState({ article: id }, '', `#conteudo=${encodeURIComponent(id)}`);
        document.title = `${article.title} - Manual do Aluno | UniCheck`;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        refreshIcons();
        requestAnimationFrame(() => elements.manualDetailTitle.focus({ preventScroll: true }));
    }

    function showDiscovery(updateHash = true, categoryId = null) {
        state.activeArticle = null;
        if (categoryId) state.category = categoryId;
        elements.manualDetail.hidden = true;
        elements.manualDiscovery.hidden = false;
        document.title = 'Manual do Aluno - UniCheck';
        if (updateHash) history.pushState({}, '', window.location.pathname + window.location.search);
        renderDiscovery();
        if (categoryId) requestAnimationFrame(() => document.getElementById('manualGridTitle')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }));
    }

    function refreshIcons() { if (window.lucide) window.lucide.createIcons(); }
    function readHash() { const match = window.location.hash.match(/^#conteudo=(.+)$/); match ? openArticle(decodeURIComponent(match[1]), false) : showDiscovery(false); }
    function openFromEvent(event) { const button = event.target.closest('[data-open-article]'); if (button?.dataset.openArticle) openArticle(button.dataset.openArticle); }

    function bindEvents() {
        elements.manualSearch.addEventListener('input', (event) => { state.query = event.target.value; renderDiscovery(); });
        elements.clearManualSearch.addEventListener('click', () => { state.query = ''; elements.manualSearch.value = ''; renderDiscovery(); elements.manualSearch.focus(); });
        elements.manualFilters.addEventListener('click', (event) => { const button = event.target.closest('[data-category]'); if (!button) return; state.category = button.dataset.category; renderDiscovery(); });
        elements.manualGrid.addEventListener('click', (event) => { const articleButton = event.target.closest('[data-open-article]'); if (articleButton) return openArticle(articleButton.dataset.openArticle); const categoryButton = event.target.closest('[data-open-category]'); if (categoryButton) showDiscovery(false, categoryButton.dataset.openCategory); });
        elements.manualQuickLinks.addEventListener('click', openFromEvent);
        elements.manualRelatedList.addEventListener('click', openFromEvent);
        elements.manualPrevious.addEventListener('click', openFromEvent);
        elements.manualNext.addEventListener('click', openFromEvent);
        elements.resetManualFilters.addEventListener('click', () => { state.query = ''; state.category = 'all'; elements.manualSearch.value = ''; renderDiscovery(); });
        elements.manualBack.addEventListener('click', () => { const article = articleById(state.activeArticle); showDiscovery(true, article?.category || 'all'); });
        elements.manualBreadcrumb.addEventListener('click', (event) => { if (event.target.closest('[data-show-manual]')) { state.category = 'all'; showDiscovery(); } const categoryButton = event.target.closest('[data-show-category]'); if (categoryButton) showDiscovery(true, categoryButton.dataset.showCategory); });
        window.addEventListener('popstate', readHash);
    }

    document.addEventListener('DOMContentLoaded', () => { cacheElements(); bindEvents(); renderQuickAccess(); readHash(); });
})();
