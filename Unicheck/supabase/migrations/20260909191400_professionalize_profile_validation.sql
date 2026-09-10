begin;

create or replace function public.normalize_full_name(input_name text)
returns text
language sql
immutable
set search_path = ''
as $$
    select regexp_replace(btrim(coalesce(input_name, '')), '[[:space:]]+', ' ', 'g');
$$;

create or replace function public.is_valid_full_name(input_name text)
returns boolean
language sql
immutable
set search_path = ''
as $$
    with normalized as (
        select public.normalize_full_name(input_name) as value
    ), components as (
        select component
        from normalized,
             regexp_split_to_table(normalized.value, ' ') as parts(component)
    )
    select
        char_length(normalized.value) between 1 and 100
        and normalized.value ~ '^[[:alpha:]]+([''’-][[:alpha:]]+)*( [[:alpha:]]+([''’-][[:alpha:]]+)*)+$'
        and (
            select count(*)
            from components
            where lower(component) not in ('de', 'da', 'do', 'das', 'dos', 'e')
        ) >= 2
    from normalized;
$$;

revoke all on function public.normalize_full_name(text) from public, anon, authenticated;
revoke all on function public.is_valid_full_name(text) from public, anon, authenticated;
-- The CHECK constraint runs for authenticated profile writes. These two pure
-- helpers expose no rows or privileged state, so only that role may execute them.
grant execute on function public.normalize_full_name(text) to authenticated;
grant execute on function public.is_valid_full_name(text) to authenticated;

create or replace function public.normalize_users_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    canonical_email text;
begin
    select lower(btrim(auth_user.email))
    into canonical_email
    from auth.users as auth_user
    where auth_user.id = new.id;

    if canonical_email is null then
        raise exception 'Authenticated user email is required for users_profile';
    end if;

    new.nome := public.normalize_full_name(new.nome);
    new.email := canonical_email;
    new.ra := nullif(btrim(new.ra), '');
    return new;
end;
$$;

revoke all on function public.normalize_users_profile_fields() from public, anon, authenticated;

drop trigger if exists normalize_users_profile_fields on public.users_profile;
create trigger normalize_users_profile_fields
before insert or update on public.users_profile
for each row
execute function public.normalize_users_profile_fields();

alter table public.users_profile
    add constraint users_profile_nome_valid
    check (public.is_valid_full_name(nome))
    not valid;

alter table public.users_profile
    add constraint users_profile_email_normalized
    check (
        email = lower(btrim(email))
        and char_length(email) between 3 and 320
        and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
    not valid;

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
        public.normalize_full_name(new.raw_user_meta_data ->> 'full_name'),
        lower(btrim(new.email)),
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

revoke all on function public.handle_new_user() from public, anon, authenticated;

create or replace function public.sync_users_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.users_profile
    set email = lower(btrim(new.email))
    where id = new.id;
    return new;
end;
$$;

revoke all on function public.sync_users_profile_email() from public, anon, authenticated;

drop trigger if exists sync_users_profile_email on auth.users;
create trigger sync_users_profile_email
after update of email on auth.users
for each row
when (old.email is distinct from new.email)
execute function public.sync_users_profile_email();

revoke update (email) on table public.users_profile from authenticated;

commit;
