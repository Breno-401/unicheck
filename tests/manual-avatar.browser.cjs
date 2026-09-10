/* Real Edge/Chromium layout and image events, with synthetic Auth/profile.
 * Install: npm install --prefix private-context/browser playwright
 * Run: node tests/manual-avatar.browser.cjs
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
        const page = await context.newPage();
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(url);
        await page.locator('.manual-category').first().waitFor();
        const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const check = async (theme, width, view) => {
            await settle();
            const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
            assert.ok(scroll <= width + 1, `${theme} ${width} ${view}: overflow ${scroll}`);
            results.push({ theme, width, view, scroll });
        };
        for (const theme of ['light', 'dark']) for (const width of [1920, 1600, 1440, 1366, 1280, 1024, 768, 390]) {
            await page.setViewportSize({ width, height: 768 });
            await page.evaluate(theme => { document.documentElement.setAttribute('data-theme', theme); document.body.setAttribute('data-theme', theme); }, theme);
            await check(theme, width, 'home');
            if ([1366, 390].includes(width)) await page.screenshot({ path: path.join(output, `home-${theme}-${width}.png`), fullPage: true });
            await page.locator('[data-open-article="rematricula"]').first().click();
            await check(theme, width, 'article');
            const details = page.locator('#manualDetailBody details');
            for (let i = 0; i < await details.count(); i++) await details.nth(i).locator('summary').click();
            await check(theme, width, 'expanded article');
            if ([1366, 390].includes(width)) await page.screenshot({ path: path.join(output, `article-${theme}-${width}.png`), fullPage: true });
            await page.locator('#manualBack').click();
        }
        // Every article, expanded, at the narrowest requested width.
        const ids = await page.evaluate(() => window.UniCheckManualData.articles.map(article => article.id));
        for (const id of ids) {
            await page.evaluate(id => { location.hash = 'conteudo=' + id; }, id);
            await page.waitForFunction(id => document.title.startsWith(window.UniCheckManualData.articles.find(a => a.id === id).title), id);
            await page.locator('#manualDetailBody details').evaluateAll(elements => elements.forEach(element => { element.open = true; }));
            await check('dark', 390, id);
        }
        await page.goto(url);
        await page.setViewportSize({ width: 1366, height: 768 });
        let release;
        const gate = new Promise(resolve => { release = resolve; });
        await page.route('**/fixture-avatar.png', async route => { await gate; await route.fulfill({ contentType: 'image/png', body: fs.readFileSync(path.join(root, 'Unicheck/platform/assets/images/logo.png')) }); });
        const avatarUrl = origin + '/Unicheck/fixture-avatar.png';
        await page.evaluate(({ fixture, avatarUrl }) => { const profile = { ...fixture, foto_url: avatarUrl }; localStorage.setItem('userProfile', JSON.stringify(profile)); window.dispatchEvent(new CustomEvent('unicheck:profile-updated', { detail: { profile } })); }, { fixture, avatarUrl });
        assert.equal(await page.locator('.user-profile .user-avatar').getAttribute('aria-busy'), 'true');
        assert.equal(await page.locator('.user-profile .user-avatar span').evaluate(el => el.style.opacity), '0');
        release();
        await page.waitForFunction(() => document.querySelector('.user-profile .user-avatar').getAttribute('aria-busy') === 'false');
        for (const selector of ['.user-profile .user-avatar', '.user-avatar-small', '.user-dropdown-avatar']) assert.ok((await page.locator(selector).evaluate(el => el.style.backgroundImage)).includes(avatarUrl));
        await page.locator('#sidebarToggle').click();
        assert.ok((await page.locator('.user-profile .user-avatar').evaluate(el => el.style.backgroundImage)).includes(avatarUrl));
        await page.locator('#sidebarToggle').click();
        const other = await context.newPage(); await other.goto('about:blank'); await other.bringToFront(); await page.bringToFront();
        await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
        assert.ok((await page.locator('.user-profile .user-avatar').evaluate(el => el.style.backgroundImage)).includes(avatarUrl));
        await page.goto(origin + '/Unicheck/platform/pages/beneficios-estudantis/beneficios-estudantis.html');
        await page.waitForFunction(() => document.querySelector('.user-profile .user-avatar')?.style.backgroundImage.includes('fixture-avatar.png'));
        assert.deepEqual(errors, []);
        fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ results, errors, avatar: 'native Image load + delayed response + navigation + rail + tab return + pageshow passed', limitation: 'Auth/profile fixtures; no production account or deployed Storage validation' }, null, 2));
        console.log(`PASS: ${results.length} layout checks; delayed avatar, shell slots, navigation, rail and tab return; no page errors.`);
    } finally {
        await browser?.close();
        server.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
