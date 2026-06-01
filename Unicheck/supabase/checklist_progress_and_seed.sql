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
)
update public.checklists
set titulo = 'Primeiros passos na faculdade',
    descricao = 'Estruture os combinados iniciais da turma e deixe o onboarding pronto para a rotina academica.'
where id in (select id from fase1);

with fase1 as (
    select id
    from public.checklists
    where ordem = 1
    limit 1
)
insert into public.checklist_items (checklist_id, ordem, titulo)
select fase1.id, item_data.ordem, item_data.titulo
from fase1
cross join (
    values
        (1, 'Definir o lider da turma'),
        (2, 'Criar o grupo oficial da turma'),
        (3, 'Entrar no grupo da turma'),
        (4, 'Confirmar calendario e canais da coordenacao')
) as item_data(ordem, titulo)
where not exists (
    select 1
    from public.checklist_items existing
    where existing.checklist_id = fase1.id
      and existing.ordem = item_data.ordem
);

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
)
update public.checklists
set titulo = 'Portal Acadêmico TOTVS',
    descricao = 'Aprenda a acessar o portal, entrar com suas credenciais e localizar os recursos essenciais.'
where id in (select id from fase2);

with fase2 as (
    select id
    from public.checklists
    where ordem = 2
    limit 1
)
insert into public.checklist_items (checklist_id, ordem, titulo)
select fase2.id, item_data.ordem, item_data.titulo
from fase2
cross join (
    values
        (1, 'Acessar o portal academico'),
        (2, 'Fazer login com RA e senha inicial'),
        (3, 'Localizar a navegacao principal do sistema'),
        (4, 'Encontrar relatorios e documentos academicos')
) as item_data(ordem, titulo)
where not exists (
    select 1
    from public.checklist_items existing
    where existing.checklist_id = fase2.id
      and existing.ordem = item_data.ordem
);

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

with fase3 as (
    select id
    from public.checklists
    where ordem = 3
    limit 1
)
update public.checklists
set titulo = 'Configuração de Email',
    descricao = 'Valide o email institucional, confirme o acesso e prepare a conta para avisos e recuperacao.'
where id in (select id from fase3);

with fase3 as (
    select id
    from public.checklists
    where ordem = 3
    limit 1
)
insert into public.checklist_items (checklist_id, ordem, titulo)
select fase3.id, item_data.ordem, item_data.titulo
from fase3
cross join (
    values
        (1, 'Confirmar o email institucional'),
        (2, 'Entrar no webmail ou aplicativo'),
        (3, 'Alterar a senha provisoria'),
        (4, 'Testar envio e recebimento de mensagens')
) as item_data(ordem, titulo)
where not exists (
    select 1
    from public.checklist_items existing
    where existing.checklist_id = fase3.id
      and existing.ordem = item_data.ordem
);

with fase3 as (
    select id
    from public.checklists
    where ordem = 3
    limit 1
),
fase3_items as (
    select ci.id, row_number() over (order by ci.ordem asc, ci.id) as pos
    from public.checklist_items ci
    join fase3 f on f.id = ci.checklist_id
)
update public.checklist_items ci
set titulo = case fase3_items.pos
    when 1 then 'Confirmar o email institucional'
    when 2 then 'Entrar no webmail ou aplicativo'
    when 3 then 'Alterar a senha provisoria'
    when 4 then 'Testar envio e recebimento de mensagens'
    else ci.titulo
end
from fase3_items
where ci.id = fase3_items.id;

with fase4 as (
    select id
    from public.checklists
    where ordem = 4
    limit 1
)
update public.checklists
set titulo = 'Biblioteca Virtual',
    descricao = 'Prepare a consulta a acervo, bases digitais e materiais de apoio para estudo e pesquisa.'
where id in (select id from fase4);

with fase4 as (
    select id
    from public.checklists
    where ordem = 4
    limit 1
)
insert into public.checklist_items (checklist_id, ordem, titulo)
select fase4.id, item_data.ordem, item_data.titulo
from fase4
cross join (
    values
        (1, 'Entrar na biblioteca virtual'),
        (2, 'Buscar um livro da disciplina'),
        (3, 'Abrir uma base digital ou artigo'),
        (4, 'Verificar reservas, downloads ou historico')
) as item_data(ordem, titulo)
where not exists (
    select 1
    from public.checklist_items existing
    where existing.checklist_id = fase4.id
      and existing.ordem = item_data.ordem
);

with fase4 as (
    select id
    from public.checklists
    where ordem = 4
    limit 1
),
fase4_items as (
    select ci.id, row_number() over (order by ci.ordem asc, ci.id) as pos
    from public.checklist_items ci
    join fase4 f on f.id = ci.checklist_id
)
update public.checklist_items ci
set titulo = case fase4_items.pos
    when 1 then 'Entrar na biblioteca virtual'
    when 2 then 'Buscar um livro da disciplina'
    when 3 then 'Abrir uma base digital ou artigo'
    when 4 then 'Verificar reservas, downloads ou historico'
    else ci.titulo
end
from fase4_items
where ci.id = fase4_items.id;

with fase5 as (
    select id
    from public.checklists
    where ordem = 5
    limit 1
)
update public.checklists
set titulo = 'Microsoft Teams',
    descricao = 'Organize a conta, os canais e a rotina de uso do Teams para aulas, recados e encontros.'
where id in (select id from fase5);

with fase5 as (
    select id
    from public.checklists
    where ordem = 5
    limit 1
)
insert into public.checklist_items (checklist_id, ordem, titulo)
select fase5.id, item_data.ordem, item_data.titulo
from fase5
cross join (
    values
        (1, 'Entrar com a conta institucional'),
        (2, 'Abrir a equipe da turma'),
        (3, 'Ajustar notificacoes e perfil'),
        (4, 'Localizar canais, arquivos e reunioes')
) as item_data(ordem, titulo)
where not exists (
    select 1
    from public.checklist_items existing
    where existing.checklist_id = fase5.id
      and existing.ordem = item_data.ordem
);

with fase5 as (
    select id
    from public.checklists
    where ordem = 5
    limit 1
),
fase5_items as (
    select ci.id, row_number() over (order by ci.ordem asc, ci.id) as pos
    from public.checklist_items ci
    join fase5 f on f.id = ci.checklist_id
)
update public.checklist_items ci
set titulo = case fase5_items.pos
    when 1 then 'Entrar com a conta institucional'
    when 2 then 'Abrir a equipe da turma'
    when 3 then 'Ajustar notificacoes e perfil'
    when 4 then 'Localizar canais, arquivos e reunioes'
    else ci.titulo
end
from fase5_items
where ci.id = fase5_items.id;

with fase6 as (
    select id
    from public.checklists
    where ordem = 6
    limit 1
)
update public.checklists
set titulo = 'Plataforma A',
    descricao = 'Conclua a configuracao minima da plataforma adicional usada no fluxo academico.'
where id in (select id from fase6);

with fase6 as (
    select id
    from public.checklists
    where ordem = 6
    limit 1
)
insert into public.checklist_items (checklist_id, ordem, titulo)
select fase6.id, item_data.ordem, item_data.titulo
from fase6
cross join (
    values
        (1, 'Acessar a plataforma complementar'),
        (2, 'Concluir o login inicial'),
        (3, 'Identificar materiais e recursos principais'),
        (4, 'Registrar acesso ou pendencias da ferramenta')
) as item_data(ordem, titulo)
where not exists (
    select 1
    from public.checklist_items existing
    where existing.checklist_id = fase6.id
      and existing.ordem = item_data.ordem
);

with fase6 as (
    select id
    from public.checklists
    where ordem = 6
    limit 1
),
fase6_items as (
    select ci.id, row_number() over (order by ci.ordem asc, ci.id) as pos
    from public.checklist_items ci
    join fase6 f on f.id = ci.checklist_id
)
update public.checklist_items ci
set titulo = case fase6_items.pos
    when 1 then 'Acessar a plataforma complementar'
    when 2 then 'Concluir o login inicial'
    when 3 then 'Identificar materiais e recursos principais'
    when 4 then 'Registrar acesso ou pendencias da ferramenta'
    else ci.titulo
end
from fase6_items
where ci.id = fase6_items.id;

with fase7 as (
    select id
    from public.checklists
    where ordem = 7
    limit 1
)
update public.checklists
set titulo = 'Mentorias',
    descricao = 'Entenda como acionar o acompanhamento e usar os canais de apoio ao estudante.'
where id in (select id from fase7);

with fase7 as (
    select id
    from public.checklists
    where ordem = 7
    limit 1
)
insert into public.checklist_items (checklist_id, ordem, titulo)
select fase7.id, item_data.ordem, item_data.titulo
from fase7
cross join (
    values
        (1, 'Identificar o canal de apoio'),
        (2, 'Localizar regras ou agenda de atendimento'),
        (3, 'Registrar duvidas ou necessidades'),
        (4, 'Confirmar o encaminhamento ou retorno')
) as item_data(ordem, titulo)
where not exists (
    select 1
    from public.checklist_items existing
    where existing.checklist_id = fase7.id
      and existing.ordem = item_data.ordem
);

with fase7 as (
    select id
    from public.checklists
    where ordem = 7
    limit 1
),
fase7_items as (
    select ci.id, row_number() over (order by ci.ordem asc, ci.id) as pos
    from public.checklist_items ci
    join fase7 f on f.id = ci.checklist_id
)
update public.checklist_items ci
set titulo = case fase7_items.pos
    when 1 then 'Identificar o canal de apoio'
    when 2 then 'Localizar regras ou agenda de atendimento'
    when 3 then 'Registrar duvidas ou necessidades'
    when 4 then 'Confirmar o encaminhamento ou retorno'
    else ci.titulo
end
from fase7_items
where ci.id = fase7_items.id;
