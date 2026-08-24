begin;

create extension if not exists pgcrypto;

create table if not exists public.user_notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    event_key text not null check (char_length(event_key) between 1 and 180),
    type text not null check (char_length(type) between 1 and 80),
    title text not null check (char_length(title) between 1 and 300),
    message text not null check (char_length(message) between 1 and 1000),
    destination text,
    read boolean not null default false,
    created_at timestamptz not null default now(),
    unique (user_id, event_key)
);

create index if not exists user_notifications_user_created_at_idx
    on public.user_notifications (user_id, created_at desc);

alter table public.user_notifications enable row level security;

drop policy if exists "Users can read their own notifications" on public.user_notifications;
create policy "Users can read their own notifications"
on public.user_notifications for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own notifications" on public.user_notifications;
create policy "Users can insert their own notifications"
on public.user_notifications for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can mark their own notifications as read" on public.user_notifications;
create policy "Users can mark their own notifications as read"
on public.user_notifications for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id and read = true);

revoke all on table public.user_notifications from anon;
revoke all on table public.user_notifications from authenticated;
grant select, insert on table public.user_notifications to authenticated;
grant update (read) on table public.user_notifications to authenticated;

commit;
