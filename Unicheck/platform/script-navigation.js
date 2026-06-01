// Navegação com tela de loading
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

    function handleClick(event) {
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
        }

        if (action === 'navigate-platforms') {
            event.preventDefault();
            showLoadingAndNavigate('PLATAFORMAS/plataformas-gratuitas.html');
        }
    }

    document.addEventListener('click', handleClick);
})();
