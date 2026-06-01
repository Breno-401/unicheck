// Utilitários de estado de página
(function () {
    function setActiveNav() {
        const currentPath = decodeURIComponent(window.location.pathname).replace(/\\/g, '/');
        const navLinks = document.querySelectorAll('.nav-link[href]');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;

            if (currentPath.endsWith(href)) {
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                const parent = link.closest('.nav-item');
                if (parent) {
                    parent.classList.add('active');
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setActiveNav);
    } else {
        setActiveNav();
    }
})();
