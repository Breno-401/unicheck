// Apply the existing local preference before the first paint on every internal page.
(function () {
    try {
        document.documentElement.classList.toggle('sidebar-is-collapsed',
            !window.matchMedia('(max-width: 1024px)').matches && localStorage.getItem('sidebarCollapsed') === 'true');
    } catch (error) { /* Default to the expanded navigation when storage is blocked. */ }
})();
