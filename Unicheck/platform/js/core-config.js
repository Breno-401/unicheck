// Configurações e utilitários compartilhados da plataforma
(function () {
    const STORAGE_KEYS = {
        THEME: 'theme',
        SIDEBAR_COLLAPSED: 'sidebarCollapsed',
        USER_PROFILE: 'userProfile'
    };

    const ROUTES = {
        LANDING: '../landing/index.html',
        PLATFORMS: 'PLATAFORMAS/plataformas-gratuitas.html'
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
