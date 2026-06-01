// Lida com loading de navegação e estado ativo da navbar
(function () {
    function showLoadingAndNavigate(url) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }

        setTimeout(() => {
            window.location.href = url;
        }, 500);
    }

    function handleActionClick(event) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        const actionElement = target.closest('[data-action]');
        if (!actionElement) return;

        const action = actionElement.getAttribute('data-action');
        if (action === 'navigate-with-loading') {
            event.preventDefault();
            const link = actionElement.closest('a');
            if (link && link.href) {
                showLoadingAndNavigate(link.href);
            }
            return;
        }

        if (action === 'navigate-platforms') {
            event.preventDefault();
            const route = window.UniCheckConfig?.ROUTES?.PLATFORMS || 'PLATAFORMAS/plataformas-gratuitas.html';
            showLoadingAndNavigate(route);
        }
    }

    function setActiveNavByPath() {
        const normalizePath = window.UniCheckConfig?.normalizePath || (value => value);
        const currentPath = normalizePath(window.location.pathname);
        const navLinks = document.querySelectorAll('.nav-link[href]');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;

            if (currentPath.endsWith(href)) {
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                const parent = link.closest('.nav-item');
                if (parent) parent.classList.add('active');
            }
        });
    }

    function hideLoadingAfterDelay(delayMs) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) return;

        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, delayMs);
    }

    function init() {
        document.addEventListener('click', handleActionClick);
        hideLoadingAfterDelay(1000);
        setActiveNavByPath();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
