-- UniCheck pre-release reset.
-- DESTRUCTIVE BY DESIGN: all current user-domain rows are development data.
-- Keeps auth.users, checklists and checklist_items; removes legacy tables.

begin;

-- Prevent signups while the profile function is being replaced in this transaction.
drop trigger if exists on_auth_user_created on auth.users;

-- Remove obsolete schemas and their test data.
drop table if exists public.progresso_item_checklist cascade;
drop table if exists public.notificacoes cascade;
drop table if exists public.user_progress cascade;

-- Recreate the account-scoped schema from a known clean baseline.
drop table if exists public.user_platform_favorites cascade;
drop table if exists public.user_notifications cascade;
drop table if exists public.user_activity cascade;
drop table if exists public.user_checklist_item_progress cascade;
drop table if exists public.users_profile cascade;

drop function if exists public.definir_data_atualizacao();
drop function if exists public.set_updated_at();

create table public.users_profile (
    id uuid primary key references auth.users (id) on delete cascade,
    nome text not null,
    email text not null,
    foto_url text,
    ra text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint users_profile_nome_length
        check (char_length(trim(nome)) between 2 and 120),
    constraint users_profile_email_length
        check (char_length(trim(email)) between 3 and 320),
    constraint users_profile_foto_url_length
        check (foto_url is null or char_length(foto_url) <= 4096),
    constraint users_profile_ra_length
        check (ra is null or char_length(trim(ra)) between 1 and 40)
);

create unique index if not exists checklist_items_checklist_id_id_key
    on public.checklist_items (checklist_id, id);

create table public.user_checklist_item_progress (
    user_id uuid not null references auth.users (id) on delete cascade,
    checklist_id uuid not null,
    checklist_item_id uuid not null,
    completed boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, checklist_item_id),
    constraint user_checklist_progress_item_matches_checklist_fk
        foreign key (checklist_id, checklist_item_id)
        references public.checklist_items (checklist_id, id)
        on delete cascade
);

create table public.user_activity (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    type text not null,
    title text not null,
    context text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    constraint user_activity_type_length
        check (char_length(trim(type)) between 1 and 80),
    constraint user_activity_title_length
        check (char_length(trim(title)) between 1 and 500)
);

create table public.user_notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    event_key text not null,
    type text not null,
    title text not null,
    message text not null,
    destination text,
    read boolean not null default false,
    created_at timestamptz not null default now(),
    constraint user_notifications_user_event_key_unique
        unique (user_id, event_key),
    constraint user_notifications_event_key_length
        check (char_length(trim(event_key)) between 1 and 180),
    constraint user_notifications_type_length
        check (char_length(trim(type)) between 1 and 80),
    constraint user_notifications_title_length
        check (char_length(trim(title)) between 1 and 300),
    constraint user_notifications_message_length
        check (char_length(trim(message)) between 1 and 1000)
);

create table public.user_platform_favorites (
    user_id uuid not null references auth.users (id) on delete cascade,
    platform_id text not null,
    created_at timestamptz not null default now(),
    primary key (user_id, platform_id),
    constraint user_platform_favorites_platform_id_length
        check (char_length(trim(platform_id)) between 1 and 120)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.users_profile (id, nome, email, foto_url)
    values (
        new.id,
        case
            when char_length(trim(coalesce(new.raw_user_meta_data ->> 'full_name', ''))) between 2 and 120
                then trim(new.raw_user_meta_data ->> 'full_name')
            else 'Usuario'
        end,
        new.email,
        nullif(
            coalesce(
                new.raw_user_meta_data ->> 'photo_url',
                new.raw_user_meta_data ->> 'foto_url'
            ),
            ''
        )
    )
    on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

    return new;
end;
$$;

-- The function is invoked only by the auth.users trigger. Keeping EXECUTE away
-- from API roles prevents clients from calling a SECURITY DEFINER function.
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger set_users_profile_updated_at
before update on public.users_profile
for each row
execute function public.set_updated_at();

create trigger set_user_checklist_item_progress_updated_at
before update on public.user_checklist_item_progress
for each row
execute function public.set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create index user_checklist_progress_user_updated_at_idx
    on public.user_checklist_item_progress (user_id, updated_at desc);
create index user_checklist_progress_item_checklist_fk_idx
    on public.user_checklist_item_progress (checklist_id, checklist_item_id);
create index user_activity_user_created_at_idx
    on public.user_activity (user_id, created_at desc);
create index user_notifications_user_created_at_idx
    on public.user_notifications (user_id, created_at desc);
create index user_notifications_user_unread_idx
    on public.user_notifications (user_id, created_at desc)
    where read = false;
create index user_platform_favorites_user_created_at_idx
    on public.user_platform_favorites (user_id, created_at desc);
create index if not exists checklist_items_checklist_id_idx
    on public.checklist_items (checklist_id);

alter table public.checklists enable row level security;
alter table public.checklist_items enable row level security;
alter table public.users_profile enable row level security;
alter table public.user_checklist_item_progress enable row level security;
alter table public.user_activity enable row level security;
alter table public.user_notifications enable row level security;
alter table public.user_platform_favorites enable row level security;

-- Checklist definitions are preserved, so remove every previous policy before
-- installing the single canonical read policy for each table.
do $policy_cleanup$
declare
    existing_policy record;
begin
    for existing_policy in
        select schemaname, tablename, policyname
        from pg_policies
        where schemaname = 'public'
          and tablename in ('checklists', 'checklist_items')
    loop
        execute format(
            'drop policy %I on %I.%I',
            existing_policy.policyname,
            existing_policy.schemaname,
            existing_policy.tablename
        );
    end loop;
end;
$policy_cleanup$;

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

create policy "users_profile_select_own"
on public.users_profile
for select
to authenticated
using (id = (select auth.uid()));

create policy "users_profile_insert_own"
on public.users_profile
for insert
to authenticated
with check (id = (select auth.uid()));

create policy "users_profile_update_own"
on public.users_profile
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "user_checklist_progress_select_own"
on public.user_checklist_item_progress
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "user_checklist_progress_insert_own"
on public.user_checklist_item_progress
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "user_checklist_progress_update_own"
on public.user_checklist_item_progress
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "user_activity_select_own"
on public.user_activity
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "user_activity_insert_own"
on public.user_activity
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "user_notifications_select_own"
on public.user_notifications
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "user_notifications_insert_own"
on public.user_notifications
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "user_notifications_update_read_own"
on public.user_notifications
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "user_platform_favorites_select_own"
on public.user_platform_favorites
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "user_platform_favorites_insert_own"
on public.user_platform_favorites
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "user_platform_favorites_delete_own"
on public.user_platform_favorites
for delete
to authenticated
using (user_id = (select auth.uid()));

revoke all on public.checklists from anon, authenticated;
revoke all on public.checklist_items from anon, authenticated;
revoke all on public.users_profile from anon, authenticated;
revoke all on public.user_checklist_item_progress from anon, authenticated;
revoke all on public.user_activity from anon, authenticated;
revoke all on public.user_notifications from anon, authenticated;
revoke all on public.user_platform_favorites from anon, authenticated;

grant select on public.checklists, public.checklist_items to authenticated;
grant select on public.users_profile to authenticated;
grant insert (id, nome, email, foto_url, ra) on public.users_profile to authenticated;
grant update (nome, email, foto_url, ra) on public.users_profile to authenticated;
grant select, insert, update on public.user_checklist_item_progress to authenticated;
grant select, insert on public.user_activity to authenticated;
grant select, insert on public.user_notifications to authenticated;
grant update (read) on public.user_notifications to authenticated;
grant select, insert, delete on public.user_platform_favorites to authenticated;

-- Public avatars with per-user write isolation.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'avatars',
    'avatars',
    true,
    2097152,
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_insert_own" on storage.objects;
drop policy if exists "avatars_update_own" on storage.objects;
drop policy if exists "avatars_delete_own" on storage.objects;

-- Public delivery is provided by the public bucket URL. A SELECT policy is
-- intentionally omitted so clients cannot enumerate every stored avatar.
drop policy if exists "avatars_public_read" on storage.objects;

create policy "avatars_insert_own"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "avatars_update_own"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "avatars_delete_own"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);

commit;
