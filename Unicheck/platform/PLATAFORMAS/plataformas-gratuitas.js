(function initializeBenefitsPage() {
    'use strict';

    const FAVORITES_TABLE = 'user_platform_favorites';
    const FAVORITES_CACHE_KEY = 'platformFavorites';
    const FAVORITES_QUEUE_KEY = 'unicheck_favorites_sync_queue';
    const FAVORITES_REMOTE_READY_KEY = 'unicheck_favorites_remote_ready';
    const FAVORITES_REQUEST_TIMEOUT_MS = 15000;
    const data = window.UniCheckBenefitsData || { benefits: [], categories: [] };
    const state = {
        benefits: [...data.benefits],
        favorites: [],
        category: 'all',
        benefitType: 'all',
        search: '',
        favoritesOnly: false
    };
    let favoriteUserId = null;
    let favoriteSyncInFlight = false;
    let searchTimer = null;
    let lastFocusedElement = null;

    const elements = {};

    document.addEventListener('DOMContentLoaded', () => {
        cacheElements();
        state.favorites = normalizeFavoriteIds(readStoredList(FAVORITES_CACHE_KEY));
        renderCategoryFilters();
        bindEvents();
        renderBenefits();
        void initializeFavoritePersistence();
    });

    window.addEventListener('online', () => { void flushCurrentUserFavorites(); });

    function cacheElements() {
        elements.grid = document.getElementById('platformsGrid');
        elements.search = document.getElementById('platformSearch');
        elements.clearSearch = document.getElementById('clearSearch');
        elements.typeFilter = document.getElementById('benefitTypeFilter');
        elements.categoryFilters = document.getElementById('categoryFilters');
        elements.resultsTitle = document.getElementById('resultsTitle');
        elements.resultsSummary = document.getElementById('resultsSummary');
        elements.favoritesFilter = document.getElementById('favoritesFilter');
        elements.modal = document.getElementById('platformModal');
        elements.modalContent = elements.modal?.querySelector('.modal-content');
        elements.modalTitle = document.getElementById('modalTitle');
        elements.modalBody = document.getElementById('modalBody');
        elements.modalOfficialLink = document.getElementById('modalOfficialLink');
        elements.officialLinkUnavailable = document.getElementById('officialLinkUnavailable');
    }

    function bindEvents() {
        elements.search?.addEventListener('input', event => {
            state.search = event.target.value.trim();
            elements.clearSearch.hidden = !state.search;
            clearTimeout(searchTimer);
            searchTimer = window.setTimeout(renderBenefits, 180);
        });
        elements.clearSearch?.addEventListener('click', () => {
            elements.search.value = '';
            elements.clearSearch.hidden = true;
            state.search = '';
            renderBenefits();
            elements.search.focus();
        });
        elements.typeFilter?.addEventListener('change', event => {
            state.benefitType = event.target.value;
            renderBenefits();
        });
        elements.favoritesFilter?.addEventListener('click', () => {
            state.favoritesOnly = !state.favoritesOnly;
            elements.favoritesFilter.setAttribute('aria-pressed', String(state.favoritesOnly));
            elements.favoritesFilter.classList.toggle('active', state.favoritesOnly);
            renderBenefits();
        });
        elements.categoryFilters?.addEventListener('click', event => {
            const button = event.target.closest('[data-category]');
            if (!button) return;
            state.category = button.dataset.category;
            renderCategoryFilters();
            renderBenefits();
        });
        elements.grid?.addEventListener('click', handleGridClick);
        elements.modal?.addEventListener('click', event => {
            if (event.target.closest('[data-action="close-modal"]')) closeModal();
        });
        document.addEventListener('keydown', event => {
            if (!elements.modal || elements.modal.hidden) return;
            if (event.key === 'Escape') closeModal();
            if (event.key === 'Tab') trapModalFocus(event);
        });
    }

    function renderCategoryFilters() {
        const activeCategories = data.categories.filter(category => state.benefits.some(benefit => getBenefitCategories(benefit).includes(category.id)));
        const options = [{ id: 'all', label: 'Todos' }, ...activeCategories];
        elements.categoryFilters.innerHTML = options.map(category => `
            <button type="button" class="filter-btn${state.category === category.id ? ' active' : ''}" data-category="${category.id}" aria-pressed="${state.category === category.id}">
                ${escapeHtml(category.label)}
            </button>
        `).join('');
    }

    function renderBenefits() {
        const filtered = getFilteredBenefits();
        const query = state.search.trim();
        elements.resultsTitle.textContent = query ? `Resultados para “${query}”` : 'Benefícios verificados';
        elements.resultsSummary.textContent = `${filtered.length} ${filtered.length === 1 ? 'benefício encontrado' : 'benefícios encontrados'}`;

        if (!filtered.length) {
            elements.grid.innerHTML = `
                <div class="no-results">
                    <i data-lucide="search-x" aria-hidden="true"></i>
                    <h3>Nenhum benefício encontrado</h3>
                    <p>Tente outro termo ou remova um dos filtros.</p>
                    <button class="btn btn-secondary" type="button" data-action="clear-filters">Limpar filtros</button>
                </div>`;
        } else {
            elements.grid.innerHTML = filtered.map(createBenefitCard).join('');
        }
        refreshIcons();
    }

    function createBenefitCard(benefit) {
        const favorite = state.favorites.includes(benefit.id);
        const category = getCategory(benefit.category);
        const media = benefit.logo
            ? `<img src="${escapeHtml(benefit.logo)}" alt="" class="benefit-logo">`
            : benefit.fallbackLabel
                ? `<span class="benefit-brand-fallback" aria-hidden="true">${escapeHtml(benefit.fallbackLabel)}</span>`
                : `<span class="benefit-icon" aria-hidden="true"><i data-lucide="${escapeHtml(benefit.icon || category?.icon || 'badge-percent')}"></i></span>`;
        const verification = benefit.lastVerified
            ? `<span class="verified-date" title="Oferta conferida em fonte oficial em ${formatDateLong(benefit.lastVerified)}"><i data-lucide="shield-check"></i> Verificado em ${formatMonthYear(benefit.lastVerified)}</span>`
            : '';

        return `
            <article class="benefit-card" data-benefit-id="${escapeHtml(benefit.id)}">
                <div class="benefit-card-top">
                    ${media}
                    <div class="benefit-heading">
                        <span class="category-label">${escapeHtml(category?.label || benefit.category)}</span>
                        <h3>${escapeHtml(benefit.name)}</h3>
                    </div>
                    <button type="button" class="favorite-btn${favorite ? ' active' : ''}" data-action="toggle-favorite" data-platform="${escapeHtml(benefit.id)}" aria-pressed="${favorite}" aria-label="${favorite ? 'Remover' : 'Adicionar'} ${escapeHtml(benefit.name)} ${favorite ? 'dos' : 'aos'} favoritos" title="${favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                        <i data-lucide="${favorite ? 'bookmark-check' : 'bookmark'}"></i>
                    </button>
                </div>
                <div class="benefit-card-body">
                    <span class="benefit-badge ${getBenefitBadgeClass(benefit)}">${escapeHtml(benefit.benefitLabel)}</span>
                    ${benefit.regionalLabel ? `<span class="regional-badge"><i data-lucide="map-pin"></i>${escapeHtml(benefit.regionalLabel)}</span>` : ''}
                    <p>${escapeHtml(benefit.description)}</p>
                    <div class="benefit-audience"><i data-lucide="user-check" aria-hidden="true"></i><span>${escapeHtml(benefit.targetAudience)}</span></div>
                    <div class="benefit-tags">${benefit.tags.slice(0, 3).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
                </div>
                <div class="benefit-card-footer">
                    ${verification}
                    <button class="details-link" type="button" data-action="view-details" data-platform="${escapeHtml(benefit.id)}" aria-label="Ver detalhes de ${escapeHtml(benefit.name)}"><span>Ver detalhes</span><i data-lucide="arrow-right"></i></button>
                </div>
            </article>`;
    }

    function handleGridClick(event) {
        const actionElement = event.target.closest('[data-action]');
        if (!actionElement) return;
        const action = actionElement.dataset.action;
        if (action === 'toggle-favorite') toggleFavorite(actionElement.dataset.platform, actionElement);
        if (action === 'view-details') openDetails(actionElement.dataset.platform, actionElement);
        if (action === 'clear-filters') clearFilters();
    }

    function openDetails(id, trigger) {
        const benefit = state.benefits.find(item => item.id === id);
        if (!benefit || !elements.modal) return;
        lastFocusedElement = trigger || document.activeElement;
        const category = getCategory(benefit.category);
        const volatileNote = benefit.volatileFields?.length
            ? `<div class="volatile-note"><i data-lucide="refresh-cw"></i><div><strong>Informação sujeita a atualização</strong><p>Preço, percentual, crédito ou condição promocional foi conferido em ${formatDateLong(benefit.lastVerified)}. Consulte a página oficial antes de contratar.</p></div></div>`
            : '';
        const institutionNote = benefit.status === 'institution_dependent'
            ? `<div class="institution-note"><i data-lucide="building-2"></i><div><strong>Depende da instituição</strong><p>O acesso só é liberado quando a instituição e o e-mail acadêmico atendem aos critérios do fornecedor.</p></div></div>`
            : '';

        elements.modalTitle.textContent = benefit.name;
        elements.modalBody.innerHTML = `
            <div class="modal-benefit-summary">
                <span class="category-label">${escapeHtml(category?.label || benefit.category)}</span>
                <span class="benefit-badge ${getBenefitBadgeClass(benefit)}">${escapeHtml(benefit.benefitLabel)}</span>
                <p>${escapeHtml(benefit.description)}</p>
            </div>
            ${volatileNote}${institutionNote}
            <dl class="benefit-detail-list">
                <div><dt><i data-lucide="users"></i> Para quem</dt><dd>${escapeHtml(benefit.targetAudience)}</dd></div>
                <div><dt><i data-lucide="badge-check"></i> Como verificar</dt><dd>${escapeHtml(benefit.verification)}</dd></div>
                <div><dt><i data-lucide="route"></i> Como acessar</dt><dd>${escapeHtml(getAccessDescription(benefit))}</dd></div>
                <div><dt><i data-lucide="map-pin"></i> Disponibilidade</dt><dd>${escapeHtml(benefit.availability)}</dd></div>
                <div><dt><i data-lucide="circle-alert"></i> Elegibilidade</dt><dd>${escapeHtml(benefit.eligibility)}</dd></div>
            </dl>
            <div class="official-source"><i data-lucide="external-link"></i><div><strong>Fonte oficial</strong><span>Consultada em ${formatDateLong(benefit.lastVerified)}</span></div></div>`;
        const officialUrl = getValidOfficialUrl(benefit.officialUrl);
        elements.modalOfficialLink.hidden = !officialUrl;
        elements.officialLinkUnavailable.hidden = Boolean(officialUrl);
        if (officialUrl) elements.modalOfficialLink.href = officialUrl;
        else elements.modalOfficialLink.removeAttribute('href');
        elements.modal.hidden = false;
        document.body.classList.add('modal-open');
        elements.modal.querySelector('.modal-close')?.focus();
        refreshIcons();
    }

    function closeModal() {
        if (!elements.modal || elements.modal.hidden) return;
        elements.modal.hidden = true;
        document.body.classList.remove('modal-open');
        lastFocusedElement?.focus?.();
    }

    function trapModalFocus(event) {
        const focusable = [...elements.modal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
            .filter(item => !item.hidden && item.getClientRects().length);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function getValidOfficialUrl(value) {
        try {
            const url = new URL(value);
            return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
        } catch (error) {
            return '';
        }
    }

    function clearFilters() {
        state.category = 'all';
        state.benefitType = 'all';
        state.search = '';
        state.favoritesOnly = false;
        elements.search.value = '';
        elements.clearSearch.hidden = true;
        elements.typeFilter.value = 'all';
        elements.favoritesFilter?.setAttribute('aria-pressed', 'false');
        elements.favoritesFilter?.classList.remove('active');
        renderCategoryFilters();
        renderBenefits();
        elements.search.focus();
    }

    function getFilteredBenefits() {
        const search = normalizeSearch(state.search);
        return state.benefits.filter(benefit => {
            const categoryMatches = state.category === 'all' || getBenefitCategories(benefit).includes(state.category);
            const typeMatches = state.benefitType === 'all'
                || (state.benefitType === 'free' && ['free_student', 'free_for_all'].includes(benefit.benefitType))
                || (state.benefitType === 'discount' && benefit.benefitType === 'student_discount')
                || (state.benefitType === 'education-price' && benefit.benefitType === 'education_price')
                || (state.benefitType === 'program' && benefit.benefitType === 'student_program')
                || (state.benefitType === 'institution' && benefit.benefitType === 'institution_dependent')
                || (state.benefitType === 'public' && ['government_benefit', 'regional_benefit'].includes(benefit.benefitType));
            const corpus = normalizeSearch([
                benefit.name, benefit.description, benefit.benefitLabel, benefit.targetAudience,
                benefit.verification, benefit.eligibility, benefit.availability, benefit.subcategory,
                benefit.sourceChannel, benefit.accessMethod, ...benefit.tags,
                ...getBenefitCategories(benefit).flatMap(id => [getCategory(id)?.label || id, ...getCategorySearchTerms(id)])
            ].join(' '));
            const favoriteMatches = !state.favoritesOnly || state.favorites.includes(benefit.id);
            return categoryMatches && typeMatches && favoriteMatches && (!search || corpus.includes(search));
        });
    }

    function getBenefitCategories(benefit) {
        return [benefit.category, ...(benefit.secondaryCategories || [])];
    }

    function getCategory(id) {
        return data.categories.find(category => category.id === id);
    }

    function getCategorySearchTerms(id) {
        const terms = {
            development: ['programação', 'código', 'software'],
            'productivity-studies': ['estudos', 'organização', 'produtividade'],
            'design-creativity': ['design', 'criatividade', 'arte', 'áudio'],
            'cloud-data': ['cloud', 'nuvem', 'dados', 'analytics'],
            education: ['educação', 'curso', 'aprendizado'],
            technology: ['tecnologia', 'hardware', 'notebook'],
            entertainment: ['entretenimento', 'música', 'vídeo'],
            'shopping-benefits': ['compras', 'descontos', 'vantagens'],
            'rights-mobility': ['direitos', 'mobilidade', 'ônibus', 'transporte', 'meia entrada']
        };
        return terms[id] || [];
    }

    function getBenefitBadgeClass(benefit) {
        if (benefit.benefitType === 'student_discount') return 'is-discount';
        if (benefit.benefitType === 'education_price') return 'is-education-price';
        if (benefit.benefitType === 'institution_dependent') return 'is-institution';
        if (['government_benefit', 'regional_benefit'].includes(benefit.benefitType)) return 'is-public';
        if (benefit.benefitType === 'student_program') return 'is-program';
        return 'is-free';
    }

    function getAccessDescription(benefit) {
        const channelLabels = {
            github_student_pack: 'Disponível pelo GitHub Student Developer Pack.',
            unidays: 'Acesse e valide seu vínculo pela UNiDAYS.',
            isic: 'Solicite a carteira ISIC e consulte as vantagens participantes.',
            institution: 'Solicite acesso usando os canais e credenciais da instituição elegível.',
            government: 'Use o serviço ou documento oficial do programa governamental.',
            direct: 'Acesse diretamente o portal oficial do benefício.'
        };
        return channelLabels[benefit.sourceChannel] || 'Consulte o canal oficial indicado.';
    }

    function normalizeSearch(value) {
        return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }

    function escapeHtml(value) {
        const node = document.createElement('div');
        node.textContent = String(value ?? '');
        return node.innerHTML;
    }

    function formatMonthYear(value) {
        const [year, month] = value.split('-').map(Number);
        return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date(year, month - 1, 1)).replace('.', '');
    }

    function formatDateLong(value) {
        const [year, month, day] = value.split('-').map(Number);
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(year, month - 1, day));
    }

    function refreshIcons() {
        window.lucide?.createIcons?.();
    }

    function getCurrentUserStorageSuffix() {
        if (favoriteUserId) return favoriteUserId;
        try {
            const profileKey = window.UniCheckConfig?.STORAGE_KEYS?.USER_PROFILE || 'userProfile';
            const profile = JSON.parse(localStorage.getItem(profileKey) || 'null');
            return profile?.id || 'anonymous';
        } catch (error) {
            return 'anonymous';
        }
    }

    function getPlatformStorageKey(baseKey) {
        return `${baseKey}:${getCurrentUserStorageSuffix()}`;
    }

    function readStoredList(baseKey) {
        try { return JSON.parse(localStorage.getItem(getPlatformStorageKey(baseKey)) || '[]'); }
        catch (error) { return []; }
    }

    function writeStoredList(baseKey, value) {
        localStorage.setItem(getPlatformStorageKey(baseKey), JSON.stringify(value));
    }

    function normalizeFavoriteIds(values) {
        const validIds = new Set(state.benefits.map(benefit => benefit.id));
        return [...new Set(Array.isArray(values) ? values.filter(value => typeof value === 'string' && validIds.has(value)) : [])];
    }

    function getFavoriteQueueKey(userId) { return `${FAVORITES_QUEUE_KEY}:${userId}`; }
    function getFavoritesRemoteReadyKey(userId) { return `${FAVORITES_REMOTE_READY_KEY}:${userId}`; }

    function readFavoriteQueue(userId) {
        try {
            const parsed = JSON.parse(localStorage.getItem(getFavoriteQueueKey(userId)) || '[]');
            const latest = new Map();
            (Array.isArray(parsed) ? parsed : []).forEach(item => {
                if (item && typeof item.platform_id === 'string' && ['add', 'remove'].includes(item.action)) latest.set(item.platform_id, item);
            });
            return [...latest.values()];
        } catch (error) {
            console.warn('[UniCheckFavorites] Fila local inválida; mantendo cache', error);
            return [];
        }
    }

    function writeFavoriteQueue(userId, queue) {
        const latest = new Map();
        queue.forEach(item => latest.set(item.platform_id, item));
        const normalized = [...latest.values()];
        localStorage.setItem(getFavoriteQueueKey(userId), JSON.stringify(normalized));
        return normalized;
    }

    function enqueueFavoriteChange(userId, platformId, action) {
        const queue = readFavoriteQueue(userId).filter(item => item.platform_id !== platformId);
        writeFavoriteQueue(userId, [...queue, { platform_id: platformId, action }]);
    }

    async function withFavoritesTimeout(query, context) {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), FAVORITES_REQUEST_TIMEOUT_MS);
        try { return await query.abortSignal(controller.signal); }
        catch (error) {
            if (controller.signal.aborted) throw new Error(`${context} excedeu ${FAVORITES_REQUEST_TIMEOUT_MS / 1000} segundos.`);
            throw error;
        } finally { window.clearTimeout(timeoutId); }
    }

    function getFavoritesClient() {
        const client = window.UniCheckSupabase?.client;
        if (!client) throw new Error('Supabase não configurado para favoritos.');
        return client;
    }

    async function flushFavoriteQueue(userId) {
        if (!userId || favoriteSyncInFlight) return false;
        const snapshot = readFavoriteQueue(userId).filter(item => state.benefits.some(benefit => benefit.id === item.platform_id));
        writeFavoriteQueue(userId, snapshot);
        if (!snapshot.length) return true;
        favoriteSyncInFlight = true;
        try {
            const additions = snapshot.filter(item => item.action === 'add');
            const removals = snapshot.filter(item => item.action === 'remove');
            if (additions.length) {
                const payload = additions.map(item => ({ user_id: userId, platform_id: item.platform_id }));
                const { error } = await withFavoritesTimeout(getFavoritesClient().from(FAVORITES_TABLE).upsert(payload, { onConflict: 'user_id,platform_id', ignoreDuplicates: true }), 'Sincronização dos favoritos');
                if (error) throw error;
            }
            if (removals.length) {
                const { error } = await withFavoritesTimeout(getFavoritesClient().from(FAVORITES_TABLE).delete().eq('user_id', userId).in('platform_id', removals.map(item => item.platform_id)), 'Remoção dos favoritos');
                if (error) throw error;
            }
            const processed = new Map(snapshot.map(item => [item.platform_id, item.action]));
            writeFavoriteQueue(userId, readFavoriteQueue(userId).filter(item => processed.get(item.platform_id) !== item.action));
            return true;
        } catch (error) {
            console.error('[UniCheckFavorites] Sincronização pendente; cache preservado', error);
            return false;
        } finally { favoriteSyncInFlight = false; }
    }

    async function fetchRemoteFavorites(userId) {
        const { data: rows, error } = await withFavoritesTimeout(getFavoritesClient().from(FAVORITES_TABLE).select('platform_id').eq('user_id', userId), 'Consulta dos favoritos');
        if (error) throw error;
        return normalizeFavoriteIds((rows || []).map(item => item.platform_id));
    }

    function applyPendingFavoriteChanges(favorites, queue) {
        const reconciled = new Set(favorites);
        queue.forEach(item => item.action === 'add' ? reconciled.add(item.platform_id) : reconciled.delete(item.platform_id));
        return [...reconciled];
    }

    async function initializeFavoritePersistence() {
        try {
            const session = await window.UniCheckAuth?.getSession?.();
            const userId = session?.user?.id;
            if (!userId) return;
            favoriteUserId = userId;
            const localFavorites = normalizeFavoriteIds(readStoredList(FAVORITES_CACHE_KEY));
            state.favorites = localFavorites;
            writeStoredList(FAVORITES_CACHE_KEY, localFavorites);
            renderBenefits();
            const remoteReadyKey = getFavoritesRemoteReadyKey(userId);
            if (localStorage.getItem(remoteReadyKey) !== 'true') localFavorites.forEach(id => enqueueFavoriteChange(userId, id, 'add'));
            await flushFavoriteQueue(userId);
            state.favorites = normalizeFavoriteIds(applyPendingFavoriteChanges(await fetchRemoteFavorites(userId), readFavoriteQueue(userId)));
            writeStoredList(FAVORITES_CACHE_KEY, state.favorites);
            localStorage.setItem(remoteReadyKey, 'true');
            renderBenefits();
        } catch (error) {
            console.error('[UniCheckFavorites] Restauração remota indisponível; usando favoritos locais', error);
        }
    }

    async function flushCurrentUserFavorites() {
        try {
            const userId = (await window.UniCheckAuth?.getSession?.())?.user?.id;
            if (userId) { favoriteUserId = userId; await flushFavoriteQueue(userId); }
        } catch (error) { console.warn('[UniCheckFavorites] Fila pendente mantida', error); }
    }

    function toggleFavorite(platformId, button) {
        if (!state.benefits.some(benefit => benefit.id === platformId)) return;
        const index = state.favorites.indexOf(platformId);
        const isFavorite = index === -1;
        if (isFavorite) state.favorites.push(platformId); else state.favorites.splice(index, 1);
        state.favorites = normalizeFavoriteIds(state.favorites);
        writeStoredList(FAVORITES_CACHE_KEY, state.favorites);
        const userId = getCurrentUserStorageSuffix();
        if (userId !== 'anonymous') {
            enqueueFavoriteChange(userId, platformId, isFavorite ? 'add' : 'remove');
            void flushFavoriteQueue(userId);
        }
        const benefit = state.benefits.find(item => item.id === platformId);
        window.UniCheckActivity?.record?.(userId, {
            type: isFavorite ? 'platform_favorited' : 'platform_unfavorited',
            title: isFavorite ? `Favoritou “${benefit.name}”` : `Removeu “${benefit.name}” dos favoritos`,
            context: 'Benefícios para Estudantes'
        });
        renderBenefits();
    }
})();
