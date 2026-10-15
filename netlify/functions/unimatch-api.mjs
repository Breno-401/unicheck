import { getCurriculumById, getCurriculumCatalog } from '../../Unicheck/unimatch/data/curricula.mjs';
import { rankMatches } from '../../Unicheck/unimatch/domain/matcher.mjs';

const MAX_BODY_BYTES = 64 * 1024;
const MAX_DISCIPLINES = 10;
const MAX_NAME_LENGTH = 160;
const MAX_DESCRIPTION_LENGTH = 2000;
const DISCLAIMER = 'As sugestões usam correspondência textual e conceitual heurística. Não substituem a análise e aprovação oficial da instituição de ensino.';

export const config = {
  path: ['/api/unimatch/catalog', '/api/unimatch/match']
};

function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-content-type-options': 'nosniff',
      ...headers
    }
  });
}

function errorResponse(status, code, message, headers = {}) {
  return jsonResponse({ error: { code, message } }, status, headers);
}

function validateDiscipline(item, index) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return { error: `A disciplina ${index + 1} está inválida.` };
  }

  if (typeof item.name !== 'string' || item.name.trim().length < 2 || item.name.trim().length > MAX_NAME_LENGTH) {
    return { error: `Informe o nome da disciplina ${index + 1} com até ${MAX_NAME_LENGTH} caracteres.` };
  }

  const description = item.description === undefined || item.description === null ? '' : item.description;
  if (typeof description !== 'string' || description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: `A descrição da disciplina ${index + 1} deve ter até ${MAX_DESCRIPTION_LENGTH} caracteres.` };
  }

  const workloadHours = item.workloadHours === undefined || item.workloadHours === null || item.workloadHours === ''
    ? null
    : item.workloadHours;
  if (workloadHours !== null && (!Number.isFinite(workloadHours) || workloadHours <= 0 || workloadHours > 2000)) {
    return { error: `A carga horária da disciplina ${index + 1} deve ser maior que 0 e no máximo 2000.` };
  }

  return {
    value: {
      name: item.name.trim(),
      description: description.trim(),
      workloadHours
    }
  };
}

async function readJsonBody(request) {
  const contentType = request.headers.get('content-type') ?? '';
  if (!/^application\/(?:[a-z0-9.+-]+\+)?json(?:\s*;|\s*$)/i.test(contentType)) {
    return { response: errorResponse(415, 'UNSUPPORTED_MEDIA_TYPE', 'Envie a consulta como JSON.') };
  }

  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return { response: errorResponse(413, 'PAYLOAD_TOO_LARGE', 'A consulta ultrapassa o tamanho permitido.') };
  }

  const reader = request.body?.getReader();
  const chunks = [];
  let totalBytes = 0;
  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.byteLength;
        if (totalBytes > MAX_BODY_BYTES) {
          await reader.cancel();
          return { response: errorResponse(413, 'PAYLOAD_TOO_LARGE', 'A consulta ultrapassa o tamanho permitido.') };
        }
        chunks.push(value);
      }
    } catch {
      return { response: errorResponse(400, 'INVALID_JSON', 'Não foi possível ler o conteúdo da consulta.') };
    }
  }

  const bodyBytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const rawBody = new TextDecoder().decode(bodyBytes);

  try {
    return { value: JSON.parse(rawBody) };
  } catch {
    return { response: errorResponse(400, 'INVALID_JSON', 'O conteúdo da consulta não é um JSON válido.') };
  }
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { error: 'O corpo da consulta deve ser um objeto JSON.' };
  }

  if (typeof payload.curriculumId !== 'string' || !/^[a-z0-9-]{3,100}$/i.test(payload.curriculumId)) {
    return { error: 'Selecione uma matriz curricular válida.' };
  }

  if (!Array.isArray(payload.disciplines) || payload.disciplines.length < 1 || payload.disciplines.length > MAX_DISCIPLINES) {
    return { error: `Informe entre 1 e ${MAX_DISCIPLINES} disciplinas cursadas.` };
  }

  const disciplines = [];
  for (let index = 0; index < payload.disciplines.length; index += 1) {
    const result = validateDiscipline(payload.disciplines[index], index);
    if (result.error) return result;
    disciplines.push(result.value);
  }

  return { value: { curriculumId: payload.curriculumId, disciplines } };
}

export default async function handler(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');

  if (path === '/api/unimatch/catalog') {
    if (request.method !== 'GET') {
      return errorResponse(405, 'METHOD_NOT_ALLOWED', 'Use GET para consultar as matrizes.', { allow: 'GET' });
    }
    return jsonResponse({ curricula: getCurriculumCatalog() }, 200, {
      'cache-control': 'public, max-age=900, stale-while-revalidate=3600'
    });
  }

  if (path !== '/api/unimatch/match') {
    return errorResponse(404, 'ROUTE_NOT_FOUND', 'Endpoint UniMatch não encontrado.');
  }
  if (request.method !== 'POST') {
    return errorResponse(405, 'METHOD_NOT_ALLOWED', 'Use POST para enviar uma consulta.', { allow: 'POST' });
  }

  const bodyResult = await readJsonBody(request);
  if (bodyResult.response) return bodyResult.response;

  const validation = validatePayload(bodyResult.value);
  if (validation.error) return errorResponse(400, 'INVALID_REQUEST', validation.error);

  const curriculum = getCurriculumById(validation.value.curriculumId);
  if (!curriculum) return errorResponse(404, 'CURRICULUM_NOT_FOUND', 'A matriz selecionada não está no catálogo público mapeado.');

  const analyses = validation.value.disciplines.map((discipline) => ({
    sourceDiscipline: discipline,
    matches: rankMatches(discipline, curriculum.subjects).map((match) => ({
      subject: match.subject,
      similarity: match.similarity,
      similarityType: 'heuristic',
      reasons: match.reasons,
      workload: match.workload
    }))
  }));

  return jsonResponse({
    curriculum: {
      id: curriculum.id,
      program: curriculum.program,
      modality: curriculum.modality,
      version: curriculum.version,
      sourceUrl: curriculum.sourceUrl,
      coverage: curriculum.coverage
    },
    engine: {
      type: 'lexical_semantic_heuristic',
      version: '1.0.0',
      label: 'Sugestões por similaridade textual e conceitual'
    },
    disclaimer: DISCLAIMER,
    analyses
  }, 200, { 'cache-control': 'no-store' });
}
