const assert = require('node:assert/strict');
const test = require('node:test');

let matcher;
let normalize;
let catalog;

test.before(async () => {
  matcher = await import('../Unicheck/unimatch/domain/matcher.mjs');
  normalize = await import('../Unicheck/unimatch/domain/normalization.mjs');
  catalog = await import('../Unicheck/unimatch/data/curricula.mjs');
});

test('normaliza acentos, pontuação e palavras funcionais em português', () => {
  assert.deepEqual(
    normalize.normalizeTerms('Modelagem e Projeto de Banco de Dados!'),
    ['modelagem', 'projeto', 'banco', 'dado']
  );
});

test('o catálogo contém disciplinas com origem e carga horária desconhecida explícita', () => {
  assert.ok(catalog.curricula.length > 0);
  const databaseCourse = catalog.curricula.flatMap((curriculum) => curriculum.subjects)
    .find((subject) => subject.name === 'Modelagem e Projeto de Banco de Dados');

  assert.ok(databaseCourse, 'a disciplina publicada deve estar no catálogo');
  assert.equal(databaseCourse.workloadHours, null);
  assert.match(databaseCourse.sourceUrl, /^https:\/\/unisales\.br\//);
});

test('as 21 matrizes mantêm IDs e fontes e não inventam carga horária', () => {
  const matrixIds = catalog.curricula.map((curriculum) => curriculum.id);
  assert.equal(matrixIds.length, 21);
  assert.equal(new Set(matrixIds).size, matrixIds.length);

  for (const curriculum of catalog.curricula) {
    assert.match(curriculum.sourceUrl, /^https:\/\/unisales\.br\//);
    assert.equal(curriculum.coverage, 'official_names_only');
    assert.ok(curriculum.subjects.length > 0);
    assert.equal(new Set(curriculum.subjects.map((subject) => subject.name)).size, curriculum.subjects.length);
    assert.ok(curriculum.subjects.every((subject) => subject.workloadHours === null));
    assert.ok(curriculum.subjects.every((subject) => subject.sourceUrl === curriculum.sourceUrl));
  }
});

test('correlaciona Banco de Dados a disciplinas sobre modelagem/armazenamento de dados', () => {
  const result = matcher.rankMatches({
    name: 'Banco de Dados',
    description: 'Modelagem de dados relacionais e consultas SQL.'
  }, [
    { id: 'db', name: 'Modelagem e Projeto de Banco de Dados', workloadHours: null },
    { id: 'analytics', name: 'Projeto de Análise de Dados Utilizando OLAP', workloadHours: null },
    { id: 'first-aid', name: 'Primeiros Socorros na Prática de Enfermagem', workloadHours: null }
  ]);

  assert.equal(result[0].subject.id, 'db');
  assert.ok(result[0].similarity > result[1].similarity);
  assert.ok(result[0].reasons.some((reason) => /banco|modelagem|SQL|dados/i.test(reason)));
  assert.ok(result.every((entry) => entry.subject.id !== 'first-aid'));
});

test('relaciona armazenamento de dados a fluxos ETL e registra o conceito compartilhado', () => {
  const result = matcher.rankMatches(
    { name: 'Banco de Dados' },
    [{ id: 'etl', name: 'Projeto de Fluxo de Dados Usando ETL', workloadHours: null }]
  );

  assert.equal(result[0].subject.id, 'etl');
  assert.ok(result[0].reasons.some((reason) => /dados|armazenamento|ETL/i.test(reason)));
});

test('aceita relação de domínio entre banco de dados e ETL sem depender só da palavra dados', () => {
  const result = matcher.rankMatches(
    { name: 'Banco de Dados', description: 'Armazenamento e organização de informações.' },
    [{ id: 'etl', name: 'Projeto de Fluxo de Dados Usando ETL', workloadHours: null }]
  );

  assert.equal(result[0]?.subject.id, 'etl');
  assert.ok(result[0].reasons.some((reason) => /análise de fluxo de dados/i.test(reason)));
});

test('não sugere estrutura de dados com base apenas na palavra ampla dados', () => {
  const result = matcher.rankMatches(
    { name: 'Banco de Dados' },
    [{ id: 'data-structures', name: 'Construção e Abstração em Estruturas de Dados', workloadHours: null }]
  );

  assert.deepEqual(result, []);
});

test('não transforma uma relação ampla entre domínios em sugestão sem termos em comum', () => {
  const result = matcher.rankMatches(
    { name: 'Banco de Dados' },
    [{ id: 'dashboard', name: 'Projeto de desenvolvimento de Dashboard para Análise de Rentabilidade', workloadHours: null }]
  );

  assert.deepEqual(result, []);
});

test('correlaciona vocabulário equivalente de gestão, economia, espaços e reabilitação', () => {
  const cases = [
    ['Administração de Recursos Humanos', 'Comportamento Organizacional'],
    ['Princípios de Microeconomia', 'Economia Brasileira'],
    ['Desenho Técnico Arquitetônico', 'Representação Gráfica de Projetos'],
    ['Reabilitação Fisioterapêutica', 'Recursos Terapêuticos para Recuperação Funcional']
  ];

  for (const [sourceName, targetName] of cases) {
    const results = matcher.rankMatches({ name: sourceName }, [{ id: targetName, name: targetName, workloadHours: null }]);
    assert.equal(results[0]?.subject.name, targetName, `${sourceName} deve se relacionar com ${targetName}`);
    assert.ok(results[0].reasons.some((reason) => /Conceitos relacionados/.test(reason)));
  }
});

test('termos genéricos de organização curricular não geram sugestão isoladamente', () => {
  const result = matcher.rankMatches(
    { name: 'Tópicos gerais de processos' },
    [{ id: 'process', name: 'Fundamentos de processos acadêmicos', workloadHours: null }]
  );

  assert.deepEqual(result, []);
});

test('retorna lista vazia quando não existe sinal lexical ou conceitual', () => {
  const result = matcher.rankMatches(
    { name: 'Cuidados de enfermagem em urgência' },
    [{ id: 'db', name: 'Modelagem e Projeto de Banco de Dados', workloadHours: null }]
  );

  assert.deepEqual(result, []);
});

test('calcula o critério publicado de 75% somente quando as duas cargas são conhecidas', () => {
  assert.equal(matcher.assessWorkload(60, 80).status, 'meets_minimum');
  assert.equal(matcher.assessWorkload(59, 80).status, 'does_not_meet_minimum');
  assert.equal(matcher.assessWorkload(60, null).status, 'unknown');
  assert.equal(matcher.assessWorkload(null, 80).status, 'unknown');
});
