-- Harden database functions and add covering indexes reported by Supabase advisors.
-- Apply after the structural and canonical table migrations.

begin;

-- Pin function lookup paths to prevent mutable-search-path execution.
alter function public.handle_new_user() set search_path = '';
alter function public.definir_data_atualizacao() set search_path = '';
alter function public.set_updated_at() set search_path = '';

-- Cover foreign keys used by joins and delete/update checks.
create index if not exists checklist_items_checklist_id_idx
    on public.checklist_items (checklist_id);

create index if not exists progresso_item_checklist_checklist_id_idx
    on public.progresso_item_checklist (checklist_id);

create index if not exists progresso_item_checklist_item_id_idx
    on public.progresso_item_checklist (item_id);

create index if not exists user_checklist_item_progress_checklist_id_idx
    on public.user_checklist_item_progress (checklist_id);

create index if not exists user_checklist_item_progress_item_id_idx
    on public.user_checklist_item_progress (checklist_item_id);

create index if not exists user_progress_checklist_item_id_idx
    on public.user_progress (checklist_item_id);

commit;
