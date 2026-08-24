# Supabase do UniCheck

Esta pasta é a fonte versionada do banco do MVP. O projeto remoto atual contém somente dados de desenvolvimento, portanto o baseline de pré-release prioriza um schema canônico limpo em vez de migrar registros antigos.

## Arquivos ativos

1. `00_inventory.sql`: inventário somente leitura antes de qualquer alteração.
2. `checklist_progress_and_seed.sql`: reconciliação opcional das 7 fases e 28 itens estruturais.
3. `20260824_prerelease_reset.sql`: reset canônico dos dados de usuário, RLS, grants, triggers, índices e bucket de avatar.
4. `20260824_post_reset_validation.sql`: validações somente leitura após o reset.
5. `AUDIT_2026-08-24.md`: achados, decisões e critérios de aceite.

## O que o reset remove

`20260824_prerelease_reset.sql` é destrutivo de forma intencional:

- remove `progresso_item_checklist`, `notificacoes` e `user_progress`;
- recria vazias `users_profile`, `user_checklist_item_progress`, `user_activity`, `user_notifications` e `user_platform_favorites`;
- não remove contas de `auth.users`;
- não remove nem limpa `checklists` ou `checklist_items`;
- não executa migração ou reconciliação de dados antigos.

## Estado do projeto remoto

O reset e a validação abaixo já foram executados em 2026-08-24. A ordem permanece documentada para reconstrução de um ambiente limpo, não para ser repetida automaticamente no projeto atual.

## Ordem de reconstrução

1. Executar `00_inventory.sql`.
2. Confirmar que existem 7 `checklists` e 28 `checklist_items`.
3. Executar `checklist_progress_and_seed.sql` somente se a estrutura dos checklists precisar ser reconciliada.
4. Executar `20260824_prerelease_reset.sql` em uma única operação.
5. Executar `20260824_post_reset_validation.sql`.
6. Reexecutar os Advisors de segurança e desempenho.
7. Ativar a proteção contra senhas vazadas em Auth quando o projeto estiver no plano Pro.
8. Criar uma conta nova e executar o roteiro funcional abaixo.

## Roteiro obrigatório com uma conta nova

1. cadastro;
2. criação automática de `users_profile`;
3. login;
4. checklist inicialmente limpo;
5. marcar e desmarcar tarefas;
6. atualizar a página e confirmar persistência;
7. confirmar atividade recente;
8. confirmar notificações;
9. adicionar e remover favorito;
10. editar nome e avatar;
11. logout;
12. novo login;
13. confirmar restauração dos dados.

Depois, usar uma segunda conta para confirmar que nenhum dado da primeira pode ser lido ou alterado. Esse roteiro A/B foi executado após o reset e está registrado em `AUDIT_2026-08-24.md`.

## Segurança esperada

- o navegador utiliza somente a chave pública;
- nenhuma chave `service_role` pertence ao frontend;
- tabelas pessoais usam RLS com `(select auth.uid())`;
- `users_profile.id` é a FK para `auth.users.id`;
- o trigger `on_auth_user_created` cria o perfil de novas contas;
- notificações permitem ao cliente atualizar apenas `read`;
- atividades permitem apenas `SELECT` e `INSERT`;
- favoritos permitem `SELECT`, `INSERT` e `DELETE`;
- definições de checklist são somente leitura;
- avatares ficam no bucket `avatars`, com escrita isolada pela pasta do usuário.

## Frontend e Netlify

A URL e a chave pública do Supabase permanecem em `js/config.js`. A verificação `node scripts/check-local-references.mjs` finaliza sem referências quebradas na branch consolidada. O próximo passo de entrega é gerar um deploy de preview no Netlify e repetir o smoke test no domínio definitivo.
