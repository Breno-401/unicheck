# Auditoria de contexto local e histórico

Data: 2026-09-13

Branch auditada: `integration/mvp-pre-release`

Base de trabalho: `60aa956` (`ci: executar testes node na integridade`)

Este registro documenta a separação entre documentação oficial versionada, material local de apoio e arquivos que aparecem somente no histórico. A auditoria foi somente leitura: não houve apagamento de arquivos, remoção de refs, reescrita de histórico ou aplicação de alterações remotas.

## Contexto local

O contexto gerado por navegador e por ferramentas de apoio permanece no computador, fora do conteúdo oficial do projeto:

- `private-context/browser/`: pasta comum que contém o contexto do runtime Playwright; o junction exato é `private-context/browser/node_modules`, apontando para as dependências compartilhadas;
- `private-context/browser-qa/`: capturas e JSON de QA (24 arquivos);
- `private-context/checklist-browser/`: capturas e resultados de checklist (114 arquivos);
- `tmp/`: extrações, renderizações, patches, logs e harnesses transitórios (39 arquivos);
- `.superpowers/sdd/`: briefs e relatórios internos de execução (contagem omitida, pois é um snapshot volátil do pacote de auditoria).

Os diretórios `docs/local/`, `docs/context/` e `.local-context/` são convenções reservadas para futuras fontes locais; não existem no checkout auditado. IDEs, agentes e configurações locais seguem as convenções já existentes para `.idea/`, `.codex/` e `.agents/`.

Não são publicados neste relatório conteúdos, capturas, prompts, extrações ou identificadores pessoais; as contagens acima servem apenas para tornar a auditoria verificável.

## Documentação oficial versionada

Os Markdown abaixo permanecem no índice porque descrevem o sistema ou registram decisões deliberadas que são úteis para manutenção:

- `docs/architecture/`: arquitetura e comportamento efetivo da aplicação, incluindo fluxos, persistência e pontos de atenção;
- `docs/audits/`: auditorias, evidências, decisões e critérios de aceite;
- `docs/development/`: notas técnicas, validações, testes manuais e histórico editorial que ainda orientam o código;
- `docs/plans/`: desenho e plano da rodada de pré-release, incluindo escopo, restrições e verificações;
- `README.md`: entrada de descoberta do repositório, desenvolvimento local e validação;
- `Unicheck/supabase/README.md`: ordem de reconstrução, limites de segurança e roteiro de validação do banco.

Esses documentos não são fontes brutas locais: são referências versionadas, deliberadamente ligadas à arquitetura, ao banco, à execução e à manutenção. Um documento auxiliar pode conter uma descrição histórica mais antiga; isso deve ser corrigido em mudança própria, sem confundir sua função oficial com material privado de consulta.

## Regras de separação

As convenções locais já presentes cobrem:

- `private-context/`, `tmp/`, `.superpowers/`;
- `/docs/checklist-academico-pesquisa.pdf`;
- `docs/local/`, `docs/context/`, `.local-context/`;
- `*.local.pdf`, `*.local.docx` e `*.local.md`;
- `.codex/` e `.agents/`.

Não há globais `*.pdf` ou `*.docx`: documentos oficiais nesses formatos continuam elegíveis a versionamento quando explicitamente necessários. As regras de `.gitignore` pertencem à Task 2 e não foram alteradas nesta tarefa.

## Índice atual e confirmação local

`git ls-files` não encontrou PDF, DOCX, PPTX, ODT ou RTF nem caminhos sob `private-context/`, `tmp/`, `.superpowers/`, `docs/local/`, `docs/context/` ou `.local-context/`. Portanto:

- não há arquivo de contexto local atualmente rastreado;
- não houve remoção apenas do índice (`git rm --cached`) nesta rodada;
- nenhum material local foi apagado: os diretórios locais existentes continuam presentes, e os arquivos históricos não existem como arquivos do checkout atual.

`git check-ignore -v` confirmou as regras para caminhos existentes como `private-context/`, `tmp/`, `.superpowers/`, `/docs/checklist-academico-pesquisa.pdf`, `*.local.pdf` e `*.local.docx`. Os probes documentados para `docs/local/probe.md`, `docs/context/probe.md` e `.local-context/probe.md` são hipotéticos: retornam as regras correspondentes tanto com quanto sem `--no-index`. Essa opção manda ignorar o índice e permite avaliar também caminhos rastreados conforme a semântica do Git; em ambos os modos, a evidência confirma que as três convenções estão cobertas.

## PDFs somente no histórico

| Documento | Commit de adição | Refs que ainda alcançam | Classificação |
|---|---|---|---|
| `docs/checklist-academico-pesquisa.pdf` | `1106b1f2c1c0a22c8295ad6af23880cfb3baa7d1` | `backup/integration-pre-rewrite-bcb0850` | Contexto local potencialmente sensível |
| `Unicheck/manual do aluno pdf/UNISALES_Manual-do-aluno-2024.pdf` | `1409bcedbe4831651e1ac607bf05e02d6ed83d4b` | `backup/frontend-bonito-20260824`, `origin/backup/frontend-bonito-20260824` | Referência institucional comum |

O primeiro é um documento interno de 43 páginas. A extração auditada encontrou zero e-mails e zero números pessoais longos, mas há claims operacionais potencialmente sensíveis sobre autenticação institucional (por exemplo, formato/primeira senha) e referências a capturas. Ele deve ser tratado como contexto local potencialmente sensível, não como segredo comprovado. Não houve inspeção visual integral do binário histórico nesta rodada.

Não há ref remota atual contendo o primeiro PDF; isso não prova que ele nunca tenha sido público nem que eventual histórico de publicação apagado não exista. O manual institucional de 51 páginas não apresentou e-mails, números pessoais longos ou segredo comprovado na extração auditada; sua ref remota de backup continua tornando-o disponível nesse histórico.

Não é indicada limpeza emergencial sem evidência de segredo. Se a política exigir ou nova inspeção identificar PII/segredo real, a resposta deve ser opt-in e coordenada: avaliar `git filter-repo`, force-push e expiração de refs, além de rotação de credenciais quando aplicável.

## Verificações executadas

Comandos read-only usados para esta auditoria:

```text
git ls-files
git check-ignore -v -- <caminhos auditados>
Test-Path <diretórios e PDFs auditados>
Get-ChildItem -Recurse -File <diretórios locais> (contagem)
git log --all -- <PDFs históricos>
git for-each-ref --contains <commits de adição>
```

As verificações automatizadas da tarefa são registradas após a execução: `node --test tests/*.test.cjs`, `node scripts/check-local-references.mjs` e as suítes de navegador previstas no plano.
