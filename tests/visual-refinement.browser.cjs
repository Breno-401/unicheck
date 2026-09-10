/* Real Edge/Chromium layout and image events, with synthetic Auth/profile.
 * Install: npm install --prefix private-context/browser playwright
 * Run: node tests/visual-refinement.browser.cjs
 * No production account or Supabase request is used. Screenshots stay ignored.
 */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(require.resolve('playwright', { paths: [path.join(__dirname, '../private-context/browser')] }));
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'private-context/browser-qa');
fs.mkdirSync(output, { recursive: true });
const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(path.join(root, 'Unicheck') + path.sep)) { res.writeHead(403); return res.end(); }
    try {
        res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' })[path.extname(file)] || 'application/octet-stream');
        res.end(fs.readFileSync(file));
    } catch { res.writeHead(404); res.end(); }
});
(async () => {
    let browser;
    const results = [], errors = [];
    try {
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        const origin = `http://127.0.0.1:${server.address().port}`;
        browser = await chromium.launch({ channel: 'msedge', headless: true });
        const context = await browser.newContext();
        const fixture = { id: 'visual-fixture', nome: 'Aluno Exemplo', email: 'aluno@example.test', foto_url: null, avatarText: 'AE' };
        await context.route('**/js/core/config.js', route => route.fulfill({ contentType: 'text/javascript', body: 'window.UniCheckConfig={STORAGE_KEYS:{USER_PROFILE:"userProfile"}};window.UniCheckSupabase={client:null};' }));
        await context.route('**/js/core/auth.js', route => route.fulfill({ contentType: 'text/javascript', body: 'window.UniCheckAuth={getSession:async()=>({user:{id:"visual-fixture"}}),requireAuth:async()=>({user:{id:"visual-fixture"}})};' }));
        await context.route('**/js/services/profile.js', route => route.fulfill({ contentType: 'text/javascript', body: `window.UniCheckProfile={getMyProfile:async()=>{const profile=JSON.parse(localStorage.getItem('userProfile')||'null')||${JSON.stringify(fixture)};localStorage.setItem('userProfile',JSON.stringify(profile));window.dispatchEvent(new CustomEvent('unicheck:profile-updated',{detail:{profile}}));return profile;}};` }));
        // Network services remain inert; render with the real catalog and progression logic.
        await context.route('**/js/services/checklist.js', route => route.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(path.join(root, 'Unicheck/js/services/checklist.js'), 'utf8') + '\nwindow.UniCheckChecklist.fetchUserProgressMap=async()=>window.UniCheckChecklist.readCachedProgress("visual-fixture");window.UniCheckChecklist.flushPendingProgress=async()=>{};' }));
        const page = await context.newPage();
        page.on('pageerror', error => errors.push(error.message));
        const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        for (const view of ['manual-aluno', 'checklist-academico']) {
            await page.goto(origin + `/Unicheck/platform/pages/${view}/${view}.html`);
            await page.locator(view === 'manual-aluno' ? '.manual-category' : '.platform-logo').first().waitFor();
            if (view === 'checklist-academico') {
                // The summary follows the canonical phase state, including its endpoints.
                for (const completed of [0, 7, 3]) {
                    await page.evaluate(completed => {
                        const progress = {};
                        window.UniCheckChecklistData.getChecklists().slice(0, completed).forEach(c => { progress[c.id] = { tasks: Object.fromEntries(c.tasks.map(t => [t.id, true])) }; });
                        window.UniCheckChecklist.writeCachedProgress('visual-fixture', progress);
                    }, completed);
                    await page.reload();
                    await page.locator('.platform-logo').first().waitFor();
                    assert.equal(await page.locator('.journey-progress').getAttribute('value'), String(completed));
                    assert.equal(await page.locator('.journey-progress').getAttribute('max'), '7');
                    assert.equal(await page.locator('.journey-progress').getAttribute('aria-valuetext'), `${completed} de 7 fases concluídas`);
                    assert.match(await page.locator('.journey-current').textContent(), completed === 7 ? /Todas as fases concluídas/ : new RegExp(`Agora: Fase ${completed + 1}`));
                }
                assert.match(await page.locator('.journey-status').textContent(), /3\s+concluídas\s+1\s+ativa\s+3\s+bloqueadas/);
                assert.match(await page.locator('.journey-current').textContent(), /Biblioteca Virtual/);
                await page.locator('.header-search-enhanced .search-input').fill('TOTVS');
                const filteredCount = await page.locator('.platform-card').count();
                assert.ok(filteredCount > 0 && filteredCount < 7);
                assert.equal(await page.locator('.journey-progress').getAttribute('max'), '7');
                assert.equal(await page.locator('.journey-progress').getAttribute('value'), '3');
                await page.locator('.header-search-enhanced .search-input').fill('');
                await page.locator('.platform-logo').evaluateAll(images => Promise.all(images.map(image => image.decode())));
            }
            for (const theme of ['light', 'dark']) for (const width of [1920, 1600, 1440, 1366, 1280, 1024, 768, 390]) {
                await page.setViewportSize({ width, height: 768 });
                await page.evaluate(theme => { document.documentElement.dataset.theme = theme; document.body.dataset.theme = theme; }, theme);
                await settle();
                const violations = await page.evaluate(view => {
                    const failures = [];
                    if (document.documentElement.scrollWidth > innerWidth + 1) failures.push('document overflow');
                    const selectors = view === 'manual-aluno' ? '.manual-category, .manual-quick-links a, .manual-search-box' : '.checklist-journey, .journey-current, .journey-status > span, .platform-logo';
                    const elements = [...document.querySelectorAll(selectors)];
                    for (const element of elements) {
                        const rect = element.getBoundingClientRect();
                        if (rect.left < -1 || rect.right > innerWidth + 1 || element.scrollWidth > element.clientWidth + 1) failures.push('element overflow: ' + element.className);
                        if (element.matches('.journey-status > span')) {
                            const range = document.createRange(); range.selectNodeContents(element);
                            const text = range.getBoundingClientRect();
                            if (text.left < rect.left || text.right > rect.right || text.bottom > rect.bottom) failures.push('badge text clipped');
                            for (const sibling of element.parentElement.children) {
                                if (sibling === element) continue;
                                const other = sibling.getBoundingClientRect();
                                if (rect.left < other.right && rect.right > other.left && rect.top < other.bottom && rect.bottom > other.top) failures.push('badges overlap');
                            }
                        }
                        if (element.matches('.platform-logo')) {
                            const css = getComputedStyle(element);
                            if (!element.naturalWidth || css.objectFit !== 'contain' || css.flexShrink !== '0') failures.push('logo cropped or deformed');
                            if (element.naturalWidth / element.naturalHeight > 1.6 && rect.width <= rect.height) failures.push('horizontal logo compressed into square');
                        }
                    }
                    return failures;
                }, view);
                assert.deepEqual(violations, [], `${view} ${theme} ${width}`);
                const summaryHeight = view === 'checklist-academico' ? await page.locator('.checklist-journey').evaluate(el => el.getBoundingClientRect().height) : null;
                results.push({ view, theme, width, violations, summaryHeight });
                if (view === 'checklist-academico' && [1366, 768, 390].includes(width)) await page.screenshot({ path: path.join(output, `journey-${theme}-${width}.png`) });
                if ([1366, 390].includes(width)) await page.screenshot({ path: path.join(output, `refinement-${view}-${theme}-${width}.png`), fullPage: true });
            }
            if (view === 'manual-aluno') {
                await page.locator('#manualSearch').focus();
                await page.keyboard.type('boleto');
                await page.locator('.manual-result-card').first().waitFor();
                await page.locator('[data-category="vida-academica"]').click();
                assert.equal(await page.locator('[data-category="vida-academica"]').getAttribute('aria-pressed'), 'true');
                await page.locator('#manualSearch').focus();
                assert.notEqual(await page.locator('#manualSearch').evaluate(el => getComputedStyle(el).outlineStyle), 'none');
                await page.locator('#manualSearch').fill('zzzzzzzz');
                await page.locator('#manualEmpty').waitFor();
                await page.locator('#resetManualFilters').click();
                await page.locator('.manual-category').first().focus();
                await page.keyboard.press('Enter');
                await page.locator('.manual-result-card').first().waitFor();
                assert.equal(await page.locator('.manual-filter.is-active').getAttribute('aria-pressed'), 'true');
            }
        }
        assert.deepEqual(errors, []);
        fs.writeFileSync(path.join(output, 'refinement-results.json'), JSON.stringify({ results, errors, limitation: 'Local Edge with synthetic auth/profile/progress; no production services.' }, null, 2));
        console.log(`PASS: ${results.length} responsive checks, journey 0/7 + 3/7 + 7/7, current phase, search-independent totals, status geometry, logos and keyboard navigation.`);
    } finally { await browser?.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
