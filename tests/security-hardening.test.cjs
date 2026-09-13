const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

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
