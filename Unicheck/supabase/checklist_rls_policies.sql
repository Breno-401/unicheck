-- RLS baseline for checklist definitions and user progress.
-- Apply after the checklist tables exist.

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
create policy "Users can read their checklist progress"
on public.user_checklist_item_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their checklist progress" on public.user_checklist_item_progress;
create policy "Users can insert their checklist progress"
on public.user_checklist_item_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their checklist progress" on public.user_checklist_item_progress;
create policy "Users can update their checklist progress"
on public.user_checklist_item_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their checklist progress" on public.user_checklist_item_progress;
create policy "Users can delete their checklist progress"
on public.user_checklist_item_progress
for delete
to authenticated
using (auth.uid() = user_id);

grant select on public.checklists, public.checklist_items to authenticated;
grant select, insert, update, delete on public.user_checklist_item_progress to authenticated;
