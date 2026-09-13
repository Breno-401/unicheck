const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
// Approved CDN bytes: downloaded twice, SHA-384 and browser/CORS checked on 2026-09-13.
// Updating a URL requires verifying its exact bytes and updating its matching SRI here.
const approved = {
    supabase: {
        url: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.js',
        integrity: 'sha384-iLddHTLokph6Omwoyid4XKxHaWa6w41BnoEj0q5oOrzmYPpHIKt1wyjReA7s//pP'
    },
    lucide: {
        url: 'https://unpkg.com/lucide@1.45.0/dist/umd/lucide.js',
        integrity: 'sha384-LTY+5wSqTCbpX7VDV4LXKEOEJYxKyoelnz17ygL0mCALfEDgnB6npBVcki2iH80U'
    }
};
const pages = [
    'Unicheck/landing/login-cadastro.html',
    'Unicheck/platform/index-interno.html',
    ...['ajuda-suporte', 'beneficios-estudantis', 'checklist-academico', 'configuracoes-perfil', 'manual-aluno']
        .map(name => `Unicheck/platform/pages/${name}/${name}.html`)
];
const scripts = html => Array.from(html.matchAll(/<script\b[^>]*>/gi), match =>
    Object.fromEntries(Array.from(match[0].matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g), attr => [attr[1], attr[2]])))
    .filter(attrs => /supabase-js|lucide@/.test(attrs.src || ''));

for (const file of pages) {
    test(`${file}: dependências CDN têm versão exata aprovada`, () => {
        const dependencies = scripts(read(file));
        assert.equal(dependencies.length, file.includes('/landing/') ? 1 : 2);
        for (const attrs of dependencies) {
            assert.doesNotMatch(attrs.src, /@latest\b|@\d+(?:\/|$)/);
            const dependency = attrs.src.includes('supabase-js') ? approved.supabase : approved.lucide;
            assert.equal(attrs.src, dependency.url);
        }
    });
    test(`${file}: CDN exige o hash aprovado e CORS anônimo`, () => {
        const dependencies = scripts(read(file));
        assert.equal(dependencies.length, file.includes('/landing/') ? 1 : 2);
        for (const attrs of dependencies) {
            const dependency = attrs.src.includes('supabase-js') ? approved.supabase : approved.lucide;
            assert.equal(attrs.integrity, dependency.integrity);
            assert.equal(attrs.crossorigin, 'anonymous');
        }
    });
}

test('novas páginas de produção também usam somente os recursos CDN aprovados', () => {
    function inspect(dir) {
        for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
            const file = `${dir}/${entry.name}`;
            if (entry.isDirectory()) inspect(file);
            else if (file.endsWith('.html')) for (const attrs of scripts(read(file))) {
                const dependency = Object.values(approved).find(item => item.url === attrs.src);
                assert.ok(dependency, `${file}: recurso CDN não aprovado ${attrs.src}`);
                assert.equal(attrs.integrity, dependency.integrity);
                assert.equal(attrs.crossorigin, 'anonymous');
            }
        }
    }
    inspect('Unicheck');
});

const globalHeaders = () => {
    const block = read('netlify.toml').split('[[headers]]').slice(1)
        .find(value => /^\s*for\s*=\s*"\/\*"\s*$/m.test(value));
    assert.ok(block, 'headers precisam abranger todas as rotas');
    return Object.fromEntries(Array.from(block.matchAll(/^\s*([\w-]+)\s*=\s*"([^"\r\n]*)"\s*$/gm), match => [match[1], match[2]]));
};
test('deploy impede framing via CSP sem restringir scripts atuais', () => {
    assert.equal(globalHeaders()['Content-Security-Policy'], "frame-ancestors 'none'");
});
test('deploy impede framing em clientes que usam X-Frame-Options', () => {
    assert.equal(globalHeaders()['X-Frame-Options'], 'DENY');
});

function git(args, input) {
    const result = spawnSync('git', ['-c', `safe.directory=${root.replaceAll('\\', '/')}`, ...args], { cwd: root, input, encoding: 'utf8' });
    assert.ok([0, 1].includes(result.status), result.stderr || result.error?.message);
    return result.stdout.trim().split(/\r?\n/).filter(Boolean);
}
test('git exclui ambientes, segredos e artefatos locais de execução', () => {
    const files = ['.env', '.env.production', 'Unicheck/.env.local', '.npmrc', '.netrc',
        'credentials.json', 'service-account.json', 'private.pem', 'private.key', 'client.p12', 'client.pfx',
        'id_rsa', 'id_ed25519', '.aws/credentials', '.ssh/config', 'debug.log', 'node_modules/cache.js',
        '.cache/data', 'coverage/index.html', 'test-results/output.json', 'playwright-report/index.html',
        '.netlify/state.json', '.codex/config.toml', '.agents/settings.json', '.superpowers/session.json'];
    assert.deepEqual(git(['check-ignore', '--no-index', '--stdin'], files.join('\n')), files);
});
test('git exclui contexto privado pelas convenções locais sem bloquear documentos oficiais', () => {
    const files = ['private-context/source.pdf', 'tmp/result.json', 'docs/checklist-academico-pesquisa.pdf',
        'docs/local/source.pdf', 'docs/context/prompt.md', '.local-context/session.md',
        'docs/research.local.pdf', 'docs/research.local.docx'];
    assert.deepEqual(git(['check-ignore', '--no-index', '--stdin'], files.join('\n')), files);
    const official = ['.env.example', '.env.sample', '.env.template', 'Unicheck/.env.example', '.npmrc.example',
        'docs/architecture/design.md', 'docs/audits/audit.md', 'docs/development/setup.md', 'docs/plans/plan.md',
        'docs/manual.pdf', 'docs/manual.docx', 'README.md'];
    assert.deepEqual(git(['check-ignore', '--no-index', '--stdin'], official.join('\n')), []);
});
test('nenhum arquivo rastreado passa a ser ignorado pelas regras do repositório', () => {
    const tracked = git(['ls-files']);
    assert.ok(tracked.length > 0);
    assert.deepEqual(git(['check-ignore', '--no-index', '--stdin'], tracked.join('\n')), []);
});

function productionJavaScript(dir = 'Unicheck') {
    return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(entry => {
        const file = `${dir}/${entry.name}`;
        return entry.isDirectory() ? productionJavaScript(file) : file.endsWith('.js') ? [file] : [];
    });
}

// Lexical inspection, not a search of source text: comments, quoted examples and
// regex literals must not look like executable console calls. Templates remain
// one argument, but interpolation is never approved as an operational message.
function consoleCalls(source) {
    const tokens = [];
    const lexeme = /\s+|\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|`(?:\\[\s\S]|[^`\\])*`|[\w$]+|\?\.|=>|[^\s]/gy;
    let match;
    while ((match = lexeme.exec(source))) {
        const value = match[0];
        if (/^\s|^\/\/|^\/\*/.test(value)) continue;
        // A slash following these expression prefixes starts a regex literal.
        if (value === '/' && (!tokens.length || /^(?:[=(:,!&|?\[{;]|return|=>)$/.test(tokens.at(-1).value))) {
            const regex = /^\/(?:\\.|\[(?:\\.|[^\]\\])*\]|[^/\r\n\\])+\/[a-z]*/.exec(source.slice(match.index));
            if (regex) {
                tokens.push({ value: regex[0], offset: match.index });
                lexeme.lastIndex = match.index + regex[0].length;
                continue;
            }
        }
        tokens.push({ value, offset: match.index });
    }
    const calls = [];
    for (let index = 0; index < tokens.length; index += 1) {
        if (tokens[index].value !== 'console') continue;
        let cursor = index + 1;
        let method;
        if (tokens[cursor]?.value === '?.' && tokens[cursor + 1]?.value === '[') cursor += 1;
        if (['.', '?.'].includes(tokens[cursor]?.value)) {
            method = tokens[++cursor]?.value;
            cursor += 1;
        } else if (tokens[cursor]?.value === '[' && tokens[cursor + 2]?.value === ']') {
            method = tokens[cursor + 1].value.slice(1, -1);
            cursor += 3;
        }
        if (tokens[cursor]?.value === '?.') cursor += 1;
        if (tokens[cursor]?.value !== '(') continue;
        const args = [];
        let depth = 1;
        while (++cursor < tokens.length) {
            const token = tokens[cursor];
            if (token.value === '(') depth += 1;
            if (token.value === ')' && --depth === 0) break;
            args.push(token.value);
        }
        calls.push({ method, args, line: source.slice(0, tokens[index].offset).split('\n').length });
    }
    return calls;
}

const staticConsoleMessage = call => call.args.length > 0 && call.args.length % 2 === 1 &&
    call.args.every((value, index) => index % 2 === 1 ? value === ',' :
        /^(?:"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|`(?:\\[\s\S]|[^`\\])*`|\d+|true|false|null)$/.test(value) &&
        !(value.startsWith('`') && value.includes('${')));

test('auditoria de console ignora comentários, textos e regex e aceita warnings/errors estáticos', () => {
    const source = [
        '// console.log(user.email)',
        '/* console.info(session) */',
        'const help = "console.error(profile)";',
        'const example = /console.log(user)/;',
        'console.warn("Falha ao carregar perfil.");',
        'console.error(`Sessão indisponível.`);',
        'console.warn("Falha de perfil", "Tente novamente", 3);'
    ].join('\n');
    const calls = consoleCalls(source);
    assert.deepEqual(calls.map(call => call.method), ['warn', 'error', 'warn']);
    assert.ok(calls.every(staticConsoleMessage));
});

test('auditoria rejeita dados pessoais diretos, serializados, interpolados e erros brutos', () => {
    for (const expression of ['user.email', 'profile.ra', 'user.id', 'session', 'profile', 'user',
        'JSON.stringify({ email, ra, userId })', '`Perfil: ${JSON.stringify(profile)}`',
        'error', 'error.message', '{ details: error.details }']) {
        const calls = consoleCalls(`console.error("Falha operacional", ${expression});`);
        assert.equal(calls.length, 1, expression);
        assert.equal(staticConsoleMessage(calls[0]), false, expression);
    }
    assert.equal(consoleCalls('console["info"](session)')[0].method, 'info');
    assert.equal(consoleCalls('console?.log?.(user)')[0].method, 'log');
});

for (const [source, method] of [
    ['console?.["log"](user.email)', 'log'],
    ['console?.["error"](JSON.stringify(profile))', 'error']
]) {
    test(`auditoria detecta acesso computado opcional: ${source}`, () => {
        const calls = consoleCalls(source);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].method, method);
        assert.equal(staticConsoleMessage(calls[0]), false);
    });
}

test('debugSidebar preserva a API global e retorna estado sem emitir no console', () => {
    const source = read('Unicheck/platform/shared/js/platform-shell.js');
    const definition = source.match(/window\.debugSidebar = function\(\) \{[\s\S]*?\n\};/);
    assert.ok(definition, 'o shell deve continuar expondo window.debugSidebar');
    const messages = [];
    const classes = new Set(['collapsed']);
    const sidebar = { classList: { contains: name => classes.has(name) }, style: { width: '68px' } };
    const mainContent = { style: { marginLeft: '68px' } };
    const window = {};
    // Run the actual exported function with controlled DOM state. No lifecycle
    // methods need to run to inspect this read-only compatibility contract.
    vm.runInNewContext(definition[0], {
        window, sidebar, mainContent,
        console: new Proxy({}, { get: (_, method) => (...args) => messages.push({ method, args }) })
    });
    assert.equal(typeof window.debugSidebar, 'function');
    assert.equal(window.debugSidebar.length, 0);
    assert.deepEqual(JSON.parse(JSON.stringify(window.debugSidebar())), {
        isCollapsed: true, isOpen: false, width: '68px', mainContentMargin: '68px'
    });
    classes.delete('collapsed');
    classes.add('open');
    sidebar.style.width = '280px';
    mainContent.style.marginLeft = '0px';
    assert.deepEqual(JSON.parse(JSON.stringify(window.debugSidebar())), {
        isCollapsed: false, isOpen: true, width: '280px', mainContentMargin: '0px'
    });
    assert.deepEqual(messages, []);
});

test('JavaScript de produção não emite console.log/console.info de depuração', () => {
    const violations = productionJavaScript().flatMap(file => consoleCalls(read(file))
        .filter(call => ['log', 'info'].includes(call.method))
        .map(call => `${file}:${call.line}: console.${call.method}`));
    assert.deepEqual(violations, []);
});

test('console de produção não recebe PII, sessão, perfil, payload ou erro remoto bruto', () => {
    // A literal-only sink prevents leaks even when a payload is renamed, nested,
    // serialized, or carried inside a provider error's message/details/hint.
    const violations = productionJavaScript().flatMap(file => consoleCalls(read(file))
        .filter(call => !staticConsoleMessage(call))
        .map(call => `${file}:${call.line}: console.${call.method} recebe dados dinâmicos`));
    assert.deepEqual(violations, []);
});
