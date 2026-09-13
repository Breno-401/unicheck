-- Read-only companion to 20260913210000_resource_limits.sql; prepared, not run.
-- Run with an authorized administrative reader for complete RLS-visible counts.
-- Only identifiers/lengths/counts and definitions are shown; no user payloads.

-- Noncanonical names, missing account prefixes, and orphan account prefixes.
-- Return object identifiers instead of arbitrary legacy filenames.
select object.id as object_id, object.owner_id,
       pg_catalog.char_length(object.name) as name_length
from storage.objects as object
where object.bucket_id = 'avatars'
  and not exists (
      select 1 from auth.users as account
      where object.name = account.id::text || '/avatar.webp'
  )
order by object.id;

-- Legacy violations remain until reviewed; new writes must meet these limits.
select id, user_id, pg_catalog.char_length(context) as context_length,
       pg_catalog.octet_length(metadata::text) as metadata_bytes
from public.user_activity
where pg_catalog.char_length(context) > 1000
   or pg_catalog.octet_length(metadata::text) > 16384
order by user_id, id;

select id, user_id, pg_catalog.char_length(destination) as destination_length
from public.user_notifications
where pg_catalog.char_length(destination) > 500
order by user_id, id;

-- Legacy excess is expected before a new insert for that user/table.
select 'user_activity' as table_name, user_id, pg_catalog.count(*) as row_count
from public.user_activity
group by user_id
having pg_catalog.count(*) > 100
union all
select 'user_notifications', user_id, pg_catalog.count(*)
from public.user_notifications
group by user_id
having pg_catalog.count(*) > 100
order by table_name, user_id;

-- All checks, including prior constraints; the three new checks start unvalidated.
select constraint_row.conrelid::pg_catalog.regclass as table_name,
       constraint_row.conname, constraint_row.convalidated,
       pg_catalog.pg_get_constraintdef(constraint_row.oid) as definition
from pg_catalog.pg_constraint as constraint_row
where constraint_row.conrelid in ('public.user_activity'::pg_catalog.regclass,
                                  'public.user_notifications'::pg_catalog.regclass)
  and constraint_row.contype = 'c'
order by table_name, constraint_row.conname;

select trigger_row.tgrelid::pg_catalog.regclass as table_name,
       trigger_row.tgname, trigger_row.tgenabled,
       pg_catalog.pg_get_triggerdef(trigger_row.oid) as definition
from pg_catalog.pg_trigger as trigger_row
where trigger_row.tgrelid in ('public.user_activity'::pg_catalog.regclass,
                             'public.user_notifications'::pg_catalog.regclass)
  and not trigger_row.tgisinternal
order by table_name, trigger_row.tgname;

-- Effective API-role execution must be false, including inherited privileges.
-- ACL grantee 0 is PUBLIC; display explicit/default ACLs to expose that grant too.
select procedure.oid::pg_catalog.regprocedure as function_name,
       pg_catalog.pg_get_userbyid(procedure.proowner) as owner_name,
       procedure.prosecdef, procedure.proconfig,
       pg_catalog.pg_get_functiondef(procedure.oid) as definition,
       pg_catalog.has_function_privilege('anon', procedure.oid, 'EXECUTE') as anon_can_execute,
       pg_catalog.has_function_privilege('authenticated', procedure.oid, 'EXECUTE') as authenticated_can_execute,
       acl.grantee, acl.privilege_type, acl.is_grantable
from pg_catalog.pg_proc as procedure
join pg_catalog.pg_namespace as namespace on namespace.oid = procedure.pronamespace
left join lateral pg_catalog.aclexplode(coalesce(procedure.proacl,
    pg_catalog.acldefault('f', procedure.proowner))) as acl on true
where namespace.nspname = 'public'
  and procedure.proname in ('retain_user_activity_100_v1', 'retain_user_notifications_100_v1')
order by function_name, acl.grantee;

-- Inspect every Storage policy: other permissive policies can widen access.
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_catalog.pg_policies
where (schemaname = 'storage' and tablename = 'objects')
   or (schemaname = 'public' and tablename in ('user_activity', 'user_notifications'))
order by schemaname, tablename, policyname;

select table_schema, table_name, grantee, privilege_type, is_grantable
from information_schema.table_privileges
where (table_schema = 'public' and table_name in ('user_activity', 'user_notifications'))
   or (table_schema = 'storage' and table_name = 'objects')
order by table_schema, table_name, grantee, privilege_type;

select table_schema, table_name, column_name, grantee, privilege_type, is_grantable
from information_schema.column_privileges
where table_schema = 'public' and table_name in ('user_activity', 'user_notifications')
order by table_name, column_name, grantee, privilege_type;

select namespace.nspname as schema_name, relation.relname as table_name,
       pg_catalog.pg_get_userbyid(relation.relowner) as owner_name,
       relation.relrowsecurity, relation.relforcerowsecurity
from pg_catalog.pg_class as relation
join pg_catalog.pg_namespace as namespace on namespace.oid = relation.relnamespace
where (namespace.nspname = 'public' and relation.relname in ('user_activity', 'user_notifications'))
   or (namespace.nspname = 'storage' and relation.relname = 'objects')
order by schema_name, table_name;

-- Bucket remains public: object delivery via public URLs bypasses SELECT RLS.
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'avatars';
