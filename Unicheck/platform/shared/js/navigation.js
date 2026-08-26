(function () {
    function navigateDirectly(url) {
        window.location.href = url;
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
                navigateDirectly(link.href);
            }
        }

        if (action === 'navigate-platforms') {
            event.preventDefault();
            navigateDirectly('pages/beneficios-estudantis/beneficios-estudantis.html');
        }
    }

    document.addEventListener('click', handleClick);
})();
