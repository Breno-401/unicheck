// Utilitários de estado de página
(function () {
    function setActiveNav() {
        const normalizePath = value => decodeURIComponent(value)
            .replace(/\\/g, '/')
            .replace(/\/index(?:-interno)?\.html$/i, '/')
            .replace(/\/$/, '');
        const currentPath = normalizePath(window.location.pathname);
        const navLinks = document.querySelectorAll('.nav-link[href]');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;

            const targetPath = normalizePath(new URL(href, window.location.href).pathname);
            if (currentPath === targetPath) {
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                const parent = link.closest('.nav-item');
                if (parent) {
                    parent.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setActiveNav);
    } else {
        setActiveNav();
    }
})();
