-- Durable, idempotent notifications for each authenticated user.
-- Safe to run repeatedly.

create table if not exists public.user_notifications (
    id uuid primary key,
    user_id uuid not null references auth.users (id) on delete cascade,
    event_key text not null,
    type text not null,
    title text not null,
    message text not null,
    target text,
    read boolean not null default false,
    created_at timestamptz not null default now(),
    constraint user_notifications_user_event_key_unique unique (user_id, event_key)
);

create index if not exists user_notifications_user_created_at_idx
    on public.user_notifications (user_id, created_at desc);

create index if not exists user_notifications_user_unread_idx
    on public.user_notifications (user_id, read, created_at desc);

alter table public.user_notifications enable row level security;

drop policy if exists "user_notifications_select_own" on public.user_notifications;
create policy "user_notifications_select_own"
on public.user_notifications
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_notifications_insert_own" on public.user_notifications;
create policy "user_notifications_insert_own"
on public.user_notifications
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_notifications_update_read_own" on public.user_notifications;
create policy "user_notifications_update_read_own"
on public.user_notifications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

revoke update, delete on public.user_notifications from authenticated;
grant select, insert on public.user_notifications to authenticated;
grant update (read) on public.user_notifications to authenticated;
