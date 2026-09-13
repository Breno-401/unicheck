// Run with Playwright installed or available through NODE_PATH. No network or real account is used.
// Optional: CHECKLIST_BROWSER_EXECUTABLE, CHECKLIST_BROWSER_PHASES=4,5,6,7,
// CHECKLIST_BROWSER_WIDTHS=1920,1366,390, CHECKLIST_BROWSER_THEMES=light,dark.
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "private-context", "checklist-browser");
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2" };
const split = (value, fallback) => (value || fallback).split(",");
const phases = split(process.env.CHECKLIST_BROWSER_PHASES, "4,5,6,7").map(Number);
const widths = split(process.env.CHECKLIST_BROWSER_WIDTHS, "1920,1366,390").map(Number);
const themes = split(process.env.CHECKLIST_BROWSER_THEMES, "light,dark");

const server = http.createServer((request, response) => {
    const filename = path.resolve(root, `.${decodeURIComponent(new URL(request.url, "http://localhost").pathname)}`);
    if (!filename.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    fs.readFile(filename, (error, data) => {
        if (error) { response.writeHead(404).end(); return; }
        response.setHeader("Content-Type", mime[path.extname(filename)] || "application/octet-stream");
        response.end(data);
    });
});

(async () => {
    fs.mkdirSync(output, { recursive: true });
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const executablePath = process.env.CHECKLIST_BROWSER_EXECUTABLE || [
        chromium.executablePath(),
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
        "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
    ].find(filename => fs.existsSync(filename));
    const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
    const results = [];
    try {
        const scenarios = phases.flatMap(phase => widths.flatMap(width => themes.flatMap(theme => ["partial", "phase", "full"].map(state => ({ phase, width, theme, state })))));
        const queue = [...scenarios];
        // Independent contexts keep progress, theme and reload storage isolated between scenarios.
        await Promise.all(Array.from({ length: 4 }, async () => {
            for (let scenario = queue.shift(); scenario; scenario = queue.shift()) {
                const { phase, width, theme, state } = scenario;
                const name = `phase${phase}-${width}-${theme}-${state}`;
                const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : width === 1366 ? 768 : 1080 }, colorScheme: theme });
                const page = await context.newPage();
                const errors = [];
                page.on("pageerror", error => errors.push(error.message));
                page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
                // Local harness mocks authentication and persistence; prevent external resource requests.
                await page.route("**/*", route => route.request().url().startsWith(baseUrl) || route.request().url().startsWith("data:")
                    ? route.continue() : route.fulfill({ status: 200, body: "" }));
                const params = new URLSearchParams({ phase, theme, state, audit: "1", keyboard: "1" });
                if (state !== "full") { params.set("interaction", "1"); params.set("reload", "1"); }
                try {
                    await page.goto(`${baseUrl}/tests/checklist-player-browser-test.html?${params}`, { waitUntil: "load" });
                    await page.waitForFunction(() => /^(PASS|FAIL|ERROR):/.test(document.getElementById("browserTestResult").textContent), { timeout: 20000 });
                    const initial = await page.locator("#browserTestResult").textContent();
                    if (!initial.startsWith("PASS:")) throw new Error(initial);
                    await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
                    let reload = null;
                    if (state !== "full") {
                        await page.reload({ waitUntil: "load" });
                        await page.waitForFunction(() => /^(PASS|FAIL|ERROR):/.test(document.getElementById("browserTestResult").textContent), { timeout: 20000 });
                        reload = await page.locator("#browserTestResult").textContent();
                        if (!reload.startsWith("PASS:") || !reload.includes(":reloaded:")) throw new Error(reload);
                    }
                    if (errors.length) throw new Error(errors.join(" | "));
                    results.push({ ...scenario, status: "PASS", initial, reload });
                    process.stdout.write(`PASS ${name}${reload ? " + reload" : ""}\n`);
                } catch (error) {
                    await page.screenshot({ path: path.join(output, `${name}-failure.png`), fullPage: true }).catch(() => {});
                    results.push({ ...scenario, status: "FAIL", error: error.message, consoleErrors: errors });
                    process.stdout.write(`FAIL ${name}: ${error.message}\n`);
                } finally { await context.close(); }
            }
        }));
        fs.writeFileSync(path.join(output, "results.json"), JSON.stringify(results, null, 2));
        const failures = results.filter(result => result.status === "FAIL");
        process.stdout.write(`${results.length - failures.length}/${results.length} cenários aprovados. Evidências: ${output}\n`);
        if (failures.length) process.exitCode = 1;
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
