-- Account-scoped platform favorites.

create table if not exists public.user_platform_favorites (
    user_id uuid not null references auth.users (id) on delete cascade,
    platform_id text not null,
    created_at timestamptz not null default now(),
    primary key (user_id, platform_id),
    constraint user_platform_favorites_platform_id_not_blank
        check (length(trim(platform_id)) > 0)
);

create index if not exists user_platform_favorites_user_created_at_idx
    on public.user_platform_favorites (user_id, created_at desc);

alter table public.user_platform_favorites enable row level security;

drop policy if exists "Users can read their own platform favorites" on public.user_platform_favorites;
drop policy if exists "Users can insert their own platform favorites" on public.user_platform_favorites;
drop policy if exists "Users can delete their own platform favorites" on public.user_platform_favorites;
drop policy if exists "user_platform_favorites_select_own" on public.user_platform_favorites;
drop policy if exists "user_platform_favorites_insert_own" on public.user_platform_favorites;
drop policy if exists "user_platform_favorites_delete_own" on public.user_platform_favorites;

create policy "user_platform_favorites_select_own"
on public.user_platform_favorites
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "user_platform_favorites_insert_own"
on public.user_platform_favorites
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "user_platform_favorites_delete_own"
on public.user_platform_favorites
for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.user_platform_favorites from anon;
revoke all on public.user_platform_favorites from authenticated;
grant select, insert, delete on public.user_platform_favorites to authenticated;
