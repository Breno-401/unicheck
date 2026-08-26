// Configurações e utilitários compartilhados da plataforma
(function () {
    const STORAGE_KEYS = {
        THEME: 'theme',
        SIDEBAR_COLLAPSED: 'sidebarCollapsed',
        USER_PROFILE: 'userProfile'
    };

    const ROUTES = {
        LANDING: '../landing/index.html',
        MANUAL: 'pages/manual-aluno/manual-aluno.html',
        PLATFORMS: 'pages/beneficios-estudantis/beneficios-estudantis.html',
        HELP: 'pages/ajuda-suporte/ajuda-suporte.html'
    };

    function normalizePath(pathname) {
        return decodeURIComponent(pathname).replace(/\\/g, '/');
    }

    window.UniCheckConfig = {
        STORAGE_KEYS,
        ROUTES,
        normalizePath
    };
})();
