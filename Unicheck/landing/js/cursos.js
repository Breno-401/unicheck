document.addEventListener('DOMContentLoaded', () => {
    const catalog = window.CATALOGO_CURSOS;
    const catalogRoot = document.getElementById('catalogo');
    const searchInput = document.getElementById('busca');
    const filterButtons = [...document.querySelectorAll('.filter-chip')];
    const emptyState = document.getElementById('vazio');
    const resultCount = document.getElementById('resultCount');

    if (!Array.isArray(catalog) || !catalogRoot || !searchInput || !emptyState || !resultCount) return;

    const degreeClasses = {
        Bacharelado: 'degree-bachelor',
        Tecnólogo: 'degree-technology',
        Licenciatura: 'degree-teaching'
    };

    const normalizeText = value => String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR');

    const createElement = (tagName, className, text) => {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    };

    const courseElements = [];
    const areaElements = [];
    const majorAreaElements = [];
    const fragment = document.createDocumentFragment();

    catalog.forEach((majorArea, majorIndex) => {
        const section = createElement('section', 'major-area');
        section.dataset.majorArea = '';
        section.setAttribute('aria-labelledby', `major-area-${majorIndex}`);

        const container = createElement('div', 'container');
        const header = createElement('div', 'major-area-header');
        const icon = createElement('div', 'major-area-icon', majorArea.icone);
        icon.setAttribute('aria-hidden', 'true');
        const headingGroup = createElement('div');
        const heading = createElement('h2', '', majorArea.g);
        heading.id = `major-area-${majorIndex}`;
        headingGroup.append(heading, createElement('p', '', majorArea.resumo));
        header.append(icon, headingGroup);
        container.append(header);

        majorArea.areas.forEach((trainingArea, areaIndex) => {
            const area = createElement('section', 'training-area');
            area.dataset.trainingArea = '';
            area.setAttribute('aria-labelledby', `training-area-${majorIndex}-${areaIndex}`);
            const areaHeading = createElement('h3', 'training-area-title', trainingArea.a);
            areaHeading.id = `training-area-${majorIndex}-${areaIndex}`;
            const grid = createElement('div', 'course-grid');

            trainingArea.cursos.forEach(course => {
                const card = createElement('article', 'course-card');
                card.dataset.degree = course.t;
                card.dataset.search = normalizeText([
                    course.n,
                    course.p,
                    majorArea.g,
                    majorArea.resumo,
                    trainingArea.a,
                    ...course.c
                ].join(' '));

                const courseName = createElement('h4', '', course.n);
                const meta = createElement('div', 'course-meta');
                const degree = createElement('span', `course-tag ${degreeClasses[course.t] || ''}`, course.t);
                const duration = createElement('span', 'course-tag', course.ch);
                meta.append(degree, duration);

                const description = createElement('p', 'course-description', course.p);
                const competencyLabel = createElement('p', 'competency-label', 'Competências do profissional');
                const competencies = createElement('ul', 'competency-list');
                course.c.forEach(competency => competencies.append(createElement('li', '', competency)));

                card.append(courseName, meta, description, competencyLabel, competencies);
                grid.append(card);
                courseElements.push(card);
            });

            area.append(areaHeading, grid);
            container.append(area);
            areaElements.push(area);
        });

        section.append(container);
        fragment.append(section);
        majorAreaElements.push(section);
    });

    catalogRoot.append(fragment);

    const totalAreas = catalog.reduce((total, majorArea) => total + majorArea.areas.length, 0);
    document.getElementById('totalCursos').textContent = courseElements.length;
    document.getElementById('totalAreas').textContent = totalAreas;
    document.getElementById('totalGrandes').textContent = catalog.length;

    let activeDegree = 'todos';

    const updateCatalog = () => {
        const query = normalizeText(searchInput.value.trim());
        let visibleCourses = 0;

        courseElements.forEach(card => {
            const matchesDegree = activeDegree === 'todos' || card.dataset.degree === activeDegree;
            const matchesSearch = !query || card.dataset.search.includes(query);
            const isVisible = matchesDegree && matchesSearch;
            card.hidden = !isVisible;
            if (isVisible) visibleCourses += 1;
        });

        areaElements.forEach(area => {
            area.hidden = !area.querySelector('.course-card:not([hidden])');
        });

        majorAreaElements.forEach(majorArea => {
            majorArea.hidden = !majorArea.querySelector('.course-card:not([hidden])');
        });

        emptyState.hidden = visibleCourses > 0;
        resultCount.textContent = visibleCourses === courseElements.length && activeDegree === 'todos' && !query
            ? `${visibleCourses} cursos no catálogo`
            : `${visibleCourses} ${visibleCourses === 1 ? 'curso encontrado' : 'cursos encontrados'}`;
    };

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            activeDegree = button.dataset.tipo;
            filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
            updateCatalog();
        });
    });

    searchInput.addEventListener('input', updateCatalog);
    updateCatalog();
});
