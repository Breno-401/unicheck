# Desenho aprovado — polimento incremental do MVP

Data: 2026-09-13  
Branch autorizada: `integration/mvp-pre-release`  
HEAD auditado: `7683039d25b538a076dbcb40384cd108549547fc`

## Objetivo

Tornar a recompensa de XP perceptível, elegante e robusta, reforçando simultaneamente controles de segurança de baixo risco, acessibilidade, higiene de repositório e cobertura de testes. A identidade visual, o fluxo de autenticação atual e as regras de negócio permanecem preservados.

## Feedback de XP

O feedback terá duração visual de aproximadamente 1,7 segundo. O card de recompensa aparece imediatamente; a transferência começa cedo, usa apenas `transform` e `opacity` e calcula origem e destino com `getBoundingClientRect()` no instante do voo.

O destino será escolhido nesta ordem:

1. barra de XP visível na sidebar expandida;
2. indicador circular visível na sidebar recolhida;
3. barra/indicador da sidebar mobile quando o drawer estiver aberto;
4. indicador compacto e temporário no viewport quando a sidebar mobile estiver fechada.

Na chegada, o destino recebe um pulso discreto, o contador faz count-up e a barra progride suavemente. Eventos recebidos em uma janela curta serão agregados; durante uma animação ativa existirá no máximo um lote pendente agregado, evitando fila crescente e feedback obsoleto.

Resize, `pagehide` e navegação cancelam artefatos visuais com segurança e aplicam o estado final sem deixar partículas ou timers. Em `prefers-reduced-motion`, não haverá voo, trail ou escala: o valor e a barra serão atualizados imediatamente e um único status textual curto será anunciado.

O container genérico de progressão deixará de ser focável. A semântica ficará no `role=progressbar`, com valor e descrição acessíveis. O XP produzirá apenas um anúncio `aria-live`.

## Segurança incremental

- Reforçar `.gitignore` para ambientes, credenciais, chaves privadas, logs, caches, outputs, artefatos de teste, configurações locais de agentes/Codex e material privado de consulta, preservando exemplos seguros e formatos documentais oficiais.
- Impedir framing com `Content-Security-Policy: frame-ancestors 'none'` e `X-Frame-Options: DENY`.
- Fixar versões exatas de Supabase JS e Lucide. SRI será usado apenas após baixar exatamente o recurso referenciado, calcular SHA-384 e confirmar compatibilidade/CORS; na ausência dessa prova, a versão será fixada sem um hash inventado.
- Remover `console.log`/`console.info` de depuração e não registrar e-mail, RA, user id ou payload pessoal. Logs de erro necessários permanecem concisos e sem dados pessoais desnecessários.
- O fluxo de Auth não será migrado para PKCE nesta rodada.

## Documentação oficial e contexto local

A auditoria separa conteúdo pelo propósito, não apenas pela extensão. `docs/architecture/`, `docs/audits/`, `docs/development/` e `docs/plans/` permanecem versionados: descrevem arquitetura, banco, decisões, testes e histórico técnico deliberadamente referenciados pelo README ou pela documentação atual. PDFs, DOCX, pesquisas-fonte, capturas, prompts, extrações e resultados locais ficam em `private-context/`, `tmp/`, `docs/local/`, `docs/context/` ou `.local-context/`, com sufixos `*.local.pdf`/`*.local.docx` disponíveis quando o arquivo precisa permanecer fora de uma pasta dedicada.

Nenhum documento local do HEAD atual precisa ser removido do índice. Arquivos locais ignorados serão preservados fisicamente. O relatório registrará separadamente os PDFs encontrados apenas no histórico, sua alcançabilidade por refs locais/remotas e o nível de sensibilidade observado, sem reescrever histórico ou excluir branches.

## Migration Supabase preparada, não aplicada

Uma nova migration aditiva e não destrutiva deverá:

- limitar objetos do bucket `avatars` ao nome canônico `<auth.uid()>/avatar.webp` em SELECT/INSERT/UPDATE/DELETE;
- adicionar checks de tamanho para `user_activity.context` e `metadata` sem invalidar dados antigos durante a instalação;
- manter no máximo 100 atividades por usuário por trigger serializada;
- limitar `user_notifications.destination` e manter no máximo 100 notificações por usuário por trigger serializada;
- usar funções `SECURITY DEFINER` com `search_path` vazio, objetos qualificados e execução revogada de papéis públicos.

A migration ficará somente no repositório. A validação e aplicação remota serão passos manuais posteriores.

## Fora de escopo nesta rodada

- Migração Auth para PKCE/callback, pois exige URL de redirect permitida e coordenação com o projeto Supabase remoto.
- RPCs exclusivas para atividades/notificações e catálogo canônico de benefícios, que exigem alteração arquitetural maior.
- Redesign geral das telas.
- Exclusão ou recompressão em massa de assets históricos sem confirmação de uso e identidade visual.

## Verificação

A implementação preservará os 125 testes Node existentes e repetirá toda a baseline: referências locais, 32 verificações responsivas, 101 verificações de layout e 72 cenários do checklist. Haverá uma suíte de navegador dedicada ao XP cobrindo fluxo normal, eventos consecutivos, sidebar expandida/recolhida, mobile, reduced motion e cancelamento por resize/navegação.
