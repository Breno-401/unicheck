-- RLS baseline for checklist definitions and user progress.
-- Checklist definitions are read-only; progress belongs to one authenticated user.

alter table public.checklists enable row level security;
alter table public.checklist_items enable row level security;
alter table public.user_checklist_item_progress enable row level security;

drop policy if exists "Authenticated users can read checklists" on public.checklists;
create policy "Authenticated users can read checklists"
on public.checklists
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read checklist items" on public.checklist_items;
create policy "Authenticated users can read checklist items"
on public.checklist_items
for select
to authenticated
using (true);

drop policy if exists "Users can read their checklist progress" on public.user_checklist_item_progress;
drop policy if exists "Users can insert their checklist progress" on public.user_checklist_item_progress;
drop policy if exists "Users can update their checklist progress" on public.user_checklist_item_progress;
drop policy if exists "Users can delete their checklist progress" on public.user_checklist_item_progress;

create policy "Users can read their checklist progress"
on public.user_checklist_item_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their checklist progress"
on public.user_checklist_item_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their checklist progress"
on public.user_checklist_item_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on public.checklists from anon;
revoke all on public.checklist_items from anon;
revoke all on public.user_checklist_item_progress from anon;
revoke all on public.checklists from authenticated;
revoke all on public.checklist_items from authenticated;
revoke all on public.user_checklist_item_progress from authenticated;

grant select on public.checklists, public.checklist_items to authenticated;
grant select, insert, update on public.user_checklist_item_progress to authenticated;
