-- Prepared only: review the companion diagnostic before a future deployment.
-- No existing rows or Storage objects are removed during installation.
begin;

-- Preserve the existing authenticated policies and public bucket delivery.
-- Storage upsert needs SELECT + INSERT + UPDATE; only the canonical path is
-- manageable through these policies. Legacy public URLs are not invalidated.
alter policy "avatars_select_own" on storage.objects
to authenticated
using (
    bucket_id = 'avatars'
    and name = (select auth.uid())::text || '/avatar.webp'
);

alter policy "avatars_insert_own" on storage.objects
to authenticated
with check (
    bucket_id = 'avatars'
    and name = (select auth.uid())::text || '/avatar.webp'
);

alter policy "avatars_update_own" on storage.objects
to authenticated
using (
    bucket_id = 'avatars'
    and name = (select auth.uid())::text || '/avatar.webp'
)
with check (
    bucket_id = 'avatars'
    and name = (select auth.uid())::text || '/avatar.webp'
);

alter policy "avatars_delete_own" on storage.objects
to authenticated
using (
    bucket_id = 'avatars'
    and name = (select auth.uid())::text || '/avatar.webp'
);

-- Match client context/destination limits; metadata allows 16 KiB of UTF-8
-- JSONB text (not compressed on-disk size). NOT VALID skips the legacy scan
-- but enforces the checks on subsequent INSERTs and UPDATEs, including old rows.
-- Scoped catalog checks make reruns safe without unsupported IF NOT EXISTS DDL.
do $constraints$
begin
    if not exists (
        select 1 from pg_catalog.pg_constraint
        where conrelid = 'public.user_activity'::pg_catalog.regclass
          and conname = 'user_activity_context_limit_v1'
    ) then
        alter table public.user_activity
            add constraint user_activity_context_limit_v1
            check (context is null or pg_catalog.char_length(context) <= 1000) not valid;
    end if;

    if not exists (
        select 1 from pg_catalog.pg_constraint
        where conrelid = 'public.user_activity'::pg_catalog.regclass
          and conname = 'user_activity_metadata_limit_v1'
    ) then
        alter table public.user_activity
            add constraint user_activity_metadata_limit_v1
            check (pg_catalog.octet_length(metadata::text) <= 16384) not valid;
    end if;

    if not exists (
        select 1 from pg_catalog.pg_constraint
        where conrelid = 'public.user_notifications'::pg_catalog.regclass
          and conname = 'user_notifications_destination_limit_v1'
    ) then
        alter table public.user_notifications
            add constraint user_notifications_destination_limit_v1
            check (destination is null or pg_catalog.char_length(destination) <= 500) not valid;
    end if;
end;
$constraints$;

-- Trigger-only functions need elevated DELETE rights: API roles keep their
-- existing grants and ownership RLS. NEW.user_id comes from the checked INSERT.
-- A transaction-scoped lock serializes retention for each table/user; a rare
-- hash collision only serializes unrelated users. The separate DELETE command
-- sees commits made while waiting under READ COMMITTED (PostgREST default).
-- Fixed-snapshot isolation is rejected explicitly instead of risking >100 rows.
-- New inserts prune only that user, newest created_at then UUID first. A first
-- insert for a legacy over-limit user also prunes their old surplus. There is
-- no cleanup at installation and no timer. Deletions commit/roll back with INSERT.
create or replace function public.retain_user_activity_100_v1()
returns trigger
language plpgsql
security definer
set search_path = ''
as $retention$
begin
    if pg_catalog.current_setting('transaction_isolation') not in ('read committed', 'read uncommitted') then
        raise exception 'Activity retention requires READ COMMITTED isolation'
            using errcode = '40001';
    end if;

    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('user_activity:' || new.user_id::text, 0));

    delete from public.user_activity as expired
    where expired.user_id = new.user_id
      and expired.id in (
          select candidate.id
          from public.user_activity as candidate
          where candidate.user_id = new.user_id
          order by candidate.created_at desc, candidate.id desc
          offset 100
      );
    return new;
end;
$retention$;

revoke all on function public.retain_user_activity_100_v1() from public, anon, authenticated;

create or replace function public.retain_user_notifications_100_v1()
returns trigger
language plpgsql
security definer
set search_path = ''
as $retention$
begin
    if pg_catalog.current_setting('transaction_isolation') not in ('read committed', 'read uncommitted') then
        raise exception 'Notification retention requires READ COMMITTED isolation'
            using errcode = '40001';
    end if;

    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('user_notifications:' || new.user_id::text, 0));

    delete from public.user_notifications as expired
    where expired.user_id = new.user_id
      and expired.id in (
          select candidate.id
          from public.user_notifications as candidate
          where candidate.user_id = new.user_id
          order by candidate.created_at desc, candidate.id desc
          offset 100
      );
    return new;
end;
$retention$;

revoke all on function public.retain_user_notifications_100_v1() from public, anon, authenticated;

-- Only these new triggers are replaced on reruns; pre-existing triggers remain.
drop trigger if exists retain_user_activity_100_v1 on public.user_activity;
create trigger retain_user_activity_100_v1
after insert on public.user_activity
for each row
execute function public.retain_user_activity_100_v1();

drop trigger if exists retain_user_notifications_100_v1 on public.user_notifications;
create trigger retain_user_notifications_100_v1
after insert on public.user_notifications
for each row
execute function public.retain_user_notifications_100_v1();

commit;
