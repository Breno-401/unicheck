-- Execute no SQL Editor do Supabase remoto. Esta migration mantém as
-- definições de checklist legíveis por usuários autenticados e isola todo
-- progresso pelo auth.uid().

alter table public.checklists enable row level security;
alter table public.checklist_items enable row level security;
alter table public.user_checklist_item_progress enable row level security;

do $$
declare policy_row record;
begin
    for policy_row in
        select schemaname, tablename, policyname
        from pg_policies
        where schemaname = 'public'
          and tablename in ('checklists', 'checklist_items', 'user_checklist_item_progress')
    loop
        execute format('drop policy if exists %I on %I.%I',
            policy_row.policyname, policy_row.schemaname, policy_row.tablename);
    end loop;
end $$;

create policy "Authenticated users can read checklists"
on public.checklists for select to authenticated
using (true);

create policy "Authenticated users can read checklist items"
on public.checklist_items for select to authenticated
using (true);

create policy "Users can read their checklist progress"
on public.user_checklist_item_progress for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their checklist progress"
on public.user_checklist_item_progress for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their checklist progress"
on public.user_checklist_item_progress for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
