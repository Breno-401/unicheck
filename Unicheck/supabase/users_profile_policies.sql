-- RLS policies for account-scoped profile data.
-- Apply after public.users_profile exists.

alter table public.users_profile enable row level security;

drop policy if exists "users_profile_select_own" on public.users_profile;
create policy "users_profile_select_own"
on public.users_profile
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "users_profile_insert_own" on public.users_profile;
create policy "users_profile_insert_own"
on public.users_profile
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "users_profile_update_own" on public.users_profile;
create policy "users_profile_update_own"
on public.users_profile
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, insert, update on public.users_profile to authenticated;
