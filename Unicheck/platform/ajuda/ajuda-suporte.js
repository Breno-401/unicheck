(function () {
    'use strict';

    const faqItems = [
        { category: 'conta', question: 'Esqueci minha senha. O que faço?', answer: 'A recuperação de senha na tela de acesso ainda não está disponível. Se você ainda estiver conectado, pode definir uma nova senha em Configurações, na seção Segurança. Caso contrário, aguarde a configuração de um canal oficial de suporte nesta página.' },
        { category: 'conta', question: 'Posso usar minha conta em outro computador?', answer: 'Sim. Entre com a mesma conta no outro computador. Seus dados de perfil e o progresso que já tiver sido sincronizado com a conta poderão ser restaurados. Preferências que ficam apenas no navegador, como os favoritos de plataformas nesta versão, não acompanham a troca de dispositivo.' },
        { category: 'conta', question: 'Por que fui enviado novamente para a tela de login?', answer: 'As páginas internas precisam de uma sessão válida. Isso pode acontecer quando não há uma sessão salva, depois de sair da conta ou quando a sessão deixa de ser válida. Entre novamente para continuar.' },
        { category: 'checklist', question: 'Meu progresso não apareceu. O que fazer?', answer: 'Confirme se você entrou com a mesma conta usada anteriormente e aguarde alguns instantes com conexão à internet. O UniCheck mostra primeiro o progresso disponível no dispositivo e depois tenta restaurar o que foi sincronizado com sua conta.' },
        { category: 'checklist', question: 'Meu progresso é salvo automaticamente?', answer: 'Sim. Ao marcar ou desmarcar uma tarefa, a mudança aparece imediatamente e o UniCheck tenta sincronizá-la com sua conta em segundo plano.' },
        { category: 'checklist', question: 'Posso continuar o checklist em outro dispositivo?', answer: 'Sim, desde que você use a mesma conta e as alterações tenham sido sincronizadas. Ao abrir o UniCheck no outro dispositivo, o progresso salvo na conta é restaurado.' },
        { category: 'checklist', question: 'Por que uma fase está bloqueada?', answer: 'As fases seguem uma ordem. A primeira fica disponível desde o início e cada fase seguinte é liberada quando todas as tarefas da fase anterior são concluídas.' },
        { category: 'plataformas', question: 'Como funcionam os favoritos?', answer: 'Use o botão de favorito no card de uma plataforma para adicionar ou remover o item. Os favoritos ficam disponíveis neste navegador e, nesta versão, não são levados automaticamente para outro dispositivo.' },
        { category: 'plataformas', question: 'Como encontro uma plataforma específica?', answer: 'Na página Plataformas Gratuitas, use a busca por nome, descrição ou recurso oferecido. A lista é atualizada de acordo com o texto digitado.' },
        { category: 'plataformas', question: 'Para que servem os filtros?', answer: 'Os filtros reduzem a lista para uma categoria de plataformas. Você pode combinar um filtro com a busca e também limpar os filtros para voltar a visualizar todas.' },
        { category: 'perfil', question: 'Como alterar meu nome?', answer: 'Abra o menu do seu perfil, entre em Configurações, edite o campo Nome Completo e selecione Salvar Alterações.' },
        { category: 'perfil', question: 'Como alterar minha foto?', answer: 'Em Configurações, use Alterar Foto ou o ícone de câmera sobre o avatar, escolha uma imagem e salve as alterações.' },
        { category: 'perfil', question: 'Como alterar minha senha?', answer: 'Abra Configurações, acesse a seção Segurança, informe e confirme a nova senha e selecione Salvar Alterações. A nova senha precisa ter pelo menos oito caracteres.' },
        { category: 'sincronizacao', question: 'O que acontece se minha internet cair?', answer: 'O UniCheck tenta preservar no dispositivo as alterações feitas no checklist. Quando a conexão retorna, tenta sincronizá-las novamente com sua conta.' },
        { category: 'sincronizacao', question: 'O UniCheck salva minhas alterações offline?', answer: 'No checklist, as mudanças aparecem e ficam preservadas neste dispositivo enquanto você está sem conexão. Elas serão enviadas novamente quando houver internet. Alterações ainda não sincronizadas podem ser perdidas se os dados do navegador forem apagados.' },
        { category: 'sincronizacao', question: 'Quando meus dados são sincronizados?', answer: 'O UniCheck tenta sincronizar o progresso em segundo plano depois de uma alteração e também quando o navegador volta a ficar online. Você pode continuar usando o checklist enquanto isso acontece.' }
    ];

    const categoryLabels = {
        conta: 'Conta e acesso', portal: 'Portal Acadêmico', email: 'Email institucional', checklist: 'Checklists',
        plataformas: 'Plataformas Gratuitas', perfil: 'Perfil', sincronizacao: 'Sincronização e progresso', outros: 'Outros problemas'
    };
    const searchInput = document.getElementById('helpSearch');
    const faqList = document.getElementById('faqList');
    const emptyState = document.getElementById('helpEmpty');
    const status = document.getElementById('helpResultsStatus');
    const clearSearch = document.getElementById('clearHelpSearch');
    const clearCategory = document.getElementById('clearCategoryFilter');
    let activeCategory = 'conta';

    function normalize(value) {
        return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    }

    function renderFaq() {
        const term = normalize(searchInput.value);
        const visibleItems = faqItems.filter(item => {
            const inCategory = !activeCategory || item.category === activeCategory;
            const searchable = `${item.question} ${item.answer} ${categoryLabels[item.category]}`;
            return inCategory && (!term || normalize(searchable).includes(term));
        });

        faqList.replaceChildren(...visibleItems.map((item, index) => {
            const article = document.createElement('article');
            article.className = 'faq-item';
            article.dataset.category = item.category;
            const buttonId = `faq-button-${item.category}-${index}`;
            const panelId = `faq-panel-${item.category}-${index}`;
            article.innerHTML = `<button class="faq-question" id="${buttonId}" type="button" aria-expanded="false" aria-controls="${panelId}"><span><small>${categoryLabels[item.category]}</small>${item.question}</span><i data-lucide="chevron-down" aria-hidden="true"></i></button><div class="faq-answer" id="${panelId}" role="region" aria-labelledby="${buttonId}" hidden><p>${item.answer}</p></div>`;
            return article;
        }));

        emptyState.hidden = visibleItems.length !== 0;
        faqList.hidden = visibleItems.length === 0;
        clearSearch.hidden = !searchInput.value;
        clearCategory.hidden = !activeCategory;
        const context = activeCategory ? ` em ${categoryLabels[activeCategory]}` : '';
        status.textContent = `${visibleItems.length} ${visibleItems.length === 1 ? 'resposta encontrada' : 'respostas encontradas'}${context}.`;
        document.querySelectorAll('.help-category').forEach(button => {
            const selected = button.dataset.category === activeCategory;
            button.classList.toggle('is-active', selected);
            button.setAttribute('aria-pressed', String(selected));
            const categoryMatch = !term || normalize(button.textContent).includes(term);
            button.hidden = Boolean(term) && !categoryMatch;
        });
        window.lucide?.createIcons?.();
    }

    function resetFilters() {
        activeCategory = '';
        searchInput.value = '';
        renderFaq();
        searchInput.focus();
    }

    document.getElementById('helpCategories').addEventListener('click', event => {
        const button = event.target.closest('.help-category');
        if (!button) return;
        activeCategory = activeCategory === button.dataset.category ? '' : button.dataset.category;
        renderFaq();
        document.getElementById('faqSection').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });
    faqList.addEventListener('click', event => {
        const button = event.target.closest('.faq-question');
        if (!button) return;
        const panel = document.getElementById(button.getAttribute('aria-controls'));
        const willOpen = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(willOpen));
        panel.hidden = !willOpen;
    });
    searchInput.addEventListener('input', renderFaq);
    clearSearch.addEventListener('click', () => { searchInput.value = ''; renderFaq(); searchInput.focus(); });
    clearCategory.addEventListener('click', () => { activeCategory = ''; renderFaq(); });
    document.getElementById('resetHelpFilters').addEventListener('click', resetFilters);

    function renderContactChannels() {
        const config = window.UniCheckSupportChannels || {};
        const channels = [
            { key: 'email', label: 'Email', icon: 'mail', external: false },
            { key: 'whatsapp', label: 'WhatsApp', icon: 'message-circle', external: true },
            { key: 'institutionalPortal', label: 'Portal institucional', icon: 'building-2', external: true }
        ];
        const container = document.getElementById('helpContactChannels');
        channels.forEach(channel => {
            const value = config[channel.key];
            const isConfigured = Boolean(value?.href && value?.label);
            const element = document.createElement(isConfigured ? 'a' : 'div');
            element.className = `help-contact-card${isConfigured ? ' is-action' : ' is-unavailable'}`;
            if (isConfigured) {
                element.href = value.href;
                if (channel.external) { element.target = '_blank'; element.rel = 'noopener noreferrer'; }
            }
            else { element.setAttribute('aria-disabled', 'true'); }
            element.innerHTML = `<i data-lucide="${channel.icon}" aria-hidden="true"></i><span><strong>${channel.label}</strong><small>${isConfigured ? value.label : 'Canal ainda não configurado'}</small></span>${channel.external && isConfigured ? '<i class="help-contact-action-icon" data-lucide="arrow-up-right" aria-hidden="true"></i>' : ''}`;
            container.appendChild(element);
        });
    }

    renderContactChannels();
    renderFaq();
})();
