begin;

create table if not exists public.user_platform_favorites (
    user_id uuid not null references auth.users (id) on delete cascade,
    platform_id text not null check (char_length(platform_id) between 1 and 120),
    created_at timestamptz not null default now(),
    primary key (user_id, platform_id)
);

alter table public.user_platform_favorites enable row level security;

drop policy if exists "Users can read their own platform favorites" on public.user_platform_favorites;
create policy "Users can read their own platform favorites"
on public.user_platform_favorites for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own platform favorites" on public.user_platform_favorites;
create policy "Users can insert their own platform favorites"
on public.user_platform_favorites for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own platform favorites" on public.user_platform_favorites;
create policy "Users can delete their own platform favorites"
on public.user_platform_favorites for delete to authenticated
using (auth.uid() = user_id);

revoke all on table public.user_platform_favorites from anon;
revoke all on table public.user_platform_favorites from authenticated;
grant select, insert, delete on table public.user_platform_favorites to authenticated;

commit;
