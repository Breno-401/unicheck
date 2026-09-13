# Plano de implementação — polimento incremental do MVP

> **Spec:** `docs/plans/2026-09-13-mvp-pre-release-polish-design.md`

## Global Constraints

- Trabalhar exclusivamente em `integration/mvp-pre-release`, partindo de `7683039d25b538a076dbcb40384cd108549547fc`.
- Não criar branch/worktree, não tocar na `main`, não fazer merge, rebase ou push.
- Preservar o fluxo atual de login/confirmação; não migrar Auth para PKCE.
- Não aplicar migrations ou qualquer mudança em Supabase/Netlify remoto.
- Não fazer redesign geral; somente mudanças incrementais ligadas aos achados aprovados.
- Todo comportamento novo ou corrigido deve seguir RED → GREEN → REFACTOR e registrar o comando de teste no relatório da tarefa.
- SRI somente pode ser adicionado para bytes de recurso exatos, estáveis, cujo SHA-384 foi calculado e cuja carga foi verificada.
- Commits devem ser pequenos, semânticos e permanecer somente na branch autorizada.

## Task 1: Implementar o novo feedback de XP com testes de navegador

**Ownership:** `Unicheck/platform/shared/js/progression-ui.js`, `Unicheck/platform/shared/css/layout/ui-polish.css`, `tests/checklist-player-browser-test.html`, novo `tests/xp-feedback.browser.cjs` e, somente se necessário, `scripts/test-checklist-browser.cjs`.

1. Antes da implementação, criar testes de navegador que falhem por ausência dos comportamentos aprovados: início antecipado, destino expandido, destino recolhido, indicador mobile, agregação limitada, reduced motion, cleanup em resize e pagehide/navegação.
2. Executar a nova suíte e registrar o RED esperado.
3. Refatorar o controlador de feedback para lotes agregados com no máximo um lote ativo e um pendente.
4. Implementar timeline aproximada de 1,7 s, transferência por WAAPI com `transform`/`opacity`, destino dinâmico e pulso/count-up/barra na chegada.
5. Implementar indicador mobile temporário quando o drawer estiver fechado.
6. Implementar cleanup idempotente em resize/pagehide e estado final consistente.
7. Implementar reduced motion sem deslocamento e com um único anúncio.
8. Remover `tabIndex` do wrapper genérico e manter semântica acessível no progressbar.
9. Executar a nova suíte até GREEN e depois `node --test tests/*.test.cjs`.
10. Commit esperado: `feat: aprimorar feedback visual de xp`.

## Task 2: Reforçar deploy, dependências e higiene do repositório

**Ownership:** `.gitignore`, `netlify.toml`, todos os sete HTMLs que carregam Supabase JS/Lucide e novo `tests/security-hardening.test.cjs`.

1. Criar primeiro testes que falhem quando páginas de produção usam `@latest`, versão major-only, recurso divergente do hash aprovado ou quando headers anti-framing estão ausentes.
2. Executar o teste e registrar o RED.
3. Fixar versões exatas compatíveis de Supabase JS e Lucide em todas as páginas.
4. Calcular SRI SHA-384 a partir dos bytes exatos. Aplicar `integrity` e `crossorigin=anonymous` somente se a carga real permanecer compatível; caso contrário, manter somente pin exato e registrar a limitação.
5. Adicionar `frame-ancestors 'none'` e `X-Frame-Options: DENY` sem impor uma CSP geral incompatível com os scripts atuais.
6. Reforçar `.gitignore` sem ignorar arquivos necessários do projeto.
7. Executar os testes de hardening, referências locais e testes Node.
8. Commit esperado: `fix: reforcar seguranca de configuracoes`.

## Task 3: Remover logs de depuração e dados pessoais do console

**Ownership:** JavaScript de produção sob `Unicheck/`, com foco em `js/core/auth.js`, `js/services/profile.js` e `platform/shared/js/platform-shell.js`; atualizar `tests/security-hardening.test.cjs`.

1. Adicionar teste que falhe para `console.log`/`console.info` de produção e para logs explícitos de e-mail/RA/user id em snapshots de autenticação/perfil.
2. Executar e registrar o RED.
3. Remover mensagens puramente diagnósticas e sanitizar logs de erro que carreguem dados pessoais desnecessários.
4. Manter apenas warnings/errors operacionais úteis e sem payloads sensíveis.
5. Executar os testes de hardening e todos os testes Node.
6. Commit esperado: `fix: remover logs de depuracao do cliente`.

## Task 4: Preparar hardening não destrutivo do Supabase

**Ownership:** nova migration em `Unicheck/supabase/migrations/` e novo diagnóstico complementar em `Unicheck/supabase/diagnostics/`; testes existentes de contrato Supabase somente se houver harness apropriado.

1. Criar migration aditiva para nome canônico de avatar, checks de payload e retenção de 100 registros por usuário para atividades/notificações.
2. Usar `NOT VALID` nos novos checks que poderiam encontrar dados antigos; novos inserts ficam protegidos sem apagar ou alterar linhas existentes.
3. Serializar a retenção por usuário com advisory lock transacional e executar a limpeza após inserts.
4. Usar funções trigger `SECURITY DEFINER`, `search_path=''`, nomes qualificados e revogar EXECUTE de `PUBLIC`, `anon` e `authenticated`.
5. Criar diagnóstico read-only que liste violações pré-existentes, contagens acima do limite e definições/policies relevantes.
6. Não executar migration nem diagnóstico em ambiente remoto.
7. Executar testes Node e referência local; revisar SQL estaticamente.
8. Commit esperado: `fix: preparar limites de recursos no supabase`.

## Task 5: Incluir a suíte Node no CI

**Ownership:** `.github/workflows/repository-integrity.yml`.

1. Preservar Node 20 e a verificação de referências existente.
2. Adicionar `node --test tests/*.test.cjs` como etapa obrigatória, sem introduzir package manager ou nova infraestrutura.
3. Executar localmente os mesmos dois comandos.
4. Commit esperado: `ci: executar testes node na integridade`.

## Verificação final e revisão

1. Executar `node --test tests/*.test.cjs` e comparar com 125/125.
2. Executar `node scripts/check-local-references.mjs`.
3. Executar `node tests/visual-refinement.browser.cjs` e confirmar 32 verificações.
4. Executar `node tests/manual-avatar.browser.cjs` e confirmar 101 verificações.
5. Executar `node scripts/test-checklist-browser.cjs` com `NODE_PATH=private-context/browser/node_modules` e confirmar 72 cenários.
6. Executar `node tests/xp-feedback.browser.cjs` com o mesmo `NODE_PATH` e registrar a quantidade nova.
7. Fazer revisão final do diff completo desde `7683039d` e confirmar branch/status/commits.
