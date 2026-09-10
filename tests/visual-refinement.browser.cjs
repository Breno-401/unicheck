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
        const url = origin + '/Unicheck/platform/pages/manual-aluno/manual-aluno.html';
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
                await page.evaluate(() => {
                    const progress = {};
                    window.UniCheckChecklistData.getChecklists().slice(0, 3).forEach(c => { progress[c.id] = { tasks: Object.fromEntries(c.tasks.map(t => [t.id, true])) }; });
                    window.UniCheckChecklist.writeCachedProgress('visual-fixture', progress);
                });
                await page.reload();
                await page.locator('.platform-logo').first().waitFor();
                assert.match(await page.locator('.checklists-header-stats').textContent(), /3\s+concluídos\s+1\s+ativo\s+3\s+bloqueados/);
                await page.locator('.platform-logo').evaluateAll(images => Promise.all(images.map(image => image.decode())));
            }
            for (const theme of ['light', 'dark']) for (const width of [1920, 1600, 1440, 1366, 1280, 1024, 768, 390]) {
                await page.setViewportSize({ width, height: 900 });
                await page.evaluate(theme => { document.documentElement.dataset.theme = theme; document.body.dataset.theme = theme; }, theme);
                await settle();
                const violations = await page.evaluate(view => {
                    const failures = [];
                    if (document.documentElement.scrollWidth > innerWidth + 1) failures.push('document overflow');
                    const selectors = view === 'manual-aluno' ? '.manual-category, .manual-quick-links a, .manual-search-box' : '.checklists-header-stats > span, .platform-logo';
                    const elements = [...document.querySelectorAll(selectors)];
                    for (const element of elements) {
                        const rect = element.getBoundingClientRect();
                        if (rect.left < -1 || rect.right > innerWidth + 1 || element.scrollWidth > element.clientWidth + 1) failures.push('element overflow: ' + element.className);
                        if (element.matches('.checklists-header-stats > span')) {
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
                            if (!element.naturalWidth || css.objectFit !== 'contain' || css.flexShrink !== '0' || Math.abs(rect.width - rect.height) > 1) failures.push('logo cropped or deformed');
                        }
                    }
                    return failures;
                }, view);
                assert.deepEqual(violations, [], `${view} ${theme} ${width}`);
                results.push({ view, theme, width, violations });
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
        console.log(`PASS: ${results.length} responsive checks, badge geometry, logo containment, search, empty state, active filter and keyboard navigation.`);
    } finally { await browser?.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
