const assert = require('node:assert/strict');
const test = require('node:test');

let handler;

test.before(async () => {
  const module = await import('../netlify/functions/unimatch-api.mjs');
  handler = module.default;
});

async function invoke(path, { method = 'GET', body, contentType = 'application/json' } = {}) {
  const headers = contentType ? { 'content-type': contentType } : {};
  const request = new Request(`https://unicheck.test${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body)
  });
  return handler(request, {});
}

test('GET /api/unimatch/catalog expõe matrizes públicas com versão e fonte', async () => {
  const response = await invoke('/api/unimatch/catalog');
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.curricula.length >= 15);
  assert.ok(body.curricula.some((curriculum) => curriculum.program === 'Sistemas de Informação'));
  assert.ok(body.curricula.every((curriculum) => curriculum.sourceUrl.startsWith('https://unisales.br/')));
  assert.ok(body.curricula.every((curriculum) => curriculum.subjectCount > 0));
});

test('POST /api/unimatch/match ranqueia nomes curriculares e devolve fontes/racional', async () => {
  const response = await invoke('/api/unimatch/match', {
    method: 'POST',
    body: {
      curriculumId: 'sistemas-informacao-ead-2023',
      disciplines: [{
        name: 'Banco de Dados',
        description: 'Modelagem relacional e consultas SQL.',
        workloadHours: 60
      }]
    }
  });
  const body = await response.json();
  const matches = body.analyses[0].matches;

  assert.equal(response.status, 200);
  assert.equal(body.engine.type, 'lexical_semantic_heuristic');
  assert.equal(matches[0].subject.name, 'Modelagem e Projeto de Banco de Dados');
  assert.ok(matches[0].similarity > 0);
  assert.ok(matches[0].reasons.length > 0);
  assert.match(matches[0].subject.sourceUrl, /^https:\/\/unisales\.br\//);
  assert.equal(matches[0].workload.status, 'unknown');
  assert.match(body.disclaimer, /não substituem/i);
  assert.doesNotMatch(JSON.stringify(body), /"approved"\s*:\s*true/i);
});

test('a API pode correlacionar várias disciplinas em uma mesma consulta', async () => {
  const response = await invoke('/api/unimatch/match', {
    method: 'POST',
    body: {
      curriculumId: 'tads-ead-2023',
      disciplines: [
        { name: 'Banco de Dados', workloadHours: 80 },
        { name: 'Programação orientada a objetos', workloadHours: 60 }
      ]
    }
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.analyses.length, 2);
  assert.equal(body.analyses[0].matches[0].subject.name, 'Modelagem e Projeto de Banco de Dados');
  assert.ok(body.analyses[1].matches[0].subject.name.toLowerCase().includes('aplicativo'));
});

test('responde 404 para matriz que não existe no catálogo local', async () => {
  const response = await invoke('/api/unimatch/match', {
    method: 'POST',
    body: { curriculumId: 'inventada', disciplines: [{ name: 'Banco de Dados' }] }
  });
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error.code, 'CURRICULUM_NOT_FOUND');
});

test('rejeita JSON malformado, tipo de conteúdo errado e carga excessiva', async () => {
  const malformed = await invoke('/api/unimatch/match', { method: 'POST', body: '{', contentType: 'application/json' });
  const unsupportedType = await invoke('/api/unimatch/match', {
    method: 'POST', body: '{}', contentType: 'text/plain'
  });
  const oversized = await invoke('/api/unimatch/match', {
    method: 'POST', body: `{"curriculumId":"x","note":"${'a'.repeat(70000)}"}`
  });

  assert.equal(malformed.status, 400);
  assert.equal(unsupportedType.status, 415);
  assert.equal(oversized.status, 413);
});

test('valida disciplina, lista, texto e carga horária', async () => {
  const cases = [
    { curriculumId: 'sistemas-informacao-ead-2023', disciplines: [] },
    { curriculumId: 'sistemas-informacao-ead-2023', disciplines: [{ name: '   ' }] },
    { curriculumId: 'sistemas-informacao-ead-2023', disciplines: [{ name: 'Banco', workloadHours: 0 }] },
    { curriculumId: 'sistemas-informacao-ead-2023', disciplines: [{ name: 'Banco', workloadHours: -1 }] },
    { curriculumId: 'sistemas-informacao-ead-2023', disciplines: [{ name: 'Banco', description: 'x'.repeat(2500) }] },
    { curriculumId: 'sistemas-informacao-ead-2023', disciplines: 'Banco' }
  ];

  for (const payload of cases) {
    const response = await invoke('/api/unimatch/match', { method: 'POST', body: payload });
    assert.equal(response.status, 400);
    assert.ok((await response.json()).error);
  }
});

test('devolve 405 e Allow para métodos não suportados', async () => {
  const response = await invoke('/api/unimatch/catalog', { method: 'DELETE' });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET');
});
