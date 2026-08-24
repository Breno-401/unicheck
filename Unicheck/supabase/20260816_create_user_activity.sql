begin;

create extension if not exists pgcrypto;

create table if not exists public.user_activity (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    type text not null check (char_length(type) between 1 and 80),
    title text not null check (char_length(title) between 1 and 500),
    context text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists user_activity_user_created_at_idx
    on public.user_activity (user_id, created_at desc);

alter table public.user_activity enable row level security;

drop policy if exists "Users can read their own activity" on public.user_activity;
create policy "Users can read their own activity"
on public.user_activity
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own activity" on public.user_activity;
create policy "Users can insert their own activity"
on public.user_activity
for insert
to authenticated
with check (auth.uid() = user_id);

revoke all on table public.user_activity from anon;
revoke update, delete, truncate, references, trigger on table public.user_activity from authenticated;
grant select, insert on table public.user_activity to authenticated;

commit;
