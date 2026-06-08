/**
 * PLATAFORMAS GRATUITAS - JavaScript
 * Sistema de listagem de plataformas gratuitas para estudantes
 */

// Estado da aplicação
function getCurrentUserStorageSuffix() {
    try {
        const profileKey = window.UniCheckConfig?.STORAGE_KEYS?.USER_PROFILE || 'userProfile';
        const rawProfile = localStorage.getItem(profileKey);
        if (!rawProfile) return 'anonymous';

        const profile = JSON.parse(rawProfile);
        return profile?.id || 'anonymous';
    } catch (error) {
        return 'anonymous';
    }
}

function getPlatformStorageKey(baseKey) {
    return `${baseKey}:${getCurrentUserStorageSuffix()}`;
}

function readStoredList(baseKey) {
    try {
        const raw = localStorage.getItem(getPlatformStorageKey(baseKey));
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        return [];
    }
}

function writeStoredList(baseKey, value) {
    localStorage.setItem(getPlatformStorageKey(baseKey), JSON.stringify(value));
}

const platformState = {
    platforms: [
        {
            id: 'jetbrains',
            name: 'JetBrains Student Pack',
            category: 'development',
            type: 'free',
            url: 'https://www.jetbrains.com/community/education/',
            tutorialUrl: '#',
            description: 'Suite completa de IDEs para estudantes. Inclui IntelliJ IDEA, PyCharm, WebStorm e mais.',
            features: ['IDE Avançadas', 'Suporte 24/7', 'Plugins Inclusos'],
            originalPrice: 'R$ 45,90/mês',
            studentPrice: 'Grátis para estudantes',
            discount: '100% Gratuito',
            logo: '../img-interno/jetbrains-logo.png'
        },
        {
            id: 'spotify',
            name: 'Spotify Student',
            category: 'music',
            type: 'free',
            url: 'https://www.spotify.com/student/',
            tutorialUrl: '#',
            description: 'Streaming de música premium com desconto exclusivo para estudantes universitários.',
            features: ['Sem Anúncios', 'Baixa Qualidade', 'Controle Offline'],
            originalPrice: 'R$ 21,90/mês',
            studentPrice: 'R$ 10,95/mês',
            discount: '50% Desconto',
            logo: '../img-interno/spotify-logo.png'
        },
        {
            id: 'azure',
            name: 'Microsoft Azure for Students',
            category: 'cloud',
            type: 'free',
            url: 'https://azure.microsoft.com/en-us/free/students/',
            tutorialUrl: '#',
            description: 'Plataforma de nuvem com $100 em créditos gratuitos e acesso a serviços de IA e machine learning.',
            features: ['$100 Grátis', 'Serviços IA', 'Machine Learning'],
            originalPrice: 'Pago por uso',
            studentPrice: '$100 créditos gratuitos',
            discount: '$100 Créditos',
            logo: '../img-interno/azure-logo.png'
        },
        {
            id: 'canva',
            name: 'Canva for Education',
            category: 'design',
            type: 'free',
            url: 'https://www.canva.com/education/',
            tutorialUrl: '#',
            description: 'Ferramenta de design gráfico com recursos premium gratuitos para educadores e estudantes.',
            features: ['Templates Premium', 'Biblioteca Extensa', 'Colaboração'],
            originalPrice: 'R$ 34,90/mês',
            studentPrice: 'Grátis para educadores',
            discount: '100% Gratuito',
            logo: '../img-interno/canva_logo.png'
        },
        {
            id: 'github',
            name: 'GitHub Student Pack',
            category: 'development',
            type: 'free',
            url: 'https://education.github.com/pack',
            tutorialUrl: '#',
            description: 'Mais de 100 ferramentas gratuitas para desenvolvedores estudantes. Inclui hosting, domains e muito mais.',
            features: ['Repo Privados Ilimitados', 'GitHub Actions', 'Domain Grátis'],
            originalPrice: 'Diversos serviços',
            studentPrice: 'Tudo incluído gratuitamente',
            discount: '100% Gratuito',
            logo: '../img-interno/github_logo.png'
        },
        {
            id: 'notion',
            name: 'Notion for Students',
            category: 'productivity',
            type: 'free',
            url: 'https://www.notion.so/product/students',
            tutorialUrl: '#',
            description: 'Workspace tudo-em-um para estudos, projetos e organização pessoal. Perfect para acadêmicos.',
            features: ['Workspace Ilimitado', 'Colaboração', 'Templates Acadêmicos'],
            originalPrice: 'R$ 15,00/mês',
            studentPrice: 'Grátis para estudantes',
            discount: '100% Gratuito',
            logo: '../img-interno/notion_logo.png'
        },
        {
            id: 'coursera',
            name: 'Coursera Plus',
            category: 'education',
            type: 'discount',
            url: 'https://www.coursera.org/courseraplus',
            tutorialUrl: '#',
            description: 'Acesso ilimitado a mais de 7.000 cursos das melhores universidades e empresas do mundo.',
            features: ['Certificados', 'Certificações Profissionais', 'Programas Completos'],
            originalPrice: 'R$ 329,00/mês',
            studentPrice: 'R$ 115,15/mês',
            discount: '65% Desconto',
            logo: '../img-interno/coursera_logo.png'
        },
        {
            id: 'adobe',
            name: 'Adobe Creative Cloud Student',
            category: 'design',
            type: 'discount',
            url: 'https://www.adobe.com/creativecloud/student.html',
            tutorialUrl: '#',
            description: 'Suite completa de aplicações criativas com desconto exclusivo para estudantes. Photoshop, Illustrator e mais.',
            features: ['20+ Apps', '100GB Cloud', 'Fontes Adobe'],
            originalPrice: 'R$ 89,90/mês',
            studentPrice: 'R$ 35,96/mês',
            discount: '60% Desconto',
            logo: '../img-interno/adobe_logo.png'
        },
        {
            id: 'google',
            name: 'Google Workspace for Education',
            category: 'productivity',
            type: 'free',
            url: 'https://edu.google.com/workspace-for-education/',
            tutorialUrl: '#',
            description: 'Ferramentas de produtividade do Google com recursos expandidos para instituições educacionais.',
            features: ['Gmail Ilimitado', 'Drive 100GB', 'Meet 300 participantes'],
            originalPrice: 'Variado por instituição',
            studentPrice: 'Grátis para escolas',
            discount: '100% Gratuito',
            logo: '../img-interno/google_workspace_logo.png'
        },
        // NOVAS PLATAFORMAS ADICIONADAS
        {
            id: 'gemini',
            name: 'Google Gemini AI',
            category: 'productivity',
            type: 'free',
            url: 'https://gemini.google.com/',
            tutorialUrl: '#',
            description: 'Assistente de IA avançado do Google com acesso gratuito para estudantes. Ideal para pesquisas e estudos.',
            features: ['IA Avançada', 'Integração Google', 'Grátis para Estudantes'],
            originalPrice: 'Grátis',
            studentPrice: 'Grátis',
            discount: '100% Gratuito',
            logo: '../img-interno/gemini_logo_3.png'
        },
        {
            id: 'perplexity',
            name: 'Perplexity AI',
            category: 'productivity',
            type: 'free',
            url: 'https://www.perplexity.ai/',
            tutorialUrl: '#',
            description: 'Motor de busca com IA que fornece respostas precisas com fontes. Perfeito para pesquisas acadêmicas.',
            features: ['Busca com IA', 'Fontes Citadas', 'Pesquisa Acadêmica'],
            originalPrice: 'R$ 40,00/mês (Pro)',
            studentPrice: 'Grátis (5 buscas/dia)',
            discount: 'Freemium',
            logo: '../img-interno/perplexity_logo_2.png'
        },
        {
            id: 'figma',
            name: 'Figma for Education',
            category: 'design',
            type: 'free',
            url: 'https://www.figma.com/education/',
            tutorialUrl: '#',
            description: 'Ferramenta de design colaborativo com recursos premium gratuitos para estudantes.',
            features: ['Design Colaborativo', 'Componentes Ilimitados', 'Handoff para Devs'],
            originalPrice: 'R$ 50,00/mês',
            studentPrice: 'Grátis para estudantes',
            discount: '100% Gratuito',
            logo: '../img-interno/figma_logo_2.png'
        },
        {
            id: 'discord',
            name: 'Discord Student',
            category: 'productivity',
            type: 'free',
            url: 'https://discord.com/',
            tutorialUrl: '#',
            description: 'Plataforma de comunicação para comunidades estudantis e projetos acadêmicos.',
            features: ['Comunidades', 'Voz e Vídeo', 'Integração Estudantil'],
            originalPrice: 'Nitro: R$ 35,90/mês',
            studentPrice: 'Grátis + Nitro 35% OFF',
            discount: 'Grátis + 35% OFF Nitro',
            logo: '../img-interno/discord_logo_5.jpg'
        },
        {
            id: 'aws',
            name: 'AWS Student Credits',
            category: 'cloud',
            type: 'free',
            url: 'https://aws.amazon.com/education/awseducate/',
            tutorialUrl: '#',
            description: 'Créditos em nuvem AWS para estudantes com $100 em créditos anuais.',
            features: ['$100 Créditos/ano', 'Serviços Cloud', 'Machine Learning'],
            originalPrice: 'Pay-as-you-go',
            studentPrice: '$100 créditos gratuitos',
            discount: 'Créditos Estudantis',
            logo: '../img-interno/aws_logo_2.png'
        },
        {
            id: 'mongodb',
            name: 'MongoDB University',
            category: 'development',
            type: 'free',
            url: 'https://university.mongodb.com/',
            tutorialUrl: '#',
            description: 'Cursos gratuitos de MongoDB e certificações. Ideal para desenvolvedores e DBAs.',
            features: ['Cursos Gratuitos', 'Certificações', 'Documentação Avançada'],
            originalPrice: 'Certificação: $150',
            studentPrice: 'Grátis',
            discount: '100% Gratuito',
            logo: '../img-interno/mongodb_logo_1.png'
        },
        {
            id: 'trello',
            name: 'Trello for Education',
            category: 'productivity',
            type: 'free',
            url: 'https://trello.com/education/',
            tutorialUrl: '#',
            description: 'Ferramenta de gestão de projetos para equipes acadêmicas e grupos de estudo.',
            features: ['Gestão de Projetos', 'Colaboração', 'Kanban Boards'],
            originalPrice: 'R$ 25,00/mês',
            studentPrice: 'Grátis para escolas',
            discount: '100% Gratuito',
            logo: '../img-interno/trello_logo_8.png'
        },
        {
            id: 'zoom',
            name: 'Zoom for Education',
            category: 'productivity',
            type: 'free',
            url: 'https://zoom.us/education',
            tutorialUrl: '#',
            description: 'Plataforma de videoconferência com recursos educativos e aulas online.',
            features: ['Videoconferência', 'Sala de Aula Online', 'Gravação'],
            originalPrice: 'R$ 89,00/mês',
            studentPrice: 'Grátis para instituições',
            discount: '100% Gratuito',
            logo: '../img-interno/zoom_logo_2.jpg'
        },
        {
            id: 'stackoverflow',
            name: 'Stack Overflow for Teams',
            category: 'development',
            type: 'free',
            url: 'https://stackoverflow.co/teams/education/',
            tutorialUrl: '#',
            description: 'Comunidade de desenvolvedores com recursos para grupos de estudo e projetos acadêmicos.',
            features: ['Q&A Técnico', 'Comunidade Global', 'Documentação'],
            originalPrice: 'Team: $240/ano',
            studentPrice: 'Grátis para estudantes',
            discount: '100% Gratuito',
            logo: '../img-interno/stackoverflow_logo_6.png'
        }
    ],
    favorites: readStoredList('platformFavorites'),
    currentFilter: 'all',
    searchTerm: '',
    currentPage: 1,
    itemsPerPage: 12
};

// Elementos do DOM
let platformsGrid, searchInput, filterButtons;
let searchTimeout;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    renderPlatforms();
    setupAnimations();
});

/**
 * Inicializa elementos do DOM
 */
function initializeElements() {
    platformsGrid = document.getElementById('platformsGrid');
    searchInput = document.getElementById('platformSearch');
    
    // Botões de filtro
    filterButtons = document.querySelectorAll('.filter-btn');
}

/**
 * Configura event listeners
 */
function setupEventListeners() {
    // Busca
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Filtros
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilterClick);
    });
    
    // Favoritos
    document.addEventListener('click', handleFavoriteClick);

    // Ações gerais (delegação)
    document.addEventListener('click', handleActionClick);
    document.addEventListener('click', handlePaginationClick);
    
    // Modais
    setupModalListeners();
}

/**
 * Configura animações
 */
function setupAnimations() {
    // Intersection Observer para animações de entrada
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observar cards de plataforma
    setTimeout(() => {
        document.querySelectorAll('.platform-card').forEach(card => {
            observer.observe(card);
        });
    }, 100);
}

/**
 * Renderiza plataformas com base nos filtros
 */
function renderPlatforms() {
    if (!platformsGrid) return;
    
    const filteredPlatforms = getFilteredPlatforms();
    
    // Calcular paginação
    const totalPages = Math.ceil(filteredPlatforms.length / platformState.itemsPerPage);
    const startIndex = (platformState.currentPage - 1) * platformState.itemsPerPage;
    const endIndex = startIndex + platformState.itemsPerPage;
    const currentPlatforms = filteredPlatforms.slice(startIndex, endIndex);
    
    platformsGrid.innerHTML = '';
    
    if (currentPlatforms.length === 0) {
        platformsGrid.innerHTML = createNoResultsMessage();
    } else {
        currentPlatforms.forEach((platform, index) => {
            const platformCard = createPlatformCard(platform);
            platformCard.style.animationDelay = `${index * 0.1}s`;
            platformsGrid.appendChild(platformCard);
        });
    }
    
    // Renderizar paginação
    renderPagination(totalPages, filteredPlatforms.length);
    
    // Re-inicializar ícones Lucide
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    }, 100);
}

/**
 * Renderiza controles de paginação
 */
function renderPagination(totalPages, totalItems) {
    // Remover paginação existente
    const existingPagination = document.querySelector('.platform-pagination');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    if (totalPages <= 1) return;
    
    // Criar contêiner de paginação
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'platform-pagination';
    paginationContainer.innerHTML = `
        <div class="pagination-info">
            Mostrando ${(platformState.currentPage - 1) * platformState.itemsPerPage + 1}-${Math.min(platformState.currentPage * platformState.itemsPerPage, totalItems)} de ${totalItems} plataformas
        </div>
        <div class="pagination-controls">
            <button class="pagination-btn pagination-nav-btn" id="prevPageBtn" ${platformState.currentPage === 1 ? 'disabled' : ''}>
                <i data-lucide="chevron-left"></i>
                <span>Anterior</span>
            </button>
            
            <div class="pagination-numbers">
                ${generatePaginationNumbers(totalPages)}
            </div>
            
            <button class="pagination-btn pagination-nav-btn" id="nextPageBtn" ${platformState.currentPage === totalPages ? 'disabled' : ''}>
                <span>Próxima</span>
                <i data-lucide="chevron-right"></i>
            </button>
        </div>
    `;
    
    // Inserir após o grid de plataformas
    platformsGrid.parentNode.insertBefore(paginationContainer, platformsGrid.nextSibling);
    
    // Configurar event listeners
    setupPaginationListeners(totalPages);
}

/**
 * Gera números de paginação
 */
function generatePaginationNumbers(totalPages) {
    let numbers = '';
    const maxVisiblePages = 5;
    const currentPage = platformState.currentPage;
    
    if (totalPages <= maxVisiblePages) {
        // Mostrar todas as páginas se houver menos que o máximo
        for (let i = 1; i <= totalPages; i++) {
            numbers += `<button class="pagination-number ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
    } else {
        // Lógica para páginas comellipsis
        if (currentPage <= 3) {
            for (let i = 1; i <= 4; i++) {
                numbers += `<button class="pagination-number ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            }
            numbers += '<span class="pagination-ellipsis">...</span>';
            numbers += `<button class="pagination-number" data-page="${totalPages}">${totalPages}</button>`;
        } else if (currentPage >= totalPages - 2) {
            numbers += `<button class="pagination-number" data-page="1">1</button>`;
            numbers += '<span class="pagination-ellipsis">...</span>';
            for (let i = totalPages - 3; i <= totalPages; i++) {
                numbers += `<button class="pagination-number ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            }
        } else {
            numbers += `<button class="pagination-number" data-page="1">1</button>`;
            numbers += '<span class="pagination-ellipsis">...</span>';
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                numbers += `<button class="pagination-number ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            }
            numbers += '<span class="pagination-ellipsis">...</span>';
            numbers += `<button class="pagination-number" data-page="${totalPages}">${totalPages}</button>`;
        }
    }
    
    return numbers;
}

/**
 * Configura event listeners da paginação
 */
function setupPaginationListeners(totalPages) {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (platformState.currentPage > 1) {
                platformState.currentPage--;
                renderPlatforms();
                // Voltar ao topo da página
                setTimeout(() => {
                    scrollToTop();
                }, 100);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (platformState.currentPage < totalPages) {
                platformState.currentPage++;
                renderPlatforms();
                // Voltar ao topo da página
                setTimeout(() => {
                    scrollToTop();
                }, 100);
            }
        });
    }
    
    // Event listener para números de página
    if (platformState.paginationDelegationReady) {
        return;
    }

    platformState.paginationDelegationReady = true;

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('pagination-number')) {
            const page = parseInt(e.target.getAttribute('data-page'));
            if (page) {
                platformState.currentPage = page;
                renderPlatforms();
                // Voltar ao topo da página SEMPRE quando clicar em qualquer número
                setTimeout(() => {
                    scrollToTop();
                }, 100);
            }
        }
    });
}

/**
 * Reset para primeira página
 */
function resetToFirstPage() {
    platformState.currentPage = 1;
}

/**
 * Cria card de plataforma
 */
function createPlatformCard(platform) {
    const isFavorite = platformState.favorites.includes(platform.id);
    
    const card = document.createElement('div');
    card.className = `platform-card ${platform.type}`;
    card.setAttribute('data-category', platform.category);
    card.setAttribute('data-favorite', isFavorite);
    
    const placeholderLogo = createPlaceholderLogo(platform.category);
    const logoHtml = platform.logo && platform.logo.trim() !== ''
        ? `<img src="${platform.logo}" alt="${platform.name}" class="platform-logo platform-logo-image" onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='flex';"><div style="display:none;">${placeholderLogo}</div>`
        : placeholderLogo;
    
    const featuresHtml = platform.features.map(feature => 
        `<span class="feature-tag">${feature}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="card-header">
            ${logoHtml}
            <div class="platform-info">
                <h3 class="platform-title">${platform.name}</h3>
                <span class="discount-badge">${platform.discount}</span>
            </div>
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-platform="${platform.id}">
                <i data-lucide="star" ${isFavorite ? 'style="color: #fbbf24;"' : ''}></i>
            </button>
        </div>
        <div class="card-content">
            <p class="platform-description">${platform.description}</p>
            <div class="features-list">
                ${featuresHtml}
            </div>
            <div class="pricing-info">
                <span class="original-price">${platform.originalPrice}</span>
                <span class="student-price">${platform.studentPrice}</span>
            </div>
        </div>
        <div class="card-actions">
            <button class="btn btn-primary" data-action="open-platform" data-platform="${platform.id}">
                <i data-lucide="external-link"></i>
                Acessar Plataforma
            </button>
            <button class="btn btn-secondary" data-action="open-tutorial" data-platform="${platform.id}">
                <i data-lucide="book-open"></i>
                Tutorial
            </button>
        </div>
    `;
    
    return card;
}

/**
 * Cria placeholder de logo baseado na categoria
 */
function createPlaceholderLogo(category) {
    const icons = {
        productivity: 'file-text',
        design: 'palette',
        development: 'code',
        education: 'graduation-cap',
        cloud: 'cloud',
        music: 'music'
    };
    
    const icon = icons[category] || 'monitor';
    const categoryClass = category === 'design' ? 'design' : 
                         category === 'education' ? 'education' :
                         category === 'development' ? 'development' :
                         category === 'productivity' ? 'productivity' :
                         category === 'cloud' ? 'cloud' :
                         category === 'music' ? 'music' : '';
    
    return `<div class="platform-logo-placeholder ${categoryClass}">
        <i data-lucide="${icon}"></i>
    </div>`;
}

/**
 * Obtém plataformas filtradas
 */
function getFilteredPlatforms() {
    return platformState.platforms.filter(platform => {
        // Filtro por categoria
        const categoryMatch = platformState.currentFilter === 'all' || 
                            platform.category === platformState.currentFilter;
        
        // Filtro por busca
        const searchMatch = !platformState.searchTerm || 
                           platform.name.toLowerCase().includes(platformState.searchTerm.toLowerCase()) ||
                           platform.description.toLowerCase().includes(platformState.searchTerm.toLowerCase()) ||
                           platform.features.some(feature => 
                               feature.toLowerCase().includes(platformState.searchTerm.toLowerCase())
                           );
        
        return categoryMatch && searchMatch;
    });
}

/**
 * Cria mensagem de "nenhum resultado"
 */
function createNoResultsMessage() {
    return `
        <div class="no-results">
            <div class="no-results-icon">
                <i data-lucide="search"></i>
            </div>
            <h3>Nenhuma plataforma encontrada</h3>
            <p>Não encontramos plataformas que correspondam aos seus filtros. Tente ajustar sua busca ou categoria.</p>
            <button class="btn btn-primary" data-action="clear-filters">
                <i data-lucide="filter-x"></i>
                Limpar Filtros
            </button>
        </div>
    `;
}

/**
 * Manipula clique nos filtros
 */
function handleFilterClick(event) {
    const filter = event.target.getAttribute('data-category');
    
    // Atualizar estado
    platformState.currentFilter = filter;
    
    // Atualizar UI dos botões
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    resetToFirstPage();

    // Re-renderizar
    renderPlatforms();
}

/**
 * Manipula busca
 */
function handleSearch(event) {
    platformState.searchTerm = event.target.value;
    resetToFirstPage(); // Voltar para primeira página ao buscar
    
    // Debounce para evitar muitas renderizações
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        renderPlatforms();
    }, 300);
}

/**
 * Manipula clique nos favoritos
 */
function handleFavoriteClick(event) {
    const favoriteBtn = event.target.closest('.favorite-btn');
    if (!favoriteBtn) return;
    
    const platformId = favoriteBtn.getAttribute('data-platform');
    toggleFavorite(platformId, favoriteBtn);
}

/**
 * Manipula ações baseadas em data-action
 */
function handleActionClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const actionElement = target.closest('[data-action]');
    if (!actionElement) return;

    const action = actionElement.getAttribute('data-action');
    const platformId = actionElement.getAttribute('data-platform');

    switch (action) {
        case 'open-platform':
            if (platformId) openPlatform(platformId);
            break;
        case 'open-tutorial':
            if (platformId) openTutorial(platformId);
            break;
        case 'open-suggest':
            openSuggestPlatformModal();
            break;
        case 'submit-suggestion':
            submitSuggestion();
            break;
        case 'clear-filters':
            clearFilters();
            break;
        case 'noop':
            event.preventDefault();
            break;
        default:
            break;
    }
}

/**
 * Alterna favorito
 */
function toggleFavorite(platformId, button) {
    const index = platformState.favorites.indexOf(platformId);
    const icon = button.querySelector('i');
    
    if (index > -1) {
        // Remover dos favoritos
        platformState.favorites.splice(index, 1);
        button.classList.remove('active');
        if (icon) {
            icon.setAttribute('data-lucide', 'star');
            icon.style.color = '';
        }
        showToast('Removido dos favoritos', 'info');
    } else {
        // Adicionar aos favoritos
        platformState.favorites.push(platformId);
        button.classList.add('active');
        if (icon) {
            icon.setAttribute('data-lucide', 'star');
            icon.style.color = '#fbbf24';
        }
        showToast('Adicionado aos favoritos', 'success');
    }
    
    // Salvar no localStorage
    writeStoredList('platformFavorites', platformState.favorites);
    
    // Animação no botão
    button.style.transform = 'scale(1.2)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
    
    // Re-inicializar ícones para atualizar o ícone da estrela
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    }, 250);
}

/**
 * Abre plataforma
 */
function openPlatform(platformId) {
    const platform = platformState.platforms.find(p => p.id === platformId);
    if (!platform) return;
    
    // Analytics (se necessário)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            event_category: 'platform',
            event_label: platform.name
        });
    }
    
    // Abrir em nova aba
    window.open(platform.url, '_blank');
    
    // Feedback visual
    showToast(`Abrindo ${platform.name}...`, 'info');
}

/**
 * Abre tutorial da plataforma
 */
function openTutorial(platformId) {
    const platform = platformState.platforms.find(p => p.id === platformId);
    if (!platform) return;
    
    const modal = document.getElementById('tutorialModal');
    const title = document.getElementById('tutorialTitle');
    const body = document.getElementById('tutorialBody');
    const confirmBtn = document.getElementById('tutorialConfirm');
    
    if (modal && title && body && confirmBtn) {
        // Atualizar conteúdo do modal
        title.textContent = `Tutorial: ${platform.name}`;
        confirmBtn.onclick = () => {
            closeTutorialModal();
            openPlatform(platformId);
        };
        
        // Mostrar modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Re-inicializar ícones
        setTimeout(() => {
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
            }
        }, 100);
        
        // Feedback visual
        showToast(`Tutorial para ${platform.name}`, 'info');
    }
}





/**
 * Configura listeners de modal
 */
function setupModalListeners() {
    const modal = document.getElementById('platformModal');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const modalOverlay = modal.querySelector('.modal-overlay');
    
    // Fechar modal
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // ESC para fechar
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });

    // Modal de sugestão
    const suggestModal = document.getElementById('suggestPlatformModal');
    const suggestModalClose = document.getElementById('suggestModalClose');
    const suggestModalCancel = document.getElementById('suggestModalCancel');
    const suggestModalOverlay = suggestModal.querySelector('.modal-overlay');
    
    suggestModalClose.addEventListener('click', closeSuggestModal);
    suggestModalCancel.addEventListener('click', closeSuggestModal);
    suggestModalOverlay.addEventListener('click', closeSuggestModal);
    
    // ESC para fechar modal de sugestão
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && suggestModal.style.display === 'flex') {
            closeSuggestModal();
        }
    });
    
    // Modal de tutorial
    const tutorialModal = document.getElementById('tutorialModal');
    const tutorialClose = document.getElementById('tutorialClose');
    const tutorialCancel = document.getElementById('tutorialCancel');
    const tutorialOverlay = tutorialModal.querySelector('.modal-overlay');
    
    tutorialClose.addEventListener('click', closeTutorialModal);
    tutorialCancel.addEventListener('click', closeTutorialModal);
    tutorialOverlay.addEventListener('click', closeTutorialModal);
    
    // ESC para fechar modal de tutorial
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && tutorialModal.style.display === 'flex') {
            closeTutorialModal();
        }
    });
}

/**
 * Limpa filtros
 */
function clearFilters() {
    platformState.currentFilter = 'all';
    platformState.searchTerm = '';
    resetToFirstPage();
    
    // Atualizar UI
    filterButtons.forEach(btn => btn.classList.remove('active'));
    const allFilter = document.querySelector('[data-category="all"]');
    if (allFilter) allFilter.classList.add('active');
    
    if (searchInput) {
        searchInput.value = '';
    }
    
    renderPlatforms();
    
    showToast('Filtros limpos', 'info');
}

/**
 * Mostra toast de feedback
 */
function showToast(message, type = 'info') {
    // Remove toast anterior se existir
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i data-lucide="${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animação de entrada
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remover automaticamente após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/**
 * Obtém ícone baseado no tipo de toast
 */
function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        info: 'info',
        warning: 'alert-triangle'
    };
    return icons[type] || 'info';
}

/**
 * Função global para limpar filtros (usada no HTML)
 */
window.clearFilters = clearFilters;

/**
 * Função global para abrir plataforma (usada no HTML)
 */

/**
 * Função global para abrir tutorial (usada no HTML)
 */



/**
 * Função global para abrir modal de sugestão (usada no HTML)
 */

/**
 * Abre modal para sugerir nova plataforma
 */
function openSuggestPlatformModal() {
    const modal = document.getElementById('suggestPlatformModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Envia sugestão de plataforma
 */
function submitSuggestion() {
    const form = document.getElementById('suggestPlatformForm');
    if (!form) return;
    const formData = new FormData(form);
    
    // Validação básica
    if (!formData.get('platformName') || !formData.get('platformUrl') || 
        !formData.get('platformCategory') || !formData.get('platformBenefits')) {
        showToast('Por favor, preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    // Simular envio (em uma aplicação real, aqui seria feita a requisição para o servidor)
    const suggestion = {
        platformName: formData.get('platformName'),
        platformUrl: formData.get('platformUrl'),
        platformCategory: formData.get('platformCategory'),
        platformBenefits: formData.get('platformBenefits'),
        yourName: formData.get('yourName') || 'Anônimo',
        timestamp: new Date().toISOString()
    };
    
    // Salvar no localStorage para demonstração
    let suggestions = readStoredList('platformSuggestions');
    suggestions.push(suggestion);
    writeStoredList('platformSuggestions', suggestions);
    
    // Fechar modal
    closeSuggestModal();
    
    // Feedback
    showToast('Sugestão enviada com sucesso! Obrigado pela contribuição.', 'success');
    
    // Resetar formulário
    form.reset();
}

/**
 * Fecha modal de sugestão
 */
function closeSuggestModal() {
    const modal = document.getElementById('suggestPlatformModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

/**
 * Fecha modal de tutorial
 */
function closeTutorialModal() {
    const modal = document.getElementById('tutorialModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

/**
 * Rola a página para o topo suavemente
 */
function scrollToTop() {
    // Scroll da janela principal
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Scroll do conteúdo principal se existir
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Fallback: scroll imediato se o suave não funcionar
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 300);
}

function handlePaginationClick() {
    // A delegaÃ§Ã£o de paginaÃ§Ã£o principal Ã© configurada em setupPaginationListeners().
}
