const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const motionSource = read('Unicheck/landing/js/landing-flow-motion.js');

function createElement(length = 100) {
    const classes = new Set();
    const attributes = new Map();
    return {
        positions: [],
        classList: {
            add(name) { classes.add(name); },
            remove(name) { classes.delete(name); },
            contains(name) { return classes.has(name); }
        },
        setAttribute(name, value) { attributes.set(name, String(value)); },
        getAttribute(name) { return attributes.get(name) ?? null; },
        getTotalLength() { return length; },
        getPointAtLength(position) {
            this.positions.push(position);
            return { x: position, y: 5 };
        }
    };
}

function createMotionHarness({ reduced = false, mobileViewport = false } = {}) {
    const tracks = new Map(['origin', 'portal', 'ava', 'email', 'announcements', 'central', 'organized', 'student']
        .map(name => [name, createElement()]));
    const head = createElement();
    const tail = createElement();
    const targets = new Map();
    const desktopTargets = [
        '.journey-flow__university',
        '.journey-flow__channel:nth-of-type(2)',
        '.journey-flow__channel:nth-of-type(3)',
        '.journey-flow__channel:nth-of-type(4)',
        '.journey-flow__channel:nth-of-type(5)',
        '.journey-flow__unicheck',
        '.journey-flow__outcome:nth-of-type(2)',
        '.journey-flow__student'
    ];
    const mobileTargets = [
        '.journey-flow__mobile-university .journey-flow__mobile-node',
        '.journey-flow__mobile-channels .journey-flow__mobile-node',
        '.journey-flow__mobile-unicheck .journey-flow__mobile-node',
        '.journey-flow__mobile-outcomes .journey-flow__mobile-node',
        '.journey-flow__mobile-student .journey-flow__mobile-node'
    ];
    desktopTargets.forEach(selector => targets.set(selector, createElement()));
    mobileTargets.forEach(selector => targets.set(selector, createElement()));

    const svg = {
        querySelector(selector) {
            if (selector.includes('data-flow-packet="head"')) return head;
            if (selector.includes('data-flow-packet="tail"')) return tail;
            const trackName = selector.match(/data-flow-track="([^"]+)"/)?.[1];
            return tracks.get(trackName) ?? null;
        }
    };
    const desktop = {
        querySelector(selector) {
            return selector === '.journey-flow__routes' ? svg : targets.get(selector) ?? null;
        }
    };
    const mobile = { querySelector: selector => targets.get(selector) ?? null };
    const section = {
        querySelector(selector) {
            if (selector === '.journey-flow__desktop') return desktop;
            if (selector === '.journey-flow__mobile') return mobile;
            return null;
        }
    };
    const mediaListeners = { reduced: [], viewport: [] };
    const reducedQuery = { matches: reduced, addEventListener(_name, callback) { mediaListeners.reduced.push(callback); } };
    const viewportQuery = { matches: mobileViewport, addEventListener(_name, callback) { mediaListeners.viewport.push(callback); } };
    const pendingFrames = new Map();
    const documentListeners = {};
    let nextFrameId = 1;
    let observer;
    let cancelledFrames = 0;
    const observerInstances = [];
    class MockIntersectionObserver {
        constructor(callback) { this.callback = callback; observerInstances.push(this); }
        observe() { observer = this; this.callback([{ isIntersecting: true }]); }
        setVisible(isIntersecting) { this.callback([{ isIntersecting }]); }
    }
    const window = {
        IntersectionObserver: MockIntersectionObserver,
        matchMedia(query) { return query.includes('prefers-reduced-motion') ? reducedQuery : viewportQuery; },
        requestAnimationFrame(callback) {
            const id = nextFrameId++;
            pendingFrames.set(id, callback);
            return id;
        },
        cancelAnimationFrame(id) { if (pendingFrames.delete(id)) cancelledFrames += 1; },
        addEventListener() {}
    };
    const document = {
        hidden: false,
        querySelector: selector => selector === '[data-journey-flow]' ? section : null,
        addEventListener(name, callback) { (documentListeners[name] ||= []).push(callback); }
    };
    vm.runInNewContext(motionSource, { window, document, IntersectionObserver: MockIntersectionObserver });

    return {
        tracks, head, tail, targets, reducedQuery, viewportQuery, mediaListeners,
        pendingFrames, documentListeners, observerInstances,
        get cancelledFrames() { return cancelledFrames; },
        get observer() { return observer; },
        frame(timestamp) {
            const next = pendingFrames.entries().next().value;
            assert.ok(next, 'deve existir um próximo frame');
            pendingFrames.delete(next[0]);
            next[1](timestamp);
        }
    };
}

test('fluxo usa a marca oficial e percorre rotas reais com movimento acessível', () => {
    const html = read('Unicheck/landing/index.html');
    const css = read('Unicheck/landing/css/landing-flow.css');
    const motion = read('Unicheck/landing/js/landing-flow-motion.js');

    assert.equal((html.match(/class="journey-flow__brand-image" src="assets\/images\/logomernor\.png" data-theme-logo="light"/g) || []).length, 2);
    assert.equal((html.match(/class="journey-flow__brand-image" src="assets\/images\/logo\.foto\.png" data-theme-logo="dark"/g) || []).length, 2);
    assert.doesNotMatch(html, /journey-flow__brand-image[^>]+src="\/assets\/brand\/favicon\.svg"/);
    assert.match(css, /\.journey-flow__brand-image\[data-theme-logo="dark"\]\s*\{\s*display:\s*none/s);
    assert.match(css, /:root\[data-theme="dark"\][^{]*\.journey-flow__brand-image\[data-theme-logo="light"\][^{]*\{\s*display:\s*none/s);
    assert.match(css, /:root\[data-theme="dark"\][^{]*\.journey-flow__brand-image\[data-theme-logo="dark"\][^{]*\{\s*display:\s*block/s);
    assert.match(css, /\.journey-flow__mobile-node--brand\s*\{[^}]*overflow:\s*hidden/s);
    assert.match(css, /\.journey-flow__mobile-node--brand \.journey-flow__brand-image\s*\{[^}]*width:\s*104px/s);
    assert.match(html, /data-flow-track="origin"/);
    assert.match(html, /data-flow-track="portal"/);
    assert.match(html, /data-flow-track="ava"/);
    assert.match(html, /data-flow-track="email"/);
    assert.match(html, /data-flow-track="announcements"/);
    assert.match(html, /data-flow-track="organized"/);
    assert.match(html, /data-flow-track="student"/);
    assert.match(html, /data-flow-packet="head"/);
    assert.match(html, /data-flow-packet="tail"/);
    assert.match(html, /js\/landing-flow-motion\.js/);

    assert.match(motion, /getPointAtLength/);
    assert.match(motion, /prefers-reduced-motion:\s*reduce/);
    assert.match(motion, /IntersectionObserver/);
    assert.match(motion, /visibilitychange/);
    assert.match(css, /\.journey-flow__node-detail\s*\{[^}]*white-space:\s*normal/s);
    assert.match(css, /\.journey-flow__is-active/);
});

test('packet principal percorre a geometria dos paths e destaca cada etapa', () => {
    const harness = createMotionHarness();
    harness.frame(100);
    harness.frame(700);

    assert.ok(harness.head.classList.contains('is-visible'));
    assert.equal(harness.head.getAttribute('transform'), 'translate(52.17 5.00)');
    assert.ok(harness.tracks.get('origin').positions.length > 0);
    assert.ok(harness.targets.get('.journey-flow__university').classList.contains('journey-flow__is-active'));
    assert.ok(harness.tail.classList.contains('is-visible'));

    harness.frame(1300);
    assert.ok(harness.targets.get('.journey-flow__channel:nth-of-type(2)').classList.contains('journey-flow__is-active'));
    assert.ok(!harness.targets.get('.journey-flow__university').classList.contains('journey-flow__is-active'));
});

test('reduced motion pausa os packets e no mobile progride por estados estáticos', () => {
    const reduced = createMotionHarness({ reduced: true });
    assert.equal(reduced.pendingFrames.size, 0);

    reduced.reducedQuery.matches = false;
    reduced.mediaListeners.reduced.forEach(listener => listener({ matches: false }));
    assert.equal(reduced.pendingFrames.size, 1);
    reduced.reducedQuery.matches = true;
    reduced.mediaListeners.reduced.forEach(listener => listener({ matches: true }));
    assert.equal(reduced.pendingFrames.size, 0);
    assert.equal(reduced.cancelledFrames, 1);
    assert.ok(!reduced.head.classList.contains('is-visible'));

    const mobile = createMotionHarness({ mobileViewport: true });
    mobile.frame(0);
    mobile.frame(1000);
    assert.ok(mobile.targets.get('.journey-flow__mobile-channels .journey-flow__mobile-node').classList.contains('journey-flow__is-active'));
    assert.ok(!mobile.head.classList.contains('is-visible'));
});

test('o ciclo retorna à Universidade e pausa quando a seção sai da tela', () => {
    const harness = createMotionHarness();
    harness.frame(0);
    harness.frame(10_300);

    assert.ok(harness.targets.get('.journey-flow__university').classList.contains('journey-flow__is-active'));
    assert.ok(harness.head.classList.contains('is-visible'));
    assert.ok(harness.tracks.get('origin').positions.length > 1);

    harness.observer.setVisible(false);
    assert.equal(harness.pendingFrames.size, 0);
    assert.equal(harness.cancelledFrames, 1);
    assert.ok(!harness.head.classList.contains('is-visible'));
});
