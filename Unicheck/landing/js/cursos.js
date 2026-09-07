document.addEventListener('DOMContentLoaded', () => {
    const catalog = window.CATALOGO_CURSOS;
    const catalogRoot = document.getElementById('catalogo');
    const catalogSection = document.querySelector('.catalog-section');
    const catalogEyebrow = document.getElementById('catalogEyebrow');
    const catalogTitle = document.getElementById('catalog-title');
    const searchInput = document.getElementById('busca');
    const filterButtons = [...document.querySelectorAll('.filter-chip')];
    const areaSelector = document.getElementById('areaSelector');
    const areaSelectMobile = document.getElementById('areaSelectMobile');
    const emptyState = document.getElementById('vazio');
    const emptyTitle = document.getElementById('emptyTitle');
    const emptyDescription = document.getElementById('emptyDescription');
    const resultCount = document.getElementById('resultCount');

    const requiredElements = [catalogRoot, catalogSection, catalogEyebrow, catalogTitle, searchInput, areaSelector, areaSelectMobile, emptyState, emptyTitle, emptyDescription, resultCount];
    if (!Array.isArray(catalog) || requiredElements.some(element => !element)) return;

    const degreeClasses = {
        Bacharelado: 'degree-bachelor',
        Tecnólogo: 'degree-technology',
        Licenciatura: 'degree-teaching'
    };

    const normalizeText = value => String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR');

    const slugify = value => normalizeText(value)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const createElement = (tagName, className, text) => {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    };

    const courseCount = majorArea => majorArea.areas.reduce((total, area) => total + area.cursos.length, 0);
    const areaChoices = [
        { slug: 'todas', label: 'Todas as áreas', icon: '▦', count: catalog.reduce((total, majorArea) => total + courseCount(majorArea), 0) },
        ...catalog.map(majorArea => ({
            slug: slugify(majorArea.g),
            label: majorArea.g,
            icon: majorArea.icone,
            count: courseCount(majorArea),
            majorArea
        }))
    ];

    const courses = catalog.flatMap((majorArea, majorIndex) => majorArea.areas.flatMap((trainingArea, areaIndex) => trainingArea.cursos.map(course => ({
        course,
        majorArea,
        trainingArea,
        majorIndex,
        areaIndex,
        majorSlug: slugify(majorArea.g),
        searchIndex: normalizeText([
            course.n,
            course.p,
            majorArea.g,
            majorArea.resumo,
            trainingArea.a,
            ...course.c
        ].join(' '))
    }))));

    let activeDegree = 'todos';
    const requestedArea = new URLSearchParams(window.location.search).get('area');
    let activeAreaSlug = areaChoices.some(choice => choice.slug === requestedArea)
        ? requestedArea
        : areaChoices[1].slug;

    const pluralizeCourses = count => `${count} ${count === 1 ? 'curso' : 'cursos'}`;
    const pluralizeMajorAreas = count => `${count} ${count === 1 ? 'grande área' : 'grandes áreas'}`;

    const updateUrl = (slug, mode = 'push') => {
        const url = new URL(window.location.href);
        url.searchParams.set('area', slug);
        window.history[`${mode}State`]({ area: slug }, '', `${url.pathname}${url.search}${url.hash}`);
    };

    const syncAreaControls = () => {
        areaSelector.querySelectorAll('[data-area-slug]').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.areaSlug === activeAreaSlug));
        });
        areaSelectMobile.value = activeAreaSlug;
    };

    const renderAreaControls = () => {
        const selectorFragment = document.createDocumentFragment();
        const selectFragment = document.createDocumentFragment();

        areaChoices.forEach(choice => {
            const button = createElement('button', `area-option${choice.slug === 'todas' ? ' area-option-all' : ''}`);
            button.type = 'button';
            button.dataset.areaSlug = choice.slug;
            button.setAttribute('aria-pressed', 'false');

            const icon = createElement('span', 'area-option-icon', choice.icon);
            icon.setAttribute('aria-hidden', 'true');
            const copy = createElement('span', 'area-option-copy');
            copy.append(
                createElement('strong', '', choice.label),
                createElement('small', '', pluralizeCourses(choice.count))
            );
            button.append(icon, copy);
            selectorFragment.append(button);

            const option = createElement('option', '', `${choice.label} — ${pluralizeCourses(choice.count)}`);
            option.value = choice.slug;
            selectFragment.append(option);
        });

        areaSelector.append(selectorFragment);
        areaSelectMobile.append(selectFragment);
        syncAreaControls();
    };

    const renderCourseCard = (entry, headingTag = 'h4', includeContext = false) => {
        const { course, majorArea, trainingArea } = entry;
        const card = createElement('article', 'course-card');

        if (includeContext) {
            card.append(createElement('p', 'course-context', `${majorArea.g} · ${trainingArea.a}`));
        }

        const courseName = createElement(headingTag, '', course.n);
        const meta = createElement('div', 'course-meta');
        meta.append(
            createElement('span', `course-tag ${degreeClasses[course.t] || ''}`, course.t),
            createElement('span', 'course-tag', course.ch)
        );

        const competencies = createElement('ul', 'competency-list');
        course.c.forEach(competency => competencies.append(createElement('li', '', competency)));

        card.append(
            courseName,
            meta,
            createElement('p', 'course-description', course.p),
            createElement('p', 'competency-label', 'Competências do profissional'),
            competencies
        );
        return card;
    };

    const renderTrainingArea = (majorArea, trainingArea, entries, headingTag = 'h3', cardHeadingTag = 'h4', includeContext = false) => {
        const section = createElement('section', 'training-area');
        const headingId = `training-area-${catalog.indexOf(majorArea)}-${majorArea.areas.indexOf(trainingArea)}`;
        section.setAttribute('aria-labelledby', headingId);

        const heading = createElement(headingTag, 'training-area-title', trainingArea.a);
        heading.id = headingId;
        const grid = createElement('div', 'course-grid');
        entries.forEach(entry => grid.append(renderCourseCard(entry, cardHeadingTag, includeContext)));
        section.append(heading, grid);
        return section;
    };

    const renderSelectedArea = majorArea => {
        const entries = courses.filter(entry => entry.majorArea === majorArea && (activeDegree === 'todos' || entry.course.t === activeDegree));
        catalogEyebrow.textContent = 'Área selecionada';
        catalogTitle.textContent = majorArea.g;
        resultCount.textContent = `${pluralizeCourses(entries.length)} nesta grande área`;

        if (!entries.length) {
            showEmptyState('Nenhum curso neste grau', `Não há cursos de ${activeDegree.toLocaleLowerCase('pt-BR')} nesta grande área. Escolha outro grau ou outra área.`);
            return;
        }

        const section = createElement('section', 'major-area selected-major-area');
        section.setAttribute('aria-labelledby', 'catalog-title');
        const container = createElement('div', 'container');
        const overview = createElement('div', 'selected-area-overview');
        const icon = createElement('div', 'major-area-icon', majorArea.icone);
        icon.setAttribute('aria-hidden', 'true');
        overview.append(icon, createElement('p', '', majorArea.resumo));
        container.append(overview);

        majorArea.areas.forEach(trainingArea => {
            const areaEntries = entries.filter(entry => entry.trainingArea === trainingArea);
            if (areaEntries.length) container.append(renderTrainingArea(majorArea, trainingArea, areaEntries));
        });

        section.append(container);
        catalogRoot.append(section);
    };

    const renderSearchResults = (entries, rawQuery) => {
        catalogEyebrow.textContent = 'Busca no catálogo';
        catalogTitle.textContent = `Resultados para “${rawQuery}”`;
        resultCount.textContent = `${pluralizeCourses(entries.length)} ${entries.length === 1 ? 'encontrado' : 'encontrados'}`;

        if (!entries.length) {
            showEmptyState('Nenhum curso encontrado', 'Tente outro termo ou ajuste o filtro de grau.');
            return;
        }

        catalog.forEach((majorArea, majorIndex) => {
            const majorEntries = entries.filter(entry => entry.majorArea === majorArea);
            if (!majorEntries.length) return;

            const section = createElement('section', 'major-area search-major-area');
            const headingId = `search-major-area-${majorIndex}`;
            section.setAttribute('aria-labelledby', headingId);
            const container = createElement('div', 'container');
            const header = createElement('div', 'major-area-header');
            const icon = createElement('div', 'major-area-icon', majorArea.icone);
            icon.setAttribute('aria-hidden', 'true');
            const headingGroup = createElement('div');
            const heading = createElement('h3', '', majorArea.g);
            heading.id = headingId;
            headingGroup.append(heading, createElement('p', '', majorArea.resumo));
            header.append(icon, headingGroup);
            container.append(header);

            majorArea.areas.forEach(trainingArea => {
                const areaEntries = majorEntries.filter(entry => entry.trainingArea === trainingArea);
                if (areaEntries.length) container.append(renderTrainingArea(majorArea, trainingArea, areaEntries, 'h4', 'h5', true));
            });

            section.append(container);
            catalogRoot.append(section);
        });
    };

    const renderAllAreasSummary = () => {
        catalogEyebrow.textContent = 'Visão geral';
        catalogTitle.textContent = 'Todas as grandes áreas';

        const summaries = catalog.map(majorArea => {
            const entries = courses.filter(entry => entry.majorArea === majorArea && (activeDegree === 'todos' || entry.course.t === activeDegree));
            return { majorArea, entries, slug: slugify(majorArea.g) };
        }).filter(summary => summary.entries.length);
        const totalCourses = summaries.reduce((total, summary) => total + summary.entries.length, 0);
        resultCount.textContent = `${pluralizeMajorAreas(summaries.length)} · ${pluralizeCourses(totalCourses)}`;

        if (!summaries.length) {
            showEmptyState('Nenhuma área encontrada', 'Escolha outro filtro de grau para explorar o catálogo.');
            return;
        }

        const container = createElement('div', 'container');
        const grid = createElement('div', 'area-summary-grid');
        summaries.forEach(({ majorArea, entries, slug }) => {
            const card = createElement('article', 'area-summary-card');
            const header = createElement('div', 'area-summary-header');
            const icon = createElement('div', 'major-area-icon', majorArea.icone);
            icon.setAttribute('aria-hidden', 'true');
            const headingGroup = createElement('div');
            headingGroup.append(
                createElement('h3', '', majorArea.g),
                createElement('p', 'area-summary-count', pluralizeCourses(entries.length))
            );
            header.append(icon, headingGroup);

            const areaList = createElement('ul', 'area-summary-list');
            majorArea.areas.forEach(trainingArea => {
                const areaCount = entries.filter(entry => entry.trainingArea === trainingArea).length;
                if (!areaCount) return;
                const item = createElement('li');
                item.append(createElement('span', '', trainingArea.a), createElement('small', '', areaCount));
                areaList.append(item);
            });

            const action = createElement('button', 'area-summary-action', 'Explorar área');
            action.type = 'button';
            action.dataset.exploreArea = slug;
            const arrow = createElement('span', '', '→');
            arrow.setAttribute('aria-hidden', 'true');
            action.append(arrow);
            card.append(header, createElement('p', 'area-summary-description', majorArea.resumo), areaList, action);
            grid.append(card);
        });
        container.append(grid);
        catalogRoot.append(container);
    };

    function showEmptyState(title, description) {
        emptyTitle.textContent = title;
        emptyDescription.textContent = description;
        emptyState.hidden = false;
    }

    const renderView = () => {
        catalogRoot.replaceChildren();
        emptyState.hidden = true;
        const rawQuery = searchInput.value.trim();
        const query = normalizeText(rawQuery);

        if (query) {
            const entries = courses.filter(entry => (
                (activeDegree === 'todos' || entry.course.t === activeDegree)
                && entry.searchIndex.includes(query)
            ));
            renderSearchResults(entries, rawQuery);
            return;
        }

        if (activeAreaSlug === 'todas') {
            renderAllAreasSummary();
            return;
        }

        const selectedArea = areaChoices.find(choice => choice.slug === activeAreaSlug)?.majorArea || catalog[0];
        renderSelectedArea(selectedArea);
    };

    const scrollToCatalog = () => {
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        window.requestAnimationFrame(() => catalogSection.scrollIntoView({ behavior, block: 'start' }));
    };

    const selectArea = (slug, { changeUrl = true, scroll = true } = {}) => {
        if (!areaChoices.some(choice => choice.slug === slug)) return;
        const changed = activeAreaSlug !== slug;
        activeAreaSlug = slug;
        syncAreaControls();
        renderView();

        if (changeUrl && changed) updateUrl(slug);
        if (scroll) scrollToCatalog();
    };

    areaSelector.addEventListener('click', event => {
        const button = event.target.closest('[data-area-slug]');
        if (button) selectArea(button.dataset.areaSlug);
    });

    areaSelectMobile.addEventListener('change', event => selectArea(event.target.value));

    catalogRoot.addEventListener('click', event => {
        const button = event.target.closest('[data-explore-area]');
        if (button) selectArea(button.dataset.exploreArea);
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            activeDegree = button.dataset.tipo;
            filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
            renderView();
        });
    });

    searchInput.addEventListener('input', renderView);
    window.addEventListener('popstate', () => {
        const slug = new URLSearchParams(window.location.search).get('area');
        selectArea(areaChoices.some(choice => choice.slug === slug) ? slug : areaChoices[1].slug, { changeUrl: false });
    });

    renderAreaControls();
    updateUrl(activeAreaSlug, 'replace');
    document.getElementById('totalCursos').textContent = courses.length;
    document.getElementById('totalAreas').textContent = catalog.reduce((total, majorArea) => total + majorArea.areas.length, 0);
    document.getElementById('totalGrandes').textContent = catalog.length;
    renderView();
});
