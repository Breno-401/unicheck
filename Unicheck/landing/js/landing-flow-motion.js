(() => {
    const section = document.querySelector('[data-journey-flow]');
    if (!section) return;

    const desktop = section.querySelector('.journey-flow__desktop');
    const mobile = section.querySelector('.journey-flow__mobile');
    const svg = desktop?.querySelector('.journey-flow__routes');
    const head = svg?.querySelector('[data-flow-packet="head"]');
    const tail = svg?.querySelector('[data-flow-packet="tail"]');
    if (!desktop || !mobile || !svg || !head || !tail) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileViewport = window.matchMedia('(max-width: 799px)');
    const desktopSteps = [
        { track: 'origin', target: '.journey-flow__university', duration: 1.15 },
        { track: 'portal', target: '.journey-flow__channel:nth-of-type(2)', duration: 1.25 },
        { track: 'ava', target: '.journey-flow__channel:nth-of-type(3)', duration: .95 },
        { track: 'email', target: '.journey-flow__channel:nth-of-type(4)', duration: 1.25 },
        { track: 'announcements', target: '.journey-flow__channel:nth-of-type(5)', duration: .95 },
        { track: 'central', target: '.journey-flow__unicheck', duration: 1.15 },
        { track: 'organized', target: '.journey-flow__outcome:nth-of-type(2)', duration: 1.7 },
        { track: 'student', target: '.journey-flow__student', duration: .9 }
    ].map(step => {
        const path = svg.querySelector(`[data-flow-track="${step.track}"]`);
        return path?.getTotalLength ? { ...step, path, length: path.getTotalLength() } : null;
    }).filter(Boolean);

    const mobileSteps = [
        { target: '.journey-flow__mobile-university .journey-flow__mobile-node', duration: .75 },
        { target: '.journey-flow__mobile-channels .journey-flow__mobile-node', duration: 1.35 },
        { target: '.journey-flow__mobile-unicheck .journey-flow__mobile-node', duration: 1 },
        { target: '.journey-flow__mobile-outcomes .journey-flow__mobile-node', duration: 1.1 },
        { target: '.journey-flow__mobile-student .journey-flow__mobile-node', duration: .75 }
    ].map(step => ({ ...step, element: mobile.querySelector(step.target) })).filter(step => step.element);

    const withTimeline = steps => {
        let cursor = 0;
        return steps.map(step => {
            const timedStep = { ...step, start: cursor };
            cursor += step.duration;
            return timedStep;
        });
    };

    const desktopTimeline = withTimeline(desktopSteps);
    const mobileTimeline = withTimeline(mobileSteps);
    const desktopCycle = desktopTimeline.reduce((end, step) => Math.max(end, step.start + step.duration), 0) + .9;
    const mobileCycle = mobileTimeline.reduce((end, step) => Math.max(end, step.start + step.duration), 0) + .85;
    let sectionVisible = !('IntersectionObserver' in window);
    let frameId = null;
    let startedAt = null;
    let activeKey = null;
    let activeElements = [];

    const clearActive = () => {
        activeElements.forEach(element => element.classList.remove('journey-flow__is-active'));
        activeElements = [];
        activeKey = null;
    };

    const hidePackets = () => {
        head.classList.remove('is-visible');
        tail.classList.remove('is-visible');
    };

    const setActive = (key, elements) => {
        if (key === activeKey) return;
        clearActive();
        activeKey = key;
        activeElements = elements.filter(Boolean);
        activeElements.forEach(element => element.classList.add('journey-flow__is-active'));
    };

    const findStep = (timeline, cycle, elapsed) => {
        const time = elapsed % cycle;
        const step = timeline.find(candidate => time >= candidate.start && time < candidate.start + candidate.duration);
        return step ? { step, progress: (time - step.start) / step.duration } : null;
    };

    const placePacket = (packet, path, pathLength, progress, visible) => {
        if (!visible || progress < 0 || progress >= 1) {
            packet.classList.remove('is-visible');
            return;
        }

        const point = path.getPointAtLength(pathLength * progress);
        packet.setAttribute('transform', `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
        packet.classList.add('is-visible');
    };

    const tick = timestamp => {
        frameId = null;
        if (reducedMotion.matches || document.hidden || !sectionVisible) {
            clearActive();
            hidePackets();
            startedAt = null;
            return;
        }

        if (startedAt === null) startedAt = timestamp;
        const elapsed = (timestamp - startedAt) / 1000;

        if (mobileViewport.matches) {
            hidePackets();
            const current = findStep(mobileTimeline, mobileCycle, elapsed);
            if (current) setActive(`mobile-${current.step.target}`, [current.step.element]);
            else clearActive();
        } else {
            const current = findStep(desktopTimeline, desktopCycle, elapsed);
            if (current) {
                const target = desktop.querySelector(current.step.target);
                setActive(`desktop-${current.step.track}`, [target]);
                placePacket(head, current.step.path, current.step.length, current.progress, true);
                placePacket(tail, current.step.path, current.step.length, current.progress - .2, true);
            } else {
                clearActive();
                hidePackets();
            }
        }

        frameId = window.requestAnimationFrame(tick);
    };

    const canAnimate = () => !reducedMotion.matches && !document.hidden && sectionVisible;
    const syncAnimation = () => {
        if (!canAnimate()) {
            if (frameId !== null) window.cancelAnimationFrame(frameId);
            frameId = null;
            startedAt = null;
            clearActive();
            hidePackets();
            return;
        }

        if (frameId === null) frameId = window.requestAnimationFrame(tick);
    };

    const observeMedia = query => {
        if (query.addEventListener) query.addEventListener('change', syncAnimation);
        else query.addListener?.(syncAnimation);
    };

    observeMedia(reducedMotion);
    observeMedia(mobileViewport);
    window.addEventListener('resize', () => {
        startedAt = null;
        clearActive();
        hidePackets();
        syncAnimation();
    }, { passive: true });
    document.addEventListener('visibilitychange', syncAnimation);

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            sectionVisible = entries.some(entry => entry.isIntersecting);
            syncAnimation();
        }, { threshold: .08 });
        observer.observe(section);
    }

    syncAnimation();
})();
