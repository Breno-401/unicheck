-- Consolidate legacy UniCheck tables without deleting historical data.
-- Run after the canonical user_* tables exist.

begin;

-- Preserve legacy progress only when the canonical table has no row yet.
-- Existing canonical rows are newer and remain the source of truth.
insert into public.user_checklist_item_progress (
    user_id,
    checklist_id,
    checklist_item_id,
    completed,
    created_at,
    updated_at
)
select
    legacy.usuario_id,
    legacy.checklist_id,
    legacy.item_id,
    legacy.concluido,
    legacy.criado_em,
    legacy.atualizado_em
from public.progresso_item_checklist legacy
on conflict (user_id, checklist_item_id) do nothing;

-- Move legacy notifications into the durable notification model.
-- The semantic key makes the operation idempotent.
insert into public.user_notifications (
    id,
    user_id,
    event_key,
    type,
    title,
    message,
    destination,
    read,
    created_at
)
select
    gen_random_uuid(),
    legacy.usuario_id,
    'legacy_notification:' || legacy.id::text,
    coalesce(nullif(trim(legacy.tipo), ''), 'info'),
    legacy.titulo,
    legacy.mensagem,
    null,
    legacy.lida,
    legacy.criado_em
from public.notificacoes legacy
on conflict (user_id, event_key) do nothing;

-- Legacy tables remain available to administrators for verification,
-- but are no longer exposed through the anon/authenticated Data API.
alter table public.notificacoes enable row level security;
alter table public.progresso_item_checklist enable row level security;
alter table public.user_progress enable row level security;

revoke all on public.notificacoes from anon, authenticated;
revoke all on public.progresso_item_checklist from anon, authenticated;
revoke all on public.user_progress from anon, authenticated;

comment on table public.notificacoes is
    'LEGACY: migrated to user_notifications; retained temporarily for verification.';
comment on table public.progresso_item_checklist is
    'LEGACY: migrated to user_checklist_item_progress; retained temporarily for verification.';
comment on table public.user_progress is
    'LEGACY: replaced by user_checklist_item_progress; retained temporarily for verification.';

commit;
