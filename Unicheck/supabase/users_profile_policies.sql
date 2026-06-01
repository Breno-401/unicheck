alter table public.users_profile enable row level security;

create policy "users_profile_select_own"
on public.users_profile
for select
to authenticated
using (user_id = auth.uid());

create policy "users_profile_insert_own"
on public.users_profile
for insert
to authenticated
with check (user_id = auth.uid());

create policy "users_profile_update_own"
on public.users_profile
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
