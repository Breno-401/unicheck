create table if not exists public.user_checklist_item_progress (
    user_id uuid not null references auth.users (id) on delete cascade,
    checklist_id uuid not null references public.checklists (id) on delete cascade,
    checklist_item_id uuid not null references public.checklist_items (id) on delete cascade,
    completed boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, checklist_item_id)
);

alter table public.user_checklist_item_progress enable row level security;

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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists set_user_checklist_item_progress_updated_at on public.user_checklist_item_progress;
create trigger set_user_checklist_item_progress_updated_at
before update on public.user_checklist_item_progress
for each row
execute function public.set_updated_at();

with fase1 as (
    select id
    from public.checklists
    where ordem = 1
    limit 1
),
fase1_items as (
    select ci.id, row_number() over (order by ci.ordem asc, ci.id) as pos
    from public.checklist_items ci
    join fase1 f on f.id = ci.checklist_id
)
update public.checklists
set titulo = 'Primeiros passos na faculdade',
    descricao = 'Organize os primeiros combinados da turma e prepare a entrada na rotina academica.'
where id in (select id from fase1);

update public.checklist_items ci
set titulo = case fase1_items.pos
    when 1 then 'Definir o lider da turma'
    when 2 then 'Criar o grupo oficial da turma'
    when 3 then 'Entrar no grupo da turma'
    when 4 then 'Confirmar calendario e canais da coordenacao'
    else ci.titulo
end
from fase1_items
where ci.id = fase1_items.id;

with fase2 as (
    select id
    from public.checklists
    where ordem = 2
    limit 1
),
fase2_items as (
    select ci.id, row_number() over (order by ci.ordem asc, ci.id) as pos
    from public.checklist_items ci
    join fase2 f on f.id = ci.checklist_id
)
update public.checklists
set titulo = 'Portal Acadêmico TOTVS',
    descricao = 'Aprenda a acessar o portal, entrar com suas credenciais e localizar os recursos essenciais.'
where id in (select id from fase2);

update public.checklist_items ci
set titulo = case fase2_items.pos
    when 1 then 'Acessar o portal academico'
    when 2 then 'Fazer login com RA e senha inicial'
    when 3 then 'Localizar a navegacao principal do sistema'
    when 4 then 'Encontrar relatorios e documentos academicos'
    else ci.titulo
end
from fase2_items
where ci.id = fase2_items.id;
