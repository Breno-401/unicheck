const STOP_WORDS = new Set([
  'a', 'as', 'ao', 'aos', 'aquela', 'aquele', 'aqueles', 'aquelas', 'com', 'como',
  'da', 'das', 'de', 'dela', 'delas', 'dele', 'deles', 'do', 'dos', 'e', 'em',
  'entre', 'essa', 'esse', 'esta', 'este', 'isso', 'isto', 'na', 'nas', 'no', 'nos',
  'o', 'os', 'ou', 'para', 'pela', 'pelas', 'pelo', 'pelos', 'por', 'que', 'se',
  'sem', 'sob', 'sua', 'suas', 'seu', 'seus', 'um', 'uma', 'umas', 'uns'
]);

function normalizePortugueseForm(term) {
  if (term.length <= 4) return term;
  if (term.endsWith('oes')) return `${term.slice(0, -3)}ao`;
  if (term.endsWith('ais')) return `${term.slice(0, -3)}al`;
  if (term.endsWith('eis')) return `${term.slice(0, -3)}el`;
  if (term.endsWith('s') && !term.endsWith('ss') && !term.endsWith('us')) return term.slice(0, -1);
  return term;
}

export function normalizeText(value) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function normalizeTerms(value) {
  const normalized = normalizeText(value);
  if (!normalized) return [];

  return [...new Set(normalized.split(' ')
    .filter((term) => term && !STOP_WORDS.has(term))
    .map(normalizePortugueseForm))];
}

export function phraseOccurs(text, phrase) {
  const normalizedText = normalizeText(text);
  const normalizedPhrase = normalizeText(phrase);
  if (!normalizedText || !normalizedPhrase) return false;
  return ` ${normalizedText} `.includes(` ${normalizedPhrase} `);
}
