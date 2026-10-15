import { normalizeTerms, normalizeText, phraseOccurs } from './normalization.mjs';

// Curated, inspectable Portuguese concept groups. They expand common academic
// terminology; they are not an external model or an institutional equivalency rule.
const CONCEPT_GROUPS = [
  {
    id: 'data', label: 'Dados e informação', weight: 0.3,
    phrases: ['dados', 'informação', 'informações', 'informacao', 'informacoes', 'data science']
  },
  {
    id: 'database', label: 'Banco de dados e modelagem', weight: 1.2,
    phrases: [
      'banco de dados', 'bancos de dados', 'base de dados', 'bases de dados', 'database', 'databases',
      'sql', 'modelagem de dados', 'armazenamento de dados', 'armazenamento e organização de informações',
      'persistência de dados', 'consulta a dados', 'modelo relacional', 'dados relacionais'
    ]
  },
  {
    id: 'data-analysis', label: 'Análise e fluxo de dados', weight: 0.9,
    phrases: [
      'análise de dados', 'dados analíticos', 'data analytics', 'olap', 'etl', 'dashboard', 'dashboards',
      'business intelligence', 'inteligência de negócio', 'mineração de dados', 'visualização de dados',
      'fluxo de dados', 'análise de rentabilidade', 'análise de custos'
    ]
  },
  {
    id: 'programming', label: 'Programação e desenvolvimento', weight: 1,
    phrases: [
      'programação', 'algoritmos', 'desenvolvimento de software', 'engenharia de software', 'software',
      'programming', 'codificação', 'desenvolvimento de aplicativos', 'desenvolvimento de sistemas',
      'desenvolvimento web', 'aplicativo mobile', 'programação orientada a objetos',
      'orientação a objetos', 'aplicativo orientado a objetos', 'poo', 'oop'
    ]
  },
  {
    id: 'systems-design', label: 'Análise e projeto de sistemas', weight: 0.85,
    phrases: [
      'análise de sistemas', 'levantamento de requisitos', 'requisitos de sistema', 'projeto de sistemas',
      'modelagem de sistemas', 'documentação de sistemas', 'sistemas de informação', 'design de software',
      'prototipação', 'prototipagem'
    ]
  },
  {
    id: 'web-infrastructure', label: 'Web e infraestrutura de tecnologia', weight: 0.8,
    phrases: [
      'infraestrutura web', 'desenvolvimento web', 'front end', 'back end', 'website', 'servidores',
      'infraestrutura distribuída', 'redes de computadores', 'computação em nuvem', 'cloud computing', 'iot'
    ]
  },
  {
    id: 'security', label: 'Segurança e privacidade', weight: 0.9,
    phrases: ['segurança da informação', 'segurança de aplicações', 'lgpd', 'privacidade', 'cibersegurança', 'proteção de dados']
  },
  {
    id: 'artificial-intelligence', label: 'Inteligência artificial e reconhecimento de padrões', weight: 0.9,
    phrases: [
      'inteligência artificial', 'aprendizado de máquina', 'machine learning', 'reconhecimento de padrões',
      'visão computacional', 'processamento de linguagem natural', 'ia generativa'
    ]
  },
  {
    id: 'mathematics-statistics', label: 'Matemática, estatística e métodos quantitativos', weight: 0.8,
    phrases: ['matemática', 'álgebra', 'estatística', 'bioestatística', 'pesquisa operacional', 'cálculo', 'modelagem matemática']
  },
  {
    id: 'management', label: 'Gestão e administração', weight: 0.7,
    phrases: ['administração', 'gestão empresarial', 'gestão de negócios', 'gestão organizacional', 'empreendedorismo', 'organização empresarial']
  },
  {
    id: 'economics', label: 'Economia e desenvolvimento econômico', weight: 0.9,
    phrases: ['economia', 'microeconomia', 'macroeconomia', 'economia brasileira', 'economia internacional', 'desenvolvimento econômico', 'teoria econômica']
  },
  {
    id: 'organizational-behavior', label: 'Comportamento organizacional e pessoas', weight: 0.9,
    phrases: ['comportamento organizacional', 'psicologia organizacional', 'administração de recursos humanos', 'gestão de recursos humanos', 'gestão de pessoas', 'relações interpessoais', 'relações humanas no trabalho']
  },
  {
    id: 'finance', label: 'Finanças e custos', weight: 0.9,
    phrases: ['finanças', 'fluxo de caixa', 'custos', 'orçamento', 'viabilidade econômica', 'mercado de capitais', 'contabilidade financeira']
  },
  {
    id: 'accounting', label: 'Contabilidade e tributos', weight: 1,
    phrases: ['contabilidade', 'contábil', 'tributação', 'tributos', 'auditoria contábil', 'demonstrações contábeis', 'perícia contábil']
  },
  {
    id: 'marketing', label: 'Marketing e pesquisa de mercado', weight: 0.85,
    phrases: ['marketing', 'pesquisa de mercado', 'branding', 'comunicação de marketing', 'comercialização', 'comportamento do consumidor']
  },
  {
    id: 'human-resources', label: 'Gestão de pessoas e recursos humanos', weight: 0.85,
    phrases: ['recursos humanos', 'gestão de pessoas', 'remuneração', 'recrutamento', 'relações trabalhistas', 'clima organizacional']
  },
  {
    id: 'logistics-production', label: 'Logística e produção', weight: 0.9,
    phrases: ['logística', 'cadeia de suprimentos', 'estoque', 'produção', 'mrp', 'manufatura', 'processo produtivo']
  },
  {
    id: 'quality-processes', label: 'Qualidade e processos', weight: 0.8,
    phrases: ['qualidade', 'melhoria de processos', 'controle de qualidade', 'lean manufacturing', 'gestão de processos', 'processos empresariais']
  },
  {
    id: 'law', label: 'Direito e legislação', weight: 0.7,
    phrases: ['direito', 'jurídico', 'jurídica', 'legislação', 'normas jurídicas', 'processo judicial']
  },
  {
    id: 'civil-law', label: 'Direito civil e relações privadas', weight: 0.9,
    phrases: ['direito civil', 'direito das famílias', 'direito sucessório', 'direito das coisas', 'negócios jurídicos', 'relações de consumo']
  },
  {
    id: 'criminal-law', label: 'Direito penal e processo criminal', weight: 0.9,
    phrases: ['direito penal', 'lei penal', 'processo criminal', 'persecução penal', 'procedimento criminal']
  },
  {
    id: 'labor-law', label: 'Direito do trabalho e previdência', weight: 0.9,
    phrases: ['direito do trabalho', 'legislação trabalhista', 'relações trabalhistas', 'seguridade social', 'previdenciário']
  },
  {
    id: 'public-law', label: 'Direito público e constitucional', weight: 0.9,
    phrases: ['direito público', 'direito constitucional', 'direito administrativo', 'gestão pública', 'finanças públicas']
  },
  {
    id: 'health', label: 'Saúde e cuidado', weight: 0.35,
    phrases: ['saúde', 'cuidado em saúde', 'atenção à saúde', 'assistência ao paciente', 'clínica', 'paciente']
  },
  {
    id: 'nursing', label: 'Enfermagem e assistência de enfermagem', weight: 1,
    phrases: ['enfermagem', 'processo de enfermagem', 'assistência de enfermagem', 'cuidado de enfermagem', 'semiologia em enfermagem']
  },
  {
    id: 'pharmacology', label: 'Farmacologia e medicamentos', weight: 0.95,
    phrases: ['farmacologia', 'medicamentos', 'fármacos', 'farmácia clínica', 'síntese de fármacos', 'prescrição farmacêutica']
  },
  {
    id: 'clinical-analysis', label: 'Análises clínicas e exames laboratoriais', weight: 0.9,
    phrases: ['análises clínicas', 'exames laboratoriais', 'hematologia clínica', 'bioquímica clínica', 'parasitologia clínica', 'patologia clínica']
  },
  {
    id: 'biology-chemistry', label: 'Biologia, química e metabolismo', weight: 0.8,
    phrases: ['biologia', 'bioquímica', 'química', 'metabolismo', 'síntese orgânica', 'biologia molecular']
  },
  {
    id: 'microbiology-immunology', label: 'Microbiologia e imunologia', weight: 0.9,
    phrases: ['microbiologia', 'imunologia', 'sistema imune', 'infecções bacterianas', 'infecções virais', 'infecções fúngicas']
  },
  {
    id: 'anatomy-physiology', label: 'Anatomia e fisiologia humanas', weight: 0.85,
    phrases: ['anatomia', 'fisiologia', 'morfofisiologia', 'morfofuncional', 'cinesiologia', 'biomecânica']
  },
  {
    id: 'psychology', label: 'Psicologia e saúde mental', weight: 0.9,
    phrases: ['psicologia', 'saúde mental', 'psicopatologia', 'avaliação psicológica', 'processos psicológicos', 'psicometria']
  },
  {
    id: 'rehabilitation', label: 'Fisioterapia, reabilitação e recuperação funcional', weight: 1,
    phrases: ['fisioterapia', 'fisioterapêutico', 'fisioterapêutica', 'reabilitação', 'recuperação funcional', 'recursos terapêuticos', 'terapia manual', 'terapia física', 'funcionalidade humana']
  },
  {
    id: 'epidemiology-public-health', label: 'Epidemiologia e saúde coletiva', weight: 0.9,
    phrases: ['epidemiologia', 'saúde coletiva', 'saúde pública', 'vigilância em saúde', 'vigilância epidemiológica', 'políticas de saúde', 'atenção primária à saúde']
  },
  {
    id: 'nutrition-food', label: 'Nutrição e alimentação', weight: 1,
    phrases: ['nutrição', 'alimentação', 'dietética', 'dietoterapia', 'estado nutricional', 'alimentos']
  },
  {
    id: 'movement-sport', label: 'Movimento, esporte e atividade física', weight: 0.9,
    phrases: ['educação física', 'atividade física', 'esportes', 'treinamento físico', 'práticas corporais', 'movimento humano']
  },
  {
    id: 'education', label: 'Educação e práticas pedagógicas', weight: 0.85,
    phrases: ['educação', 'ensino', 'aprendizagem', 'pedagogia', 'currículo escolar', 'práticas pedagógicas']
  },
  {
    id: 'architecture', label: 'Arquitetura e projeto de espaços', weight: 0.9,
    phrases: ['arquitetura', 'projeto arquitetônico', 'edificação', 'edifício', 'interiores', 'ambiente construído']
  },
  {
    id: 'architectural-representation', label: 'Desenho e representação de projetos', weight: 0.9,
    phrases: ['desenho técnico arquitetônico', 'desenho arquitetônico', 'representação gráfica', 'representação de projetos', 'desenho assistido por computador', 'cad', 'bim', 'modelagem tridimensional', 'modelagem 3d']
  },
  {
    id: 'urbanism', label: 'Urbanismo, território e paisagem', weight: 0.9,
    phrases: ['urbanismo', 'planejamento urbano', 'planejamento territorial', 'paisagismo', 'paisagem urbana', 'mobilidade urbana', 'cidade e território']
  },
  {
    id: 'construction-structures', label: 'Construção, estruturas e materiais', weight: 0.9,
    phrases: ['construção', 'estrutura de concreto', 'estruturas', 'instalações hidrossanitárias', 'materiais de construção', 'processos construtivos']
  },
  {
    id: 'environment', label: 'Meio ambiente e sustentabilidade', weight: 0.75,
    phrases: ['meio ambiente', 'ambiental', 'sustentabilidade', 'educação ambiental', 'gestão de resíduos', 'licenciamento ambiental']
  },
  {
    id: 'philosophy', label: 'Filosofia, ética e pensamento', weight: 0.9,
    phrases: ['filosofia', 'ética', 'teoria do conhecimento', 'fenomenologia', 'filosofia política', 'metafísica']
  },
  {
    id: 'sociology-anthropology', label: 'Sociologia, antropologia e sociedade', weight: 0.85,
    phrases: ['sociologia', 'antropologia', 'ciências sociais', 'relações sociais', 'sociedade brasileira', 'sociologia da educação', 'sociologia jurídica']
  },
  {
    id: 'communication', label: 'Comunicação, linguagem e expressão', weight: 0.8,
    phrases: ['comunicação social', 'comunicação organizacional', 'comunicação empresarial', 'linguagem e comunicação', 'expressão gráfica', 'produção textual', 'língua portuguesa']
  },
  {
    id: 'research-methods', label: 'Pesquisa e metodologia científica', weight: 0.75,
    phrases: ['metodologia científica', 'pesquisa científica', 'métodos de pesquisa', 'iniciação científica', 'trabalho de conclusão de curso', 'tcc']
  }
];

const conceptGroups = CONCEPT_GROUPS.map((group) => ({
  ...group,
  phrases: group.phrases.map(normalizeText).filter(Boolean)
}));

const CONCEPT_RELATIONSHIPS = [
  { left: 'database', right: 'data-analysis', weight: 0.45, label: 'Banco de dados e análise de fluxo de dados' }
];

const GENERIC_CURRICULUM_TERMS = new Set([
  'academico', 'analise', 'aprendizagem', 'aplicacao', 'aplicado', 'atividade', 'atividades', 'conclusao', 'curso', 'desenvolvimento', 'disciplina',
  'estagio', 'estudo', 'final', 'fundamento', 'fundamentos', 'geral', 'introducao', 'informacao', 'modelagem', 'organizacao', 'processo', 'projeto', 'projetos',
  'sistema', 'sistemico', 'sistemica', 'teoria', 'teorico', 'teorica', 'topico', 'topicos', 'trabalho', 'visao'
]);

function uniqueTokens(...parts) {
  return new Set(parts.flatMap((part) => normalizeTerms(part))
    .filter((term) => !GENERIC_CURRICULUM_TERMS.has(term)));
}

function matchedConcepts(text) {
  return conceptGroups.filter((group) => group.phrases.some((phrase) => phraseOccurs(text, phrase)));
}

function diceSimilarity(left, right) {
  if (left.size === 0 || right.size === 0) return 0;
  let overlap = 0;
  for (const term of left) if (right.has(term)) overlap += 1;
  return (2 * overlap) / (left.size + right.size);
}

function conceptDiceSimilarity(left, right) {
  const leftById = new Map(left.map((concept) => [concept.id, concept]));
  const rightById = new Map(right.map((concept) => [concept.id, concept]));
  const totalWeight = [...leftById.values(), ...rightById.values()]
    .reduce((sum, concept) => sum + concept.weight, 0);
  if (!totalWeight) return 0;

  const sharedWeight = [...leftById.keys()]
    .filter((id) => rightById.has(id))
    .reduce((sum, id) => sum + (Math.min(leftById.get(id).weight, rightById.get(id).weight) * 2), 0);
  const relatedWeight = CONCEPT_RELATIONSHIPS.reduce((sum, relationship) => {
    const direct = leftById.get(relationship.left) && rightById.get(relationship.right);
    const inverse = leftById.get(relationship.right) && rightById.get(relationship.left);
    if (!direct && !inverse) return sum;
    const source = direct ? leftById.get(relationship.left) : leftById.get(relationship.right);
    const target = direct ? rightById.get(relationship.right) : rightById.get(relationship.left);
    return sum + (Math.min(source.weight, target.weight) * relationship.weight * 2);
  }, 0);
  return Math.min(1, (sharedWeight + relatedWeight) / totalWeight);
}

function sharedConcepts(left, right) {
  const rightById = new Map(right.map((concept) => [concept.id, concept]));
  const leftById = new Map(left.map((concept) => [concept.id, concept]));
  const shared = left.filter((concept) => rightById.has(concept.id));

  for (const relationship of CONCEPT_RELATIONSHIPS) {
    const direct = leftById.has(relationship.left) && rightById.has(relationship.right);
    const inverse = leftById.has(relationship.right) && rightById.has(relationship.left);
    if (direct || inverse) shared.push({ id: `${relationship.left}:${relationship.right}`, label: relationship.label });
  }

  return shared;
}

function displayTerms(source, subject, commonTerms) {
  const rawWords = `${source.name ?? ''} ${source.description ?? ''} ${subject.name ?? ''}`
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

  return commonTerms.map((term) => rawWords.find((word) => normalizeTerms(word).includes(term)) ?? term)
    .slice(0, 4)
    .join(', ');
}

function workloadAssessment(sourceHours, targetHours) {
  return assessWorkload(sourceHours, targetHours);
}

export function assessWorkload(sourceHours, targetHours) {
  const validSource = Number.isFinite(sourceHours) && sourceHours >= 0;
  const validTarget = Number.isFinite(targetHours) && targetHours > 0;
  if (!validSource || !validTarget) {
    return {
      status: 'unknown',
      rule: 'A carga horária de origem deve ser ao menos 75% da carga horária da disciplina de destino.',
      minimumSourceHours: null
    };
  }

  const minimumSourceHours = targetHours * 0.75;
  return {
    status: sourceHours >= minimumSourceHours ? 'meets_minimum' : 'does_not_meet_minimum',
    rule: 'A carga horária de origem deve ser ao menos 75% da carga horária da disciplina de destino.',
    minimumSourceHours
  };
}

export function rankMatches(source, subjects, { limit = 8 } = {}) {
  if (!source || typeof source.name !== 'string' || !source.name.trim() || !Array.isArray(subjects)) return [];
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.min(20, Math.floor(limit))) : 8;
  if (!safeLimit) return [];

  const sourceName = source.name.trim();
  const sourceDescription = typeof source.description === 'string' ? source.description.trim() : '';
  const sourceNameTokens = uniqueTokens(sourceName);
  const sourceDescriptionTokens = uniqueTokens(sourceDescription);
  const sourceAllTokens = uniqueTokens(sourceName, sourceDescription);
  const sourceText = `${sourceName} ${sourceDescription}`.trim();
  const sourceConcepts = matchedConcepts(sourceText);
  const hasDescription = sourceDescriptionTokens.size > 0;
  const nameWeight = hasDescription ? 0.58 : 0.7;
  const descriptionWeight = hasDescription ? 0.12 : 0;
  const conceptsWeight = hasDescription ? 0.3 : 0.3;
  const nameForExactMatch = normalizeText(sourceName);

  return subjects
    .filter((subject) => subject && typeof subject.name === 'string' && subject.name.trim())
    .map((subject) => {
      const subjectName = subject.name.trim();
      const subjectTokens = uniqueTokens(subjectName);
      const subjectConcepts = matchedConcepts(subjectName);
      const commonTerms = [...sourceAllTokens].filter((term) => subjectTokens.has(term));
      const shared = sharedConcepts(sourceConcepts, subjectConcepts);
      const nameScore = diceSimilarity(sourceNameTokens, subjectTokens);
      const descriptionScore = hasDescription ? diceSimilarity(sourceDescriptionTokens, subjectTokens) : 0;
      const conceptScore = conceptDiceSimilarity(sourceConcepts, subjectConcepts);
      let rawSimilarity = (nameScore * nameWeight) + (descriptionScore * descriptionWeight) + (conceptScore * conceptsWeight);

      if (!hasDescription) rawSimilarity /= nameWeight + conceptsWeight;
      else rawSimilarity /= nameWeight + descriptionWeight + conceptsWeight;

      const exactTitleMatch = nameForExactMatch === normalizeText(subjectName);
      const hasDirectConceptMatch = shared.some((concept) => concept.id !== 'data' && !concept.id.includes(':'));
      const hasRelatedConceptMatch = shared.some((concept) => concept.id.includes(':'));
      const hasEnoughEvidence = hasDirectConceptMatch || commonTerms.length >= 2 || (hasRelatedConceptMatch && commonTerms.length > 0);
      if (!exactTitleMatch && !hasEnoughEvidence) return null;
      if (exactTitleMatch) rawSimilarity = 1;
      const similarity = Math.round(Math.max(0, Math.min(1, rawSimilarity)) * 100);
      if (similarity <= 0) return null;

      const reasons = [];
      if (exactTitleMatch) reasons.push('O nome da disciplina coincide diretamente.');
      if (commonTerms.length) reasons.push(`Termos em comum: ${displayTerms(source, subject, commonTerms)}.`);
      if (shared.length) {
        reasons.push(`Conceitos relacionados: ${shared.map((concept) => concept.label).join('; ')}.`);
      }
      if (!reasons.length) reasons.push('Há termos curriculares em comum.');

      return {
        subject,
        similarity,
        reasons,
        workload: workloadAssessment(source.workloadHours, subject.workloadHours)
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.similarity - left.similarity || left.subject.name.localeCompare(right.subject.name, 'pt-BR'))
    .slice(0, safeLimit);
}
