document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('[data-header]');
    const toggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.navigation');
    const navLinks = document.querySelectorAll('.navigation a');

    const closeMenu = () => {
        if (!toggle || !navigation) return;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menu de navegação');
        navigation.classList.remove('is-open');
        document.body.classList.remove('menu-open');
    };

    if (toggle && navigation) {
        toggle.addEventListener('click', () => {
            const open = toggle.getAttribute('aria-expanded') !== 'true';
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
            navigation.classList.toggle('is-open', open);
            document.body.classList.toggle('menu-open', open);
        });

        navLinks.forEach(link => link.addEventListener('click', closeMenu));
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closeMenu();
                toggle.focus();
            }
        });
        document.addEventListener('click', event => {
            if (navigation.classList.contains('is-open') && !navigation.contains(event.target) && !toggle.contains(event.target)) closeMenu();
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 900) closeMenu();
        });
    }

    const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    document.querySelectorAll('.faq-item button').forEach(button => {
        button.addEventListener('click', () => {
            const item = button.closest('.faq-item');
            const isOpen = button.getAttribute('aria-expanded') === 'true';
            document.querySelectorAll('.faq-item').forEach(entry => {
                entry.classList.remove('is-open');
                entry.querySelector('button')?.setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                item.classList.add('is-open');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });

    const year = document.getElementById('current-year');
    if (year) year.textContent = new Date().getFullYear();
});
