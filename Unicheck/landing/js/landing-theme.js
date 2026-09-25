(() => {
    const preferenceKey = 'unicheck.landing.theme';
    const root = document.documentElement;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const mediaQuery = typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;
    let toggle;

    const readPreference = () => {
        try {
            const saved = window.localStorage.getItem(preferenceKey);
            return saved === 'light' || saved === 'dark' ? saved : null;
        } catch {
            return null;
        }
    };

    let hasUserPreference = readPreference() !== null;

    const updateToggle = theme => {
        if (!toggle) return;
        const nextAction = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
        toggle.setAttribute('aria-pressed', String(theme === 'dark'));
        toggle.setAttribute('aria-label', nextAction);
        toggle.setAttribute('title', nextAction);
    };

    const applyTheme = theme => {
        root.dataset.theme = theme;
        if (themeColor) themeColor.content = theme === 'dark' ? '#0b1f22' : '#f7faf9';
        updateToggle(theme);
    };

    applyTheme(readPreference() || (mediaQuery?.matches ? 'dark' : 'light'));

    const followSystemPreference = event => {
        if (!hasUserPreference) applyTheme(event.matches ? 'dark' : 'light');
    };

    if (mediaQuery?.addEventListener) {
        mediaQuery.addEventListener('change', followSystemPreference);
    } else if (mediaQuery?.addListener) {
        mediaQuery.addListener(followSystemPreference);
    }

    const initializeToggle = () => {
        toggle = document.querySelector('[data-theme-toggle]');
        updateToggle(root.dataset.theme || 'light');
        if (!toggle) return;

        toggle.addEventListener('click', () => {
            const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
            hasUserPreference = true;
            applyTheme(nextTheme);
            try {
                window.localStorage.setItem(preferenceKey, nextTheme);
            } catch {
                // A blocked preference store should not block the in-page toggle.
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeToggle, { once: true });
    } else {
        initializeToggle();
    }
})();
