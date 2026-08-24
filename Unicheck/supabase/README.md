# Supabase do UniCheck

Esta pasta é a fonte versionada das alterações do banco. Mudanças feitas diretamente no painel do Supabase devem ser reproduzidas aqui antes de serem consideradas concluídas.

## Antes de aplicar

1. Faça um backup ou confirme que existe uma restauração disponível.
2. Execute primeiro as consultas de inventário no SQL Editor para comparar tabelas, colunas, constraints e policies existentes.
3. Não remova tabelas ou dados durante a consolidação.
4. Aplique os arquivos inicialmente em um projeto de desenvolvimento, quando disponível.

## Ordem planejada

1. Confirmar as tabelas estruturais `checklists`, `checklist_items` e `users_profile`.
2. Executar `checklist_progress_and_seed.sql`.
3. Executar `users_profile_policies.sql`.
4. Executar `20260816_create_user_activity.sql`.
5. Executar `20260816_create_user_notifications.sql`.
6. Executar `20260816_create_user_platform_favorites.sql`.
7. Executar `checklist_rls_policies.sql`.
8. Executar `20260824_consolidate_legacy_schema.sql`.
9. Validar os acessos com dois usuários diferentes.

Os scripts de políticas usam `drop policy if exists` seguido de `create policy`, permitindo reaplicação controlada. A consolidação migra dados ainda exclusivos das tabelas antigas, desativa o acesso delas pela Data API e mantém seus registros para verificação; nenhuma tabela ou linha é apagada.

## Regras de segurança

- O navegador usa somente a chave pública `anon/publishable`.
- A chave `service_role` nunca deve aparecer no frontend ou no repositório.
- Toda tabela com dados do aluno deve ter RLS habilitado.
- Policies de dados pessoais devem comparar `auth.uid()` com `user_id`.
- Definições de checklist são somente leitura para usuários autenticados.
- Notificações permitem ao cliente atualizar apenas a coluna `read`.
- Atividades não podem ser alteradas ou apagadas pelo cliente.
- Favoritos não aceitam atualização: o cliente insere ou remove a chave composta.

## Validação funcional mínima

- Usuário A não consegue consultar ou alterar dados do usuário B.
- Logout seguido de login em outra conta não reaproveita dados remotos da conta anterior.
- Progresso, favoritos e perfil reaparecem em outro navegador após login.
- Fila local pendente não sobrescreve uma intenção mais recente.
- Reexecutar as migrations não cria duplicatas nem falha por policies existentes.
