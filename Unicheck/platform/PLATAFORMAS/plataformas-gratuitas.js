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

const platformIconMap = {
    jetbrains: 'code-2',
    spotify: 'music',
    azure: 'cloud',
    canva: 'palette',
    github: 'github',
    notion: 'notebook-pen',
    coursera: 'graduation-cap',
    adobe: 'pen-tool',
    google: 'folder',
    gemini: 'sparkles',
    perplexity: 'search',
    figma: 'pen-tool',
    discord: 'messages-square',
    aws: 'cloud',
    mongodb: 'database',
    trello: 'layout-grid',
    zoom: 'video',
    stackoverflow: 'message-circle',
    microsoft365: 'monitor',
    miro: 'workflow',
    slack: 'messages-square',
    replit: 'terminal',
    vscode: 'code-2',
    vercel: 'rocket',
    netlify: 'rocket',
    oraclecloud: 'server',
    freecodecamp: 'book-check',
    edx: 'book-open',
    khanacademy: 'school',
    duolingo: 'languages',
    grammarly: 'book-check',
    copilot: 'sparkles',
    youtubemusic: 'music',
    applemusic: 'music',
    postman: 'send',
    overleaf: 'file-text',
    asana: 'clipboard-list',
    figjam: 'pen-tool',
    dropbox: 'cloud',
    skillshare: 'graduation-cap',
    outlook: 'mail'
};

const platformLogoMap = {
    jetbrains: '../img-interno/jetbrains-logo.png',
    spotify: '../img-interno/spotify-logo.png',
    azure: '../img-interno/azure-logo.png',
    canva: '../img-interno/canva_logo.png',
    github: '../img-interno/github_logo.png',
    notion: '../img-interno/notion_logo.png',
    coursera: '../img-interno/coursera_logo.png',
    adobe: '../img-interno/adobe_logo.png',
    google: '../img-interno/google_workspace_logo.png',
    gemini: '../img-interno/gemini_logo_3.png',
    perplexity: '../img-interno/perplexity_logo_2.png',
    figma: '../img-interno/figma_logo_2.png',
    discord: '../img-interno/discord_logo_5.jpg',
    aws: '../img-interno/aws_logo_2.png',
    mongodb: '../img-interno/mongodb_logo_1.png',
    trello: '../img-interno/trello_logo_8.png',
    zoom: '../img-interno/zoom_logo_2.jpg',
    stackoverflow: '../img-interno/stackoverflow_logo_6.png',
    microsoft365: '../img-interno/MicrosoftT.png',
    outlook: '../img-interno/outlook.png'
};

const platformTypeLabels = {
    free: 'Grátis',
    discount: 'Desconto',
    premium: 'Premium'
};

const platformCategoryLabels = {
    productivity: 'Produtividade',
    design: 'Design',
    development: 'Desenvolvimento',
    education: 'Educação',
    cloud: 'Cloud',
    music: 'Música'
};

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
        },
        {
            id: 'microsoft365',
            name: 'Microsoft 365 Education',
            category: 'productivity',
            type: 'free',
            url: 'https://www.microsoft.com/education/products/microsoft-365',
            tutorialUrl: '#',
            description: 'Pacote educacional com Word, Excel, PowerPoint, OneDrive e Teams para instituições e estudantes.',
            features: ['Word e Excel', 'OneDrive', 'Microsoft Teams'],
            originalPrice: 'Plano comercial',
            studentPrice: 'Grátis para educação',
            discount: '100% Gratuito',
            logo: ''
        },
        {
            id: 'miro',
            name: 'Miro Education',
            category: 'productivity',
            type: 'free',
            url: 'https://miro.com/education/',
            tutorialUrl: '#',
            description: 'Quadro colaborativo para mapas mentais, brainstorming e planejamento de projetos acadêmicos.',
            features: ['Quadro infinito', 'Colaboração', 'Templates visuais'],
            originalPrice: 'Plano pago',
            studentPrice: 'Grátis para estudantes',
            discount: '100% Gratuito',
            logo: ''
        },
        {
            id: 'slack',
            name: 'Slack for Education',
            category: 'productivity',
            type: 'free',
            url: 'https://slack.com/help/articles/360000768047-Slack-for-Education',
            tutorialUrl: '#',
            description: 'Comunicação organizada para grupos de pesquisa, monitorias e projetos em equipe.',
            features: ['Canais por tema', 'Arquivos', 'Integrações'],
            originalPrice: 'Plano pago',
            studentPrice: 'Grátis para educação',
            discount: '100% Gratuito',
            logo: ''
        },
        {
            id: 'replit',
            name: 'Replit',
            category: 'development',
            type: 'free',
            url: 'https://replit.com/',
            tutorialUrl: '#',
            description: 'Ambiente online para programar, testar e compartilhar projetos sem configuração local.',
            features: ['IDE no navegador', 'Hospedagem', 'Colaboração'],
            originalPrice: 'Plano pago',
            studentPrice: 'Plano gratuito disponível',
            discount: 'Freemium',
            logo: ''
        },
        {
            id: 'vscode',
            name: 'Visual Studio Code',
            category: 'development',
            type: 'free',
            url: 'https://code.visualstudio.com/',
            tutorialUrl: '#',
            description: 'Editor de código leve e extensível para desenvolvimento web, mobile e backend.',
            features: ['Extensões', 'Git integrado', 'Depuração'],
            originalPrice: 'Grátis',
            studentPrice: 'Grátis',
            discount: '100% Gratuito',
            logo: ''
        },
        {
            id: 'vercel',
            name: 'Vercel',
            category: 'development',
            type: 'free',
            url: 'https://vercel.com/',
            tutorialUrl: '#',
            description: 'Plataforma de deploy para front-end, projetos Jamstack e aplicações modernas.',
            features: ['Deploy rápido', 'Preview URLs', 'Integração Git'],
            originalPrice: 'Plano pago',
            studentPrice: 'Plano gratuito disponível',
            discount: 'Freemium',
            logo: ''
        },
        {
            id: 'netlify',
            name: 'Netlify',
            category: 'development',
            type: 'free',
            url: 'https://www.netlify.com/',
            tutorialUrl: '#',
            description: 'Hospedagem e automação de deploy para sites estáticos e front-end moderno.',
            features: ['Deploy contínuo', 'Forms', 'Edge Functions'],
            originalPrice: 'Plano pago',
            studentPrice: 'Plano gratuito disponível',
            discount: 'Freemium',
            logo: ''
        },
        {
            id: 'oraclecloud',
            name: 'Oracle Cloud Always Free',
            category: 'cloud',
            type: 'free',
            url: 'https://www.oracle.com/cloud/free/',
            tutorialUrl: '#',
            description: 'Infraestrutura em nuvem com camada gratuita permanente para testes, labs e projetos.',
            features: ['VMs gratuitas', 'Banco de dados', 'Armazenamento'],
            originalPrice: 'Pago por uso',
            studentPrice: 'Camada gratuita permanente',
            discount: 'Always Free',
            logo: ''
        },
        {
            id: 'freecodecamp',
            name: 'freeCodeCamp',
            category: 'development',
            type: 'free',
            url: 'https://www.freecodecamp.org/',
            tutorialUrl: '#',
            description: 'Plataforma gratuita com currículos práticos e projetos para aprender programação.',
            features: ['Certificações', 'Projetos', 'Comunidade'],
            originalPrice: 'Grátis',
            studentPrice: 'Grátis',
            discount: '100% Gratuito',
            logo: ''
        },
        {
            id: 'edx',
            name: 'edX',
            category: 'education',
            type: 'free',
            url: 'https://www.edx.org/',
            tutorialUrl: '#',
            description: 'Cursos de universidades e instituições com opção de acesso gratuito ao conteúdo.',
            features: ['Cursos acadêmicos', 'Certificados opcionais', 'Universidades'],
            originalPrice: 'Certificado pago',
            studentPrice: 'Audit gratuito disponível',
            discount: 'Freemium',
            logo: ''
        },
        {
            id: 'khanacademy',
            name: 'Khan Academy',
            category: 'education',
            type: 'free',
            url: 'https://www.khanacademy.org/',
            tutorialUrl: '#',
            description: 'Aprendizado gratuito com aulas, exercícios e trilhas em diversas áreas.',
            features: ['Vídeo-aulas', 'Exercícios', 'Trilhas guiadas'],
            originalPrice: 'Grátis',
            studentPrice: 'Grátis',
            discount: '100% Gratuito',
            logo: ''
        },
        {
            id: 'duolingo',
            name: 'Duolingo for Schools',
            category: 'education',
            type: 'free',
            url: 'https://schools.duolingo.com/',
            tutorialUrl: '#',
            description: 'Plataforma de idiomas com recursos para aulas, acompanhamento e prática diária.',
            features: ['Idiomas', 'Turmas', 'Gamificação'],
            originalPrice: 'Grátis',
            studentPrice: 'Grátis para escolas',
            discount: '100% Gratuito',
            logo: ''
        },
        {
            id: 'grammarly',
            name: 'Grammarly Education',
            category: 'productivity',
            type: 'discount',
            url: 'https://www.grammarly.com/edu',
            tutorialUrl: '#',
            description: 'Assistente de escrita para revisar textos acadêmicos, e-mails e relatórios.',
            features: ['Revisão de texto', 'Tom de escrita', 'Sugestões'],
            originalPrice: 'Plano premium',
            studentPrice: 'Plano educacional disponível',
            discount: 'Desconto Educacional',
            logo: ''
        },
        {
            id: 'copilot',
            name: 'Microsoft Copilot',
            category: 'productivity',
            type: 'free',
            url: 'https://copilot.microsoft.com/',
            tutorialUrl: '#',
            description: 'Assistente de IA para apoiar estudos, escrita, resumo e produtividade geral.',
            features: ['IA generativa', 'Resumo', 'Pesquisa'],
            originalPrice: 'Plano pago',
            studentPrice: 'Plano gratuito disponível',
            discount: 'Freemium',
            logo: ''
        },
        {
            id: 'postman',
            name: 'Postman',
            category: 'development',
            type: 'free',
            url: 'https://www.postman.com/',
            tutorialUrl: '#',
            description: 'Ferramenta para testar APIs, organizar coleções e colaborar em projetos de backend.',
            features: ['Testes de API', 'Coleções', 'Documentação'],
            originalPrice: 'Plano pago',
            studentPrice: 'Plano gratuito disponível',
            discount: 'Freemium',
            logo: ''
        },
        {
            id: 'overleaf',
            name: 'Overleaf',
            category: 'education',
            type: 'free',
            url: 'https://www.overleaf.com/',
            tutorialUrl: '#',
            description: 'Editor colaborativo de LaTeX para artigos, TCCs e materiais acadêmicos.',
            features: ['LaTeX online', 'Colaboração', 'Modelos acadêmicos'],
            originalPrice: 'Plano pago',
            studentPrice: 'Plano gratuito disponível',
            discount: 'Freemium',
            logo: ''
        },
        {
            id: 'asana',
            name: 'Asana for Education',
            category: 'productivity',
            type: 'free',
            url: 'https://asana.com/education',
            tutorialUrl: '#',
            description: 'Gestão de tarefas e projetos para equipes de estudo, TCC e trabalhos em grupo.',
            features: ['Kanban', 'Tarefas', 'Cronogramas'],
            originalPrice: 'Plano pago',
            studentPrice: 'Grátis para educação',
            discount: '100% Gratuito',
            logo: ''
        },
        {
            id: 'figjam',
            name: 'FigJam for Education',
            category: 'design',
            type: 'free',
            url: 'https://www.figma.com/figjam/',
            tutorialUrl: '#',
            description: 'Quadro colaborativo para brainstorming, fluxos e ideação visual em equipe.',
            features: ['Brainstorming', 'Fluxos', 'Colaboração'],
            originalPrice: 'Plano pago',
            studentPrice: 'Plano educacional disponível',
            discount: 'Desconto Educacional',
            logo: ''
        },
        {
            id: 'dropbox',
            name: 'Dropbox Education',
            category: 'cloud',
            type: 'free',
            url: 'https://www.dropbox.com/education',
            tutorialUrl: '#',
            description: 'Armazenamento e sincronização de arquivos para estudos, portfólios e trabalhos.',
            features: ['Backup', 'Compartilhamento', 'Sincronização'],
            originalPrice: 'Plano pago',
            studentPrice: 'Plano gratuito disponível',
            discount: 'Freemium',
            logo: ''
        },
        {
            id: 'skillshare',
            name: 'Skillshare Student',
            category: 'education',
            type: 'discount',
            url: 'https://www.skillshare.com/',
            tutorialUrl: '#',
            description: 'Cursos práticos de design, criatividade, negócios e tecnologia para estudantes.',
            features: ['Cursos criativos', 'Projetos práticos', 'Comunidade'],
            originalPrice: 'Plano premium',
            studentPrice: 'Desconto estudantil',
            discount: 'Desconto Educacional',
            logo: ''
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
    const platformIcon = getPlatformIcon(platform);
    const categoryClass = getPlatformCategoryClass(platform.category);

    const card = document.createElement('div');
    card.className = `platform-card ${platform.type} ${categoryClass}`;
    card.setAttribute('data-category', platform.category);
    card.setAttribute('data-favorite', isFavorite);

    const logoHtml = createPlatformMedia(platform, platformIcon, categoryClass);

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
            <button type="button" class="favorite-btn ${isFavorite ? 'active' : ''}" data-platform="${platform.id}" aria-pressed="${isFavorite}" aria-label="${isFavorite ? `Remover ${platform.name} dos favoritos` : `Adicionar ${platform.name} aos favoritos`}" title="${isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                <i data-lucide="${isFavorite ? 'bookmark-check' : 'bookmark'}" class="favorite-icon"></i>
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
        </div>
    `;

    return card;
}

/**
 * Cria o bloco visual do card com ícone padronizado
 */
function createPlatformMedia(platform, icon, categoryClass) {
    const logoPath = platform.logo || platformLogoMap[platform.id];

    if (logoPath) {
        return `<img src="${logoPath}" alt="${platform.name}" class="platform-logo">`;
    }

    return `<div class="platform-logo-placeholder ${categoryClass}" aria-hidden="true">
        <i data-lucide="${icon}"></i>
    </div>`;
}

function getPlatformIcon(platform) {
    return platform.icon || platformIconMap[platform.id] || getCategoryIcon(platform.category);
}



function getCategoryIcon(category) {
    const icons = {
        productivity: 'file-text',
        design: 'palette',
        development: 'code-2',
        education: 'graduation-cap',
        cloud: 'cloud',
        music: 'music'
    };

    return icons[category] || 'monitor';
}

function getPlatformCategoryClass(category) {
    return category === 'design' ? 'design' :
        category === 'education' ? 'education' :
        category === 'development' ? 'development' :
        category === 'productivity' ? 'productivity' :
        category === 'cloud' ? 'cloud' :
        category === 'music' ? 'music' : '';
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
    const isFavorite = index === -1;
    
    if (index > -1) {
        // Remover dos favoritos
        platformState.favorites.splice(index, 1);
        button.classList.remove('active');
        if (icon) {
            icon.setAttribute('data-lucide', 'bookmark');
        }
        showToast('Removido dos favoritos', 'info');
    } else {
        // Adicionar aos favoritos
        platformState.favorites.push(platformId);
        button.classList.add('active');
        if (icon) {
            icon.setAttribute('data-lucide', 'bookmark-check');
        }
        showToast('Adicionado aos favoritos', 'success');
    }

    button.setAttribute('aria-pressed', String(isFavorite));
    const platform = platformState.platforms.find(item => item.id === platformId);
    const platformName = platform?.name || 'plataforma';
    button.setAttribute('aria-label', isFavorite
        ? `Remover ${platformName} dos favoritos`
        : `Adicionar ${platformName} aos favoritos`);
    button.setAttribute('title', isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    
    // Salvar no localStorage
    writeStoredList('platformFavorites', platformState.favorites);
    window.UniCheckActivity?.record?.(getCurrentUserStorageSuffix(), {
        type: isFavorite ? 'platform_favorited' : 'platform_unfavorited',
        title: isFavorite
            ? `Favoritou "${platformName}"`
            : `Removeu "${platformName}" dos favoritos`,
        context: 'Plataformas gratuitas'
    });
    
    // Animação no botão
    button.classList.remove('favorite-pop');
    void button.offsetWidth;
    button.classList.add('favorite-pop');
    setTimeout(() => {
        button.classList.remove('favorite-pop');
    }, 280);
    
    // Re-inicializar ícones para atualizar o ícone do favorito
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


