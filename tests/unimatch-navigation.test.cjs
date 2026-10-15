const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

const root = join(__dirname, '..');
const landing = readFileSync(join(root, 'Unicheck/landing/index.html'), 'utf8');

test('navbar inclui link direto ao UniMatch na lista usada em desktop e mobile', () => {
  const nav = landing.match(/<ul class="nav-links">([\s\S]*?)<\/ul>/)?.[1] ?? '';
  assert.match(nav, /href="\/unimatch"[^>]*>\s*UniMatch\s*</i);
});

test('a seção UniMatch aparece após os recursos e antes de Como funciona', () => {
  const resources = landing.indexOf('class="resource-strip"');
  const intro = landing.indexOf('id="unimatch-intro"');
  const howItWorks = landing.indexOf('id="como-funciona"');

  assert.ok(resources >= 0);
  assert.ok(intro > resources);
  assert.ok(howItWorks > intro);
});

test('a seção usa uma ilustração conceitual e um CTA que aponta para a rota nativa', () => {
  const section = landing.match(/<section[^>]*id="unimatch-intro"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.match(section, /Curso de origem/i);
  assert.match(section, /Curso de destino/i);
  assert.match(section, /UniMatch/i);
  assert.match(section, /href="\/unimatch"/);
});

test('preserva o CTA final original', () => {
  assert.match(landing, /class="final-cta"[\s\S]*?Comece sua jornada acadêmica com menos confusão\./);
  assert.match(landing, /href="login-cadastro\.html"[^>]*>Começar agora/);
});

test('Netlify serve o CSS da seção e o sitemap indexa a rota UniMatch', () => {
  const netlify = readFileSync(join(root, 'netlify.toml'), 'utf8');
  const sitemap = readFileSync(join(root, 'Unicheck/sitemap.xml'), 'utf8');

  assert.match(netlify, /from\s*=\s*"\/css\/unimatch-intro\.css"[\s\S]*?to\s*=\s*"\/landing\/css\/unimatch-intro\.css"/);
  assert.match(sitemap, /<loc>https:\/\/unicheckhub\.com\.br\/unimatch<\/loc>/);
});

test('a rota /unimatch tem metadados próprios e formulário acessível sem iframe', () => {
  const page = readFileSync(join(root, 'Unicheck/unimatch/index.html'), 'utf8');
  assert.match(page, /<title>UniMatch \|/);
  assert.match(page, /canonical" href="https:\/\/unicheckhub\.com\.br\/unimatch"/);
  assert.match(page, /name="description"/);
  assert.match(page, /id="unimatch-curriculum"/);
  assert.match(page, /id="unimatch-disciplines"/);
  assert.match(page, /aria-live="polite"/);
  assert.ok(page.includes('/api/unimatch/catalog') || readFileSync(join(root, 'Unicheck/unimatch/js/unimatch.js'), 'utf8').includes('/api/unimatch/catalog'));
  assert.ok(page.includes('/api/unimatch/match') || readFileSync(join(root, 'Unicheck/unimatch/js/unimatch.js'), 'utf8').includes('/api/unimatch/match'));
  assert.doesNotMatch(page, /<iframe/i);
});

test('a página apresenta entrada de disciplinas, descrição opcional e carga horária opcional', () => {
  const page = readFileSync(join(root, 'Unicheck/unimatch/index.html'), 'utf8');
  assert.match(page, /name="discipline-name"/);
  assert.match(page, /name="discipline-description"/);
  assert.match(page, /name="discipline-workload"/);
  assert.match(page, /type="submit"/);
  assert.match(page, /não substituem/i);
});

test('os estilos contemplam navegação responsiva e redução de movimento', () => {
  const pageStyles = readFileSync(join(root, 'Unicheck/unimatch/css/unimatch.css'), 'utf8');
  const landingStyles = readFileSync(join(root, 'Unicheck/landing/css/unimatch-intro.css'), 'utf8');

  assert.match(pageStyles, /@media\s*\(max-width:\s*899px\)/);
  assert.match(pageStyles, /@media\s*\(max-width:\s*760px\)/);
  assert.match(pageStyles, /@media\s*\(max-width:\s*360px\)/);
  assert.match(pageStyles, /prefers-reduced-motion:\s*reduce/);
  assert.match(landingStyles, /@media\s*\(max-width:\s*760px\)/);
  assert.match(landingStyles, /@media\s*\(max-width:\s*520px\)/);
  assert.match(landingStyles, /prefers-reduced-motion:\s*reduce/);
});
