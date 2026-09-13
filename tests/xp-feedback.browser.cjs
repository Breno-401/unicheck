// Local browser integration: NODE_PATH=private-context/browser/node_modules node tests/xp-feedback.browser.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
    const filename = path.resolve(root, `.${new URL(req.url, 'http://localhost').pathname}`);
    if (!filename.startsWith(root + path.sep)) return res.writeHead(403).end();
    fs.readFile(filename, (error, data) => {
        if (error) return res.writeHead(404).end();
        res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' })[path.extname(filename)] || 'application/octet-stream');
        res.end(data);
    });
});
let browser;
let failures = 0;
let scenarios = 0;
const errors = [];
async function scenario(name, run, options = {}) {
    scenarios++;
    const page = await browser.newPage({ viewport: { width: options.mobile ? 390 : 1366, height: 900 }, reducedMotion: options.reduced ? 'reduce' : 'no-preference' });
    page.on('pageerror', error => errors.push(error.message));
    try {
        await page.route('**/*', route => route.request().url().startsWith(base) || route.request().url().startsWith('data:') ? route.continue() : route.fulfill({ body: '' }));
        await page.goto(`${base}/tests/checklist-player-browser-test.html?xp=1&state=partial&transfer=1`);
        await page.waitForFunction(() => document.querySelector('#browserTestResult').textContent === 'PASS:xp-ready');
        if (options.open) await page.locator('.sidebar').evaluate(el => el.classList.add('open'));
        await page.waitForTimeout(350);
        await page.clock.install();
        await page.evaluate(() => {
            window.xpAnnouncements = [];
            window.xpCards = [];
            new MutationObserver(records => {
                for (const record of records) {
                    for (const node of record.addedNodes) {
                        if (node.nodeType === 1 && node.matches('.xp-reward')) window.xpCards.push(node);
                    }
                }
                const label = document.querySelector('.xp-reward-announcement')?.textContent;
                if (label && window.xpAnnouncements.at(-1) !== label) window.xpAnnouncements.push(label);
            }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-label'] });
        });
        await run(page);
        console.log(`PASS ${name}`);
    } catch (error) {
        failures++;
        console.error(`FAIL ${name}: ${error.message}`);
    } finally { await page.close(); }
}
const advance = (page, ms) => page.clock.runFor(ms);
const emit = (page, from = 2, to = 3) => page.evaluate(({ from, to }) => {
    const calculate = window.UniCheckProgression.calculateFromCounts;
    dispatchEvent(new CustomEvent('unicheck:progression-updated', { detail: {
        previousProgression: calculate({ completedTasks: from }), progression: calculate({ completedTasks: to }), gainedXp: (to - from) * 10
    } }));
}, { from, to });
const xp = page => page.locator('[data-progression-xp]').textContent();
async function assertFlight(page, selector) {
    const result = await page.evaluate(selector => {
        const particle = document.querySelector('.xp-energy-particle');
        const target = document.querySelector(selector);
        const animation = particle?.getAnimations()[0];
        if (!animation || !target) return null;
        const frames = animation.effect.getKeyframes();
        const matrix = new DOMMatrix(frames.at(-1).transform);
        const rect = target.getBoundingClientRect();
        return { x: matrix.m41, y: matrix.m42, rect: rect.toJSON(), keys: Object.keys(frames[0]), pointer: getComputedStyle(particle).pointerEvents };
    }, selector);
    assert.ok(result, 'early transfer must have a live particle and destination');
    assert.ok(result.x >= result.rect.left && result.x <= result.rect.right && result.y >= result.rect.top && result.y <= result.rect.bottom, 'flight must arrive inside the visible destination');
    assert.deepEqual(result.keys.filter(key => !['offset', 'computedOffset', 'easing', 'composite', 'transform', 'opacity'].includes(key)), [], 'flight animates only transform/opacity');
    assert.equal(result.pointer, 'none');
}
let base;
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
    const executablePath = process.env.CHECKLIST_BROWSER_EXECUTABLE || [chromium.executablePath(), 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
    browser = await chromium.launch({ headless: true, executablePath });
    await scenario('normal XP starts early, arrives with pulse/count-up/bar, ends near 1.7s', async page => {
        await emit(page);
        assert.match(await page.locator('.xp-reward').textContent(), /\+10 XP/);
        await advance(page, 180);
        assert.equal(await xp(page), '20 / 100 XP', 'count-up waits for arrival');
        await advance(page, 170);
        await assertFlight(page, '.sidebar-progress-track');
        await advance(page, 550);
        assert.equal(await page.locator('.is-xp-receiving').count(), 1, 'destination pulses on arrival');
        const intermediate = parseInt(await xp(page), 10);
        assert.ok(intermediate > 20 && intermediate < 30, 'counter interpolates on arrival');
        const width = await page.locator('[data-progression-fill]').evaluate(el => {
            // Playwright's JS clock does not advance the compositor's CSS clock.
            // Seek the real transition to verify rendered interpolation independently.
            const transition = el.getAnimations().find(animation => animation.transitionProperty === 'width');
            if (!transition) return null;
            transition.pause();
            transition.currentTime = 120;
            return el.getBoundingClientRect().width / el.parentElement.getBoundingClientRect().width * 100;
        });
        assert.ok(width > 20 && width < 30, `bar progresses smoothly on arrival (observed ${width}%)`);
        await advance(page, 550);
        assert.equal(await xp(page), '30 / 100 XP');
        assert.equal(await page.locator('.xp-reward').count(), 1, 'reward remains readable before dismissal');
        await advance(page, 400);
        assert.equal(await page.locator('.xp-reward, .xp-energy-particle').count(), 0);
        assert.equal(await page.evaluate(() => xpAnnouncements.length), 1, 'single XP announcement');
    });
    await scenario('destination resolves collapsed sidebar at flight time', async page => {
        await emit(page);
        await page.locator('.sidebar').evaluate(el => el.classList.add('collapsed'));
        await advance(page, 350);
        await assertFlight(page, '.sidebar-level-indicator');
        await advance(page, 550);
        assert.notEqual(await page.locator('.sidebar-level-indicator').evaluate(el => getComputedStyle(el).animationName), 'none');
    });
    await scenario('mobile closed drawer receives temporary viewport progress', async page => {
        await emit(page);
        await advance(page, 350);
        await assertFlight(page, '.xp-mobile-indicator .sidebar-progress-track');
        await advance(page, 1050);
        assert.match(await page.locator('.xp-mobile-indicator').textContent(), /30 \/ 100 XP/);
        await advance(page, 450);
        assert.equal(await page.locator('.xp-mobile-indicator').count(), 0);
    }, { mobile: true });
    await scenario('mobile open drawer uses sidebar', async page => {
        await emit(page);
        await advance(page, 350);
        await assertFlight(page, '.sidebar .sidebar-progress-track');
        assert.equal(await page.locator('.xp-mobile-indicator').count(), 0);
    }, { mobile: true, open: true });
    await scenario('burst aggregates immediately and active work has only one pending batch', async page => {
        await emit(page);
        await advance(page, 40);
        await emit(page, 3, 4);
        await advance(page, 150);
        assert.match(await page.locator('.xp-reward').textContent(), /\+20 XP/);
        assert.equal(await page.evaluate(() => xpAnnouncements.length), 1);
        await advance(page, 400);
        await emit(page, 4, 5);
        await emit(page, 5, 6);
        await emit(page, 6, 7);
        assert.equal(await page.locator('.xp-reward').count(), 1);
        await advance(page, 1250);
        assert.match(await page.locator('.xp-reward').textContent(), /\+30 XP/);
        await advance(page, 1800);
        assert.equal(await page.locator('.xp-reward, .xp-energy-particle').count(), 0, 'no stale feedback queue');
        assert.equal(await xp(page), '70 / 100 XP');
        assert.equal(await page.evaluate(() => xpCards.length), 2);
    });
    await scenario('reduced motion updates immediately without flight, scale or repeated status', async page => {
        await emit(page);
        assert.equal(await xp(page), '30 / 100 XP');
        assert.equal(await page.locator('.sidebar-progress-track').getAttribute('aria-valuenow'), '30');
        const rewardProgress = await page.locator('[data-xp-reward-fill]').evaluate(el => el.getBoundingClientRect().width / el.parentElement.getBoundingClientRect().width * 100);
        assert.ok(Math.abs(rewardProgress - 30) < .1, 'reduced motion reward bar updates immediately');
        await advance(page, 350);
        assert.equal(await page.locator('.xp-energy-particle, .is-xp-receiving').count(), 0);
        assert.equal(await page.locator('.xp-reward').evaluate(el => getComputedStyle(el).transform), 'none');
        assert.equal(await page.evaluate(() => xpAnnouncements.length), 1);
        await advance(page, 1500);
        assert.equal(await page.locator('.xp-reward').count(), 0);
    }, { reduced: true });
    await scenario('reduced motion never rewinds latest XP while pending rewards are displayed', async page => {
        await emit(page);
        await advance(page, 350);
        await emit(page, 3, 4);
        await emit(page, 4, 5);
        assert.equal(await xp(page), '50 / 100 XP');
        await page.evaluate(() => {
            const label = document.querySelector('.sidebar [data-progression-xp]');
            const textContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
            window.observedXpValues = [];
            // Preserve real DOM writes, capturing each synchronously before another can replace it.
            Object.defineProperty(label, 'textContent', {
                configurable: true,
                get() { return textContent.get.call(this); },
                set(value) {
                    textContent.set.call(this, value);
                    window.observedXpValues.push(textContent.get.call(this));
                }
            });
        });
        await advance(page, 3400);
        const values = await page.evaluate(() => observedXpValues);
        assert.ok(values.length > 0);
        assert.deepEqual(values.filter(value => value !== '50 / 100 XP'), [], 'finishing an older batch cannot rewind current XP');
    }, { reduced: true });
    await scenario('announcement has one live text message after burst closes', async page => {
        await emit(page);
        await advance(page, 40);
        await emit(page, 3, 4);
        await advance(page, 150);
        const accessible = await page.locator('.xp-reward').ariaSnapshot();
        assert.match(accessible, /20 XP/);
        assert.match(await page.locator('.xp-reward').evaluate(el => [...el.children]
            .filter(child => child.getAttribute('aria-hidden') !== 'true').map(child => child.textContent).join('')), /20 XP/, 'live status contains text, not only a changed accessible name');
    });
    await scenario('collapsed rail retains accessible progress value without generic focus', async page => {
        await page.locator('.sidebar').evaluate(el => el.classList.add('collapsed'));
        await emit(page);
        await advance(page, 1400);
        const progress = page.locator('.sidebar').getByRole('progressbar');
        assert.equal(await progress.count(), 1, 'visible rail exposes progress semantics');
        assert.equal(await progress.getAttribute('aria-valuenow'), '30');
        assert.match(await progress.getAttribute('aria-valuetext'), /30.*100.*XP/);
    });
    for (const event of ['resize', 'pagehide', 'popstate', 'hashchange']) {
        await scenario(`${event} cancels active and pending feedback with final state`, async page => {
            await emit(page);
            await advance(page, 350);
            await emit(page, 3, 4);
            await page.evaluate(event => { dispatchEvent(new Event(event)); dispatchEvent(new Event(event)); }, event);
            assert.equal(await page.locator('.xp-reward, .xp-energy-particle, .xp-mobile-indicator, .is-xp-receiving').count(), 0);
            assert.equal(await xp(page), '40 / 100 XP');
            await advance(page, 4000);
            assert.equal(await xp(page), '40 / 100 XP', 'cancelled callbacks cannot rewind final XP');
            assert.equal(await page.locator('.xp-reward, .xp-energy-particle').count(), 0);
            await emit(page, 4, 5);
            await advance(page, 1850);
            assert.equal(await xp(page), '50 / 100 XP', 'controller remains usable after cleanup');
        });
    }
    await scenario('feedback preserves focus/layout and progressbar provides accessible description', async page => {
        const button = page.locator('[data-action="select-task"]').first();
        await button.focus();
        const before = await page.locator('#browserTestShell').boundingBox();
        assert.equal(await page.locator('.sidebar-profile-progression').getAttribute('tabindex'), null, 'generic wrapper is not a keyboard stop');
        await emit(page);
        await advance(page, 350);
        assert.deepEqual(await page.locator('#browserTestShell').boundingBox(), before);
        assert.equal(await button.evaluate(el => el === document.activeElement), true);
        assert.equal(await page.locator('.xp-reward-region').evaluate(el => getComputedStyle(el).pointerEvents), 'none');
        await advance(page, 1000);
        assert.match(await page.locator('.sidebar-progress-track').getAttribute('aria-valuetext'), /30.*100.*XP/);
    });
    assert.deepEqual(errors, []);
    if (failures) process.exitCode = 1;
    console.log(`${scenarios - failures}/${scenarios} XP browser scenarios passed`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); server.close(); });
