-- Seed estrutural do produto. O schema, as policies e os triggers pertencem ao
-- baseline canonico 20260824_prerelease_reset.sql e nao sao redefinidos aqui.

-- IDs determinísticos mantêm o catálogo local-first e a persistência remota no
-- mesmo contrato, inclusive quando o baseline é aplicado sobre tabelas vazias.
insert into public.checklists (id, titulo, descricao, ordem)
values
    ('10000000-0000-4000-8000-000000000001', 'Primeiros passos na faculdade', 'Estruture os combinados iniciais da turma, defina os contatos principais e prepare o onboarding para a rotina academica.', 1),
    ('10000000-0000-4000-8000-000000000002', 'Portal Acadêmico TOTVS', 'Aprenda a acessar o Portal do Aluno, entrar com RA e senha e localizar a central do aluno e os documentos mais usados.', 2),
    ('10000000-0000-4000-8000-000000000003', 'Configuração de Email', 'Valide o email institucional, entre no Outlook/Webmail e prepare a conta para avisos, comunicados e recuperacao.', 3),
    ('10000000-0000-4000-8000-000000000004', 'Biblioteca Virtual', 'Prepare a consulta ao acervo, livros, artigos e bases digitais para estudo e pesquisa.', 4),
    ('10000000-0000-4000-8000-000000000005', 'Microsoft Teams', 'Organize a conta, os canais e a rotina de uso do Teams para aulas, recados, encontros e arquivos da turma.', 5),
    ('10000000-0000-4000-8000-000000000006', 'Plataforma A+', 'Conclua a configuracao minima da Plataforma A+ para materiais e recursos extras do fluxo academico.', 6),
    ('10000000-0000-4000-8000-000000000007', 'Mentorias', 'Entenda como acionar o acompanhamento, registrar demandas e usar os canais de apoio ao estudante.', 7)
on conflict (id) do update set
    titulo = excluded.titulo,
    descricao = excluded.descricao,
    ordem = excluded.ordem;

insert into public.checklist_items (id, checklist_id, ordem, titulo)
values
    ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 1, 'Definir o lider da turma'),
    ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 2, 'Criar o grupo oficial da turma'),
    ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 3, 'Entrar no grupo da turma'),
    ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 4, 'Confirmar calendario e canais da coordenacao'),
    ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000002', 1, 'Abrir o Portal do Aluno UniSales'),
    ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000002', 2, 'Fazer login com RA e senha inicial'),
    ('20000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000002', 3, 'Localizar a Central do Aluno e a Secretaria'),
    ('20000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000002', 4, 'Baixar boletos, comprovantes e relatorios'),
    ('20000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000003', 1, 'Confirmar o email institucional'),
    ('20000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000003', 2, 'Entrar no Outlook/Webmail'),
    ('20000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000003', 3, 'Alterar a senha provisoria'),
    ('20000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000003', 4, 'Testar envio e recebimento de mensagens'),
    ('20000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000004', 1, 'Entrar na biblioteca virtual'),
    ('20000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000004', 2, 'Buscar um livro da disciplina'),
    ('20000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000004', 3, 'Abrir uma base digital ou artigo'),
    ('20000000-0000-4000-8000-000000000016', '10000000-0000-4000-8000-000000000004', 4, 'Verificar reservas, downloads ou historico'),
    ('20000000-0000-4000-8000-000000000017', '10000000-0000-4000-8000-000000000005', 1, 'Entrar com a conta institucional'),
    ('20000000-0000-4000-8000-000000000018', '10000000-0000-4000-8000-000000000005', 2, 'Abrir a equipe da turma ou disciplina'),
    ('20000000-0000-4000-8000-000000000019', '10000000-0000-4000-8000-000000000005', 3, 'Ajustar notificacoes e perfil'),
    ('20000000-0000-4000-8000-000000000020', '10000000-0000-4000-8000-000000000005', 4, 'Localizar canais, arquivos e reunioes'),
    ('20000000-0000-4000-8000-000000000021', '10000000-0000-4000-8000-000000000006', 1, 'Acessar a Plataforma A+'),
    ('20000000-0000-4000-8000-000000000022', '10000000-0000-4000-8000-000000000006', 2, 'Concluir o login inicial'),
    ('20000000-0000-4000-8000-000000000023', '10000000-0000-4000-8000-000000000006', 3, 'Identificar materiais e recursos principais'),
    ('20000000-0000-4000-8000-000000000024', '10000000-0000-4000-8000-000000000006', 4, 'Registrar acesso ou pendencias da ferramenta'),
    ('20000000-0000-4000-8000-000000000025', '10000000-0000-4000-8000-000000000007', 1, 'Identificar o canal de apoio'),
    ('20000000-0000-4000-8000-000000000026', '10000000-0000-4000-8000-000000000007', 2, 'Localizar regras ou agenda de atendimento'),
    ('20000000-0000-4000-8000-000000000027', '10000000-0000-4000-8000-000000000007', 3, 'Registrar duvidas ou necessidades'),
    ('20000000-0000-4000-8000-000000000028', '10000000-0000-4000-8000-000000000007', 4, 'Confirmar o encaminhamento ou retorno')
on conflict (id) do update set
    checklist_id = excluded.checklist_id,
    ordem = excluded.ordem,
    titulo = excluded.titulo;

-- Se um catálogo anterior usava UUIDs aleatórios, preserve o progresso pela
-- posição estrutural antes de remover a cópia legada.
insert into public.user_checklist_item_progress (user_id, checklist_id, checklist_item_id, completed)
select
    progress.user_id,
    canonical_phase.id,
    canonical_item.id,
    progress.completed
from public.user_checklist_item_progress progress
join public.checklists legacy_phase on legacy_phase.id = progress.checklist_id
join public.checklist_items legacy_item on legacy_item.id = progress.checklist_item_id
join public.checklists canonical_phase
  on canonical_phase.ordem = legacy_phase.ordem
 and canonical_phase.id::text like '10000000-0000-4000-8000-%'
join public.checklist_items canonical_item
  on canonical_item.checklist_id = canonical_phase.id
 and canonical_item.ordem = legacy_item.ordem
where progress.checklist_id::text not like '10000000-0000-4000-8000-%'
on conflict (user_id, checklist_item_id) do update
set completed = public.user_checklist_item_progress.completed or excluded.completed,
    updated_at = now();

delete from public.user_checklist_item_progress
where checklist_id::text not like '10000000-0000-4000-8000-%';

delete from public.checklists
where id::text not like '10000000-0000-4000-8000-%';

with fase1 as (
    select id
    from public.checklists
    where ordem = 1
    limit 1
)
update public.checklists
set titulo = 'Primeiros passos na faculdade',
    descricao = 'Estruture os combinados iniciais da turma, defina os contatos principais e prepare o onboarding para a rotina academica.'
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
    descricao = 'Aprenda a acessar o Portal do Aluno, entrar com RA e senha e localizar a central do aluno e os documentos mais usados.'
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
        (1, 'Abrir o Portal do Aluno UniSales'),
        (2, 'Fazer login com RA e senha inicial'),
        (3, 'Localizar a Central do Aluno e a Secretaria'),
        (4, 'Baixar boletos, comprovantes e relatorios')
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
    when 1 then 'Abrir o Portal do Aluno UniSales'
    when 2 then 'Fazer login com RA e senha inicial'
    when 3 then 'Localizar a Central do Aluno e a Secretaria'
    when 4 then 'Baixar boletos, comprovantes e relatorios'
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
    descricao = 'Valide o email institucional, entre no Outlook/Webmail e prepare a conta para avisos, comunicados e recuperacao.'
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
        (2, 'Entrar no Outlook/Webmail'),
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
    when 2 then 'Entrar no Outlook/Webmail'
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
    descricao = 'Prepare a consulta ao acervo, livros, artigos e bases digitais para estudo e pesquisa.'
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
    descricao = 'Organize a conta, os canais e a rotina de uso do Teams para aulas, recados, encontros e arquivos da turma.'
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
        (2, 'Abrir a equipe da turma ou disciplina'),
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
    when 2 then 'Abrir a equipe da turma ou disciplina'
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
set titulo = 'Plataforma A+',
    descricao = 'Conclua a configuracao minima da Plataforma A+ para materiais e recursos extras do fluxo academico.'
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
        (1, 'Acessar a Plataforma A+'),
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
    when 1 then 'Acessar a Plataforma A+'
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
    descricao = 'Entenda como acionar o acompanhamento, registrar demandas e usar os canais de apoio ao estudante.'
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
