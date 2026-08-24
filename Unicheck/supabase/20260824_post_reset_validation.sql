-- Read-only validation after 20260824_prerelease_reset.sql.

-- Expected: 7 checklists, 28 checklist_items and zero rows in user-domain tables.
select 'checklists' as entity, count(*) as row_count from public.checklists
union all
select 'checklist_items', count(*) from public.checklist_items
union all
select 'users_profile', count(*) from public.users_profile
union all
select 'user_checklist_item_progress', count(*) from public.user_checklist_item_progress
union all
select 'user_activity', count(*) from public.user_activity
union all
select 'user_notifications', count(*) from public.user_notifications
union all
select 'user_platform_favorites', count(*) from public.user_platform_favorites
order by entity;

-- Expected: no rows.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
      'progresso_item_checklist',
      'notificacoes',
      'user_progress'
  );

-- Expected: RLS enabled for every listed table.
select
    tablename,
    rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
      'checklists',
      'checklist_items',
      'users_profile',
      'user_checklist_item_progress',
      'user_activity',
      'user_notifications',
      'user_platform_favorites'
  )
order by tablename;

-- Expected: only canonical, account-scoped policies.
select
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
from pg_policies
where schemaname in ('public', 'storage')
  and tablename in (
      'checklists',
      'checklist_items',
      'users_profile',
      'user_checklist_item_progress',
      'user_activity',
      'user_notifications',
      'user_platform_favorites',
      'objects'
  )
order by schemaname, tablename, policyname;

-- Expected: no anon table grants in public and only the documented authenticated grants.
select
    table_name,
    grantee,
    privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in (
      'checklists',
      'checklist_items',
      'users_profile',
      'user_checklist_item_progress',
      'user_activity',
      'user_notifications',
      'user_platform_favorites'
  )
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;

-- Expected: profile columns follow least privilege and notifications exposes
-- UPDATE only for read.
select
    table_name,
    column_name,
    grantee,
    privilege_type
from information_schema.role_column_grants
where table_schema = 'public'
  and table_name in ('users_profile', 'user_notifications')
  and grantee = 'authenticated'
order by table_name, privilege_type, column_name;

-- Expected: both functions have an empty, immutable search_path.
select
    p.proname,
    p.proconfig
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('handle_new_user', 'set_updated_at')
order by p.proname;

-- Expected: on_auth_user_created points to handle_new_user.
select
    event_object_schema,
    event_object_table,
    trigger_name,
    action_timing,
    event_manipulation,
    action_statement
from information_schema.triggers
where trigger_name = 'on_auth_user_created';

-- Expected: avatars is public, limited to 2 MB and image MIME types.
select
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
from storage.buckets
where id = 'avatars';
