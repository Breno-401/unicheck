document.addEventListener('DOMContentLoaded', () => {
    const catalogStatus = document.getElementById('unimatch-catalog-status');
    const curriculumSelect = document.getElementById('unimatch-curriculum');
    const form = document.getElementById('unimatch-form');
    const rowsContainer = document.getElementById('unimatch-disciplines');
    const addDisciplineButton = document.getElementById('unimatch-add-discipline');
    const submitButton = document.getElementById('unimatch-submit');
    const formError = document.getElementById('unimatch-form-error');
    const results = document.getElementById('unimatch-results');
    const emptyResults = document.getElementById('unimatch-results-empty');
    const resultList = document.getElementById('unimatch-results-list');
    const disciplineStatus = document.getElementById('unimatch-discipline-status');
    const firstRow = rowsContainer?.querySelector('[data-discipline-row]');

    if (!catalogStatus || !curriculumSelect || !form || !rowsContainer || !firstRow || !results || !emptyResults || !resultList) return;

    let catalogReady = false;
    let nextRowId = 2;
    const maximumDisciplines = 10;

    const updateRowCount = () => {
        const rows = [...rowsContainer.querySelectorAll('[data-discipline-row]')];
        rows.forEach((row, index) => {
            row.querySelector('legend').textContent = `Disciplina ${index + 1}`;
            row.querySelector('.unimatch-discipline__number').textContent = String(index + 1).padStart(2, '0');
            row.querySelector('[data-remove-discipline]').hidden = rows.length === 1;
        });
        addDisciplineButton.disabled = rows.length >= maximumDisciplines;
        if (disciplineStatus) disciplineStatus.textContent = `${rows.length} ${rows.length === 1 ? 'disciplina adicionada' : 'disciplinas adicionadas'}.`;
    };

    const showFormError = (message) => {
        formError.textContent = message;
        formError.hidden = false;
    };

    const clearFormError = () => {
        formError.textContent = '';
        formError.hidden = true;
    };

    const appendText = (parent, tagName, className, text) => {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        element.textContent = text;
        parent.append(element);
        return element;
    };

    const getCurriculumLabel = (curriculum) => {
        const modality = curriculum.modality ? ` · ${curriculum.modality}` : ' · modalidade não indicada na fonte';
        return `${curriculum.program}${modality} · matriz ${curriculum.version}`;
    };

    const loadCatalog = async () => {
        catalogStatus.dataset.state = 'loading';
        try {
            const response = await fetch('/api/unimatch/catalog', { headers: { accept: 'application/json' } });
            const payload = await response.json();
            if (!response.ok || !Array.isArray(payload.curricula) || payload.curricula.length === 0) {
                throw new Error(payload?.error?.message || 'Não foi possível carregar as matrizes públicas.');
            }

            for (const curriculum of payload.curricula) {
                const option = document.createElement('option');
                option.value = curriculum.id;
                option.textContent = getCurriculumLabel(curriculum);
                curriculumSelect.append(option);
            }

            curriculumSelect.disabled = false;
            submitButton.disabled = false;
            catalogReady = true;
            const totalSubjects = payload.curricula.reduce((sum, curriculum) => sum + (Number(curriculum.subjectCount) || 0), 0);
            catalogStatus.textContent = `${payload.curricula.length} matrizes públicas mapeadas, com ${totalSubjects} componentes listados. Os dados disponíveis variam por versão e modalidade.`;
            catalogStatus.dataset.state = 'ready';
        } catch (error) {
            catalogStatus.textContent = `${error.message} Atualize a página para tentar novamente.`;
            catalogStatus.dataset.state = 'error';
        }
    };

    addDisciplineButton?.addEventListener('click', () => {
        const currentRows = rowsContainer.querySelectorAll('[data-discipline-row]').length;
        if (currentRows >= maximumDisciplines) return;

        const row = firstRow.cloneNode(true);
        const rowId = nextRowId;
        nextRowId += 1;
        row.querySelector('input[name="discipline-name"]').id = `discipline-name-${rowId}`;
        row.querySelector('label[for^="discipline-name-"]').htmlFor = `discipline-name-${rowId}`;
        row.querySelector('textarea[name="discipline-description"]').id = `discipline-description-${rowId}`;
        row.querySelector('label[for^="discipline-description-"]').htmlFor = `discipline-description-${rowId}`;
        row.querySelector('input[name="discipline-workload"]').id = `discipline-workload-${rowId}`;
        row.querySelector('label[for^="discipline-workload-"]').htmlFor = `discipline-workload-${rowId}`;
        const workloadHelp = row.querySelector('.unimatch-field--hours .unimatch-field__help');
        workloadHelp.id = `discipline-workload-help-${rowId}`;
        row.querySelector('input[name="discipline-workload"]').setAttribute('aria-describedby', workloadHelp.id);
        row.querySelector('input[name="discipline-name"]').value = '';
        row.querySelector('textarea[name="discipline-description"]').value = '';
        row.querySelector('input[name="discipline-workload"]').value = '';
        row.querySelector('[data-remove-discipline]').hidden = false;
        rowsContainer.append(row);
        updateRowCount();
        row.querySelector('input[name="discipline-name"]').focus();
    });

    rowsContainer.addEventListener('click', (event) => {
        const removeButton = event.target.closest('[data-remove-discipline]');
        if (!removeButton || rowsContainer.querySelectorAll('[data-discipline-row]').length <= 1) return;
        removeButton.closest('[data-discipline-row]').remove();
        updateRowCount();
    });

    form.addEventListener('input', clearFormError);

    const setLoading = (loading) => {
        results.setAttribute('aria-busy', String(loading));
        form.querySelectorAll('input, textarea, select, [data-remove-discipline]').forEach((control) => {
            control.disabled = loading;
        });
        submitButton.disabled = loading || !catalogReady;
        addDisciplineButton.disabled = loading || rowsContainer.querySelectorAll('[data-discipline-row]').length >= maximumDisciplines;
    };

    const addSourceLink = (parent, match) => {
        let sourceUrl;
        try {
            sourceUrl = new URL(match.subject.sourceUrl);
        } catch {
            return appendText(parent, 'span', 'unimatch-match__source', `Matriz ${match.curriculumVersion}`);
        }

        const label = `Fonte oficial UniSales · matriz ${match.curriculumVersion}${match.curriculumModality ? ` · ${match.curriculumModality}` : ' · modalidade não indicada na fonte'}`;
        if (sourceUrl.origin !== 'https://unisales.br') return appendText(parent, 'span', 'unimatch-match__source', label);

        const link = appendText(parent, 'a', 'unimatch-match__source', label);
        link.href = sourceUrl.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        return link;
    };

    const workloadText = (match, analysis) => {
        if (match.workload.status === 'meets_minimum') {
            return 'A carga horária informada atende ao critério publicado de pelo menos 75% da disciplina de destino.';
        }
        if (match.workload.status === 'does_not_meet_minimum') {
            return 'A carga horária informada fica abaixo do critério publicado de 75% da disciplina de destino.';
        }
        if (!analysis.sourceDiscipline.workloadHours) {
            return 'Critério de carga horária não verificado: a matriz de destino não publica a carga individual; consulte a instituição.';
        }
        return 'Critério de carga horária não verificado: a carga horária da disciplina de destino não foi publicada na matriz consultada.';
    };

    const renderMatch = (match, analysis) => {
        const item = document.createElement('article');
        item.className = 'unimatch-match';

        const content = document.createElement('div');
        content.className = 'unimatch-match__content';
        const title = appendText(content, 'h4', 'unimatch-match__title', match.subject.name);
        const sourceLink = addSourceLink(content, match);
        if (sourceLink.tagName === 'A') sourceLink.href = match.subject.sourceUrl;
        item.append(content);

        appendText(item, 'p', 'unimatch-match__score', `Similaridade heurística: ${match.similarity}/100`);
        appendText(item, 'p', 'unimatch-match__reasons', match.reasons.join(' '));
        const workload = appendText(item, 'p', 'unimatch-match__workload', workloadText(match, analysis));
        workload.dataset.status = match.workload.status;
        return item;
    };

    const renderResults = (payload) => {
        resultList.replaceChildren();
        emptyResults.hidden = true;

        const heading = document.createElement('div');
        heading.className = 'unimatch-results__heading';
        appendText(heading, 'h3', '', 'Possíveis conexões encontradas');
        appendText(heading, 'p', '', `${payload.curriculum.program} · matriz ${payload.curriculum.version}${payload.curriculum.modality ? ` · ${payload.curriculum.modality}` : ' · modalidade não indicada na fonte'}`);
        resultList.append(heading);

        for (const analysis of payload.analyses) {
            const group = document.createElement('section');
            group.className = 'unimatch-analysis';
            group.setAttribute('aria-label', `Sugestões para ${analysis.sourceDiscipline.name}`);
            appendText(group, 'h4', 'unimatch-analysis__source', analysis.sourceDiscipline.name);

            if (analysis.matches.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'unimatch-no-matches';
                appendText(empty, 'h5', '', 'Não encontramos sinais suficientes nesta matriz.');
                appendText(empty, 'p', '', 'Isso não descarta uma equivalência. A matriz pública consultada apresenta nomes, não ementas; a análise oficial pode considerar documentos curriculares completos.');
                group.append(empty);
            } else {
                const list = document.createElement('div');
                list.className = 'unimatch-match-list';
                analysis.matches.forEach((match) => list.append(renderMatch({ ...match, curriculumVersion: payload.curriculum.version, curriculumModality: payload.curriculum.modality }, analysis)));
                group.append(list);
            }
            resultList.append(group);
        }

        const newQueryButton = document.createElement('button');
        newQueryButton.type = 'button';
        newQueryButton.className = 'button button-outline button-small unimatch-new-query';
        newQueryButton.textContent = 'Iniciar nova consulta';
        newQueryButton.addEventListener('click', resetForm);
        resultList.append(newQueryButton);
    };

    function resetForm() {
        form.reset();
        rowsContainer.querySelectorAll('[data-discipline-row]').forEach((row) => {
            if (row !== firstRow) row.remove();
        });
        firstRow.querySelector('input[name="discipline-name"]').value = '';
        firstRow.querySelector('textarea[name="discipline-description"]').value = '';
        firstRow.querySelector('input[name="discipline-workload"]').value = '';
        if (!firstRow.isConnected) rowsContainer.prepend(firstRow);
        clearFormError();
        updateRowCount();
        resultList.replaceChildren();
        emptyResults.hidden = false;
        results.setAttribute('aria-busy', 'false');
        results.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'nearest'
        });
        curriculumSelect.focus();
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFormError();
        if (!catalogReady) {
            showFormError('As matrizes ainda não estão disponíveis. Atualize a página e tente novamente.');
            return;
        }
        if (!form.reportValidity()) return;

        const disciplines = [...rowsContainer.querySelectorAll('[data-discipline-row]')].map((row) => {
            const workload = row.querySelector('input[name="discipline-workload"]').value;
            return {
                name: row.querySelector('input[name="discipline-name"]').value.trim(),
                description: row.querySelector('textarea[name="discipline-description"]').value.trim(),
                workloadHours: workload === '' ? null : Number(workload)
            };
        });

        setLoading(true);
        emptyResults.hidden = true;
        resultList.replaceChildren();
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'unimatch-results__loading';
        loadingMessage.textContent = 'Comparando termos e conceitos com a matriz escolhida…';
        resultList.append(loadingMessage);

        try {
            const response = await fetch('/api/unimatch/match', {
                method: 'POST',
                headers: { 'content-type': 'application/json', accept: 'application/json' },
                body: JSON.stringify({ curriculumId: curriculumSelect.value, disciplines })
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload?.error?.message || 'Não foi possível concluir a consulta.');
            renderResults(payload);
        } catch (error) {
            resultList.replaceChildren();
            const errorMessage = document.createElement('div');
            errorMessage.className = 'unimatch-no-matches';
            appendText(errorMessage, 'h3', '', 'A consulta não foi concluída.');
            appendText(errorMessage, 'p', '', `${error.message} Verifique sua conexão e tente novamente.`);
            resultList.append(errorMessage);
        } finally {
            setLoading(false);
            results.setAttribute('aria-busy', 'false');
        }
    });

    updateRowCount();
    loadCatalog();
});
