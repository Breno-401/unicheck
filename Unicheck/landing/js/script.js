document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('.menu');
    const menuToggle = document.querySelector('.menu-toggle');
    const navPanel = document.querySelector('.nav-panel');
    const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    const revealSections = document.querySelectorAll('.reveal-section');
    let lastScroll = 0;

    if (menu && menuToggle && navPanel) {
        const closeMenu = () => {
            menu.classList.remove('menu-open');
            document.body.classList.remove('menu-open');
            menuToggle.setAttribute('aria-expanded', 'false');
        };

        menuToggle.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('menu-open');
            document.body.classList.toggle('menu-open', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });
    }

    if (menu) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            const scrollLimit = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = scrollLimit > 0 ? (currentScroll / scrollLimit) * 100 : 0;

            document.documentElement.style.setProperty('--scroll-progress', `${scrollProgress}%`);

            menu.classList.toggle('is-solid', currentScroll > 24);

            if (currentScroll <= 0) {
                menu.classList.remove('hide');
                lastScroll = 0;
                return;
            }

            if (currentScroll > lastScroll && currentScroll > 160) {
                menu.classList.add('hide');
            } else {
                menu.classList.remove('hide');
            }

            lastScroll = currentScroll;
        });

        window.dispatchEvent(new Event('scroll'));
    }

    if (revealSections.length > 0) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, {
            threshold: 0.16,
            rootMargin: '0px 0px -10% 0px'
        });

        revealSections.forEach(section => revealObserver.observe(section));
    }

    if (navLinks.length > 0 && sections.length > 0) {
        const setActiveLink = id => {
            navLinks.forEach(link => {
                const isActive = link.getAttribute('href') === `#${id}`;
                link.classList.toggle('is-active', isActive);
                if (isActive) {
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        };

        const sectionObserver = new IntersectionObserver(entries => {
            const visibleEntries = entries.filter(entry => entry.isIntersecting);
            if (visibleEntries.length === 0) return;

            visibleEntries.sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio);

            const currentSection = visibleEntries[0].target.getAttribute('id');
            if (currentSection) {
                setActiveLink(currentSection);
            }
        }, {
            threshold: [0.3, 0.5, 0.7],
            rootMargin: '-25% 0px -45% 0px'
        });

        sections.forEach(section => sectionObserver.observe(section));
    }

    const container = document.querySelector('.carousel-grid-container');
    const btnPrev = document.querySelector('.prev-button');
    const btnNext = document.querySelector('.next-button');
    const cards = Array.from(document.querySelectorAll('.carousel-card'));

    if (container && cards.length > 0) {
        let currentIndex = 0;

        function getVisibleCards() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1100) return 2;
            return 3;
        }

        function updateCarousel() {
            const visibleCards = getVisibleCards();
            const maxIndex = Math.max(0, cards.length - visibleCards);
            const card = cards[0];
            const style = window.getComputedStyle(container);
            const gap = parseFloat(style.columnGap || style.gap || '0');
            const cardWidth = card.getBoundingClientRect().width;

            if (currentIndex > maxIndex) {
                currentIndex = maxIndex;
            }

            const offset = currentIndex * (cardWidth + gap);
            container.style.transform = `translateX(-${offset}px)`;

            if (btnPrev) {
                btnPrev.disabled = currentIndex === 0;
            }

            if (btnNext) {
                btnNext.disabled = currentIndex >= maxIndex;
            }
        }

        if (btnNext) {
            btnNext.addEventListener('click', () => {
                const maxIndex = Math.max(0, cards.length - getVisibleCards());
                currentIndex = Math.min(currentIndex + 1, maxIndex);
                updateCarousel();
            });
        }

        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                currentIndex = Math.max(currentIndex - 1, 0);
                updateCarousel();
            });
        }

        window.addEventListener('resize', updateCarousel);
        updateCarousel();
    }

    const counters = document.querySelectorAll('.alunos-contador');
    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting || entry.target.dataset.animated === 'true') return;

                const counter = entry.target;
                const finalValue = parseInt(counter.textContent.replace(/\./g, ''), 10);
                if (Number.isNaN(finalValue)) return;

                const duration = 1500;
                const startTime = performance.now();
                counter.dataset.animated = 'true';

                const animate = currentTime => {
                    const progress = Math.min((currentTime - startTime) / duration, 1);
                    const currentValue = Math.floor(finalValue * progress);
                    counter.textContent = currentValue.toLocaleString('pt-BR');

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        counter.textContent = finalValue.toLocaleString('pt-BR');
                    }
                };

                requestAnimationFrame(animate);
            });
        }, {
            threshold: 0.6
        });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            faqItems.forEach(entry => {
                entry.classList.remove('active');
                const button = entry.querySelector('.faq-question');
                if (button) {
                    button.setAttribute('aria-expanded', 'false');
                }
            });

            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    const currentYear = document.getElementById('current-year');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    const contactForms = document.querySelectorAll('.formulario-faq, .newsletter-form');
    contactForms.forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault();
            const feedback = form.querySelector('.form-feedback');
            if (feedback) {
                feedback.textContent = form.classList.contains('newsletter-form')
                    ? 'Cadastro recebido. Em breve voce recebera novidades.'
                    : 'Mensagem recebida. Retornaremos pelo e-mail informado.';
            }
            form.reset();
        });
    });
});
