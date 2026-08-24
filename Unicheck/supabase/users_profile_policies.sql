-- RLS policies for account-scoped profile data.
-- users_profile.id is both the primary key and the reference to auth.users.id.

alter table public.users_profile enable row level security;

drop policy if exists "Users can view own profile" on public.users_profile;
drop policy if exists "Users can update own profile" on public.users_profile;
drop policy if exists "users_profile_select_own" on public.users_profile;
drop policy if exists "users_profile_insert_own" on public.users_profile;
drop policy if exists "users_profile_update_own" on public.users_profile;

create policy "users_profile_select_own"
on public.users_profile
for select
to authenticated
using (id = auth.uid());

create policy "users_profile_insert_own"
on public.users_profile
for insert
to authenticated
with check (id = auth.uid());

create policy "users_profile_update_own"
on public.users_profile
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

revoke all on public.users_profile from anon;
revoke all on public.users_profile from authenticated;
grant select on public.users_profile to authenticated;
grant insert (id, nome, email, foto_url) on public.users_profile to authenticated;
grant update (nome, email, foto_url) on public.users_profile to authenticated;
