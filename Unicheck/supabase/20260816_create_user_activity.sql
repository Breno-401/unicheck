-- Activity history persisted per authenticated user.
-- Safe to run repeatedly.

create table if not exists public.user_activity (
    id uuid primary key,
    user_id uuid not null references auth.users (id) on delete cascade,
    type text not null,
    title text not null,
    context text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists user_activity_user_created_at_idx
    on public.user_activity (user_id, created_at desc);

alter table public.user_activity enable row level security;

drop policy if exists "user_activity_select_own" on public.user_activity;
create policy "user_activity_select_own"
on public.user_activity
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_activity_insert_own" on public.user_activity;
create policy "user_activity_insert_own"
on public.user_activity
for insert
to authenticated
with check (auth.uid() = user_id);

revoke update, delete on public.user_activity from authenticated;
grant select, insert on public.user_activity to authenticated;
