-- WGANG Portal v0.18.0.103
-- Kjør etter at portalfilene for v0.18.0.103 er publisert.
-- MFA håndheves for sensitive endringer, misbruk begrenses og 90-dagers
-- opprydding planlegges ukentlig.

begin;

create schema if not exists wgang_private;
revoke all on schema wgang_private from public, anon, authenticated;

create or replace function wgang_private.require_admin_aal2_v103()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Migrasjoner, cron og andre betrodde serverjobber har ingen sluttbruker-JWT.
  if auth.uid() is not null
     and coalesce(auth.jwt() ->> 'aal', 'aal1') <> 'aal2' then
    raise exception 'Denne administrative handlingen krever tofaktorautentisering.'
      using errcode = '42501';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function wgang_private.require_admin_aal2_v103() from public, anon, authenticated;

drop trigger if exists profiles_sensitive_aal2_v103 on public.profiles;
create trigger profiles_sensitive_aal2_v103
before update of role, status on public.profiles
for each row
when (old.role is distinct from new.role or old.status is distinct from new.status)
execute function wgang_private.require_admin_aal2_v103();

drop trigger if exists role_permissions_aal2_v103 on public.role_permissions;
create trigger role_permissions_aal2_v103
before insert or update or delete on public.role_permissions
for each row execute function wgang_private.require_admin_aal2_v103();

drop trigger if exists derby_events_aal2_v103 on public.derby_events;
create trigger derby_events_aal2_v103
before insert or update or delete on public.derby_events
for each row execute function wgang_private.require_admin_aal2_v103();

drop trigger if exists derby_result_archives_aal2_v103 on public.derby_result_archives;
create trigger derby_result_archives_aal2_v103
before insert or update or delete on public.derby_result_archives
for each row execute function wgang_private.require_admin_aal2_v103();

drop trigger if exists derby_member_results_aal2_v103 on public.derby_member_results;
create trigger derby_member_results_aal2_v103
before insert or update or delete on public.derby_member_results
for each row execute function wgang_private.require_admin_aal2_v103();

drop trigger if exists derby_result_change_log_aal2_v103 on public.derby_result_change_log;
create trigger derby_result_change_log_aal2_v103
before insert or update or delete on public.derby_result_change_log
for each row execute function wgang_private.require_admin_aal2_v103();

create or replace function wgang_private.limit_private_messages_v103()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then return new; end if;
  if new.sender_id is distinct from auth.uid() then
    raise exception 'Avsenderen er ugyldig.' using errcode = '42501';
  end if;
  if (select count(*) from public.private_messages m
      where m.sender_id = auth.uid()
        and m.created_at >= pg_catalog.now() - interval '5 minutes') >= 20 then
    raise exception 'Du har sendt mange meldinger på kort tid. Vent noen minutter og prøv igjen.'
      using errcode = 'P0001';
  end if;
  if (select count(*) from public.private_messages m
      where m.sender_id = auth.uid()
        and m.created_at >= pg_catalog.now() - interval '1 day') >= 300 then
    raise exception 'Dagsgrensen for private meldinger er nådd.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create or replace function wgang_private.limit_social_comments_v103()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then return new; end if;
  if new.user_id is distinct from auth.uid() then
    raise exception 'Kommentator er ugyldig.' using errcode = '42501';
  end if;
  if (select count(*) from public.social_comments c
      where c.user_id = auth.uid()
        and c.created_at >= pg_catalog.now() - interval '5 minutes') >= 30 then
    raise exception 'Du har kommentert mange ganger på kort tid. Vent noen minutter.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create or replace function wgang_private.limit_community_posts_v103()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then return new; end if;
  if new.author_id is distinct from auth.uid() then
    raise exception 'Forfatter er ugyldig.' using errcode = '42501';
  end if;
  if (select count(*) from public.community_content c
      where c.author_id = auth.uid()
        and c.created_at >= pg_catalog.now() - interval '1 hour') >= 12 then
    raise exception 'Du har publisert mange innlegg på kort tid. Vent før du prøver igjen.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke all on function wgang_private.limit_private_messages_v103() from public, anon, authenticated;
revoke all on function wgang_private.limit_social_comments_v103() from public, anon, authenticated;
revoke all on function wgang_private.limit_community_posts_v103() from public, anon, authenticated;

drop trigger if exists private_messages_rate_v103 on public.private_messages;
create trigger private_messages_rate_v103 before insert on public.private_messages
for each row execute function wgang_private.limit_private_messages_v103();

drop trigger if exists social_comments_rate_v103 on public.social_comments;
create trigger social_comments_rate_v103 before insert on public.social_comments
for each row execute function wgang_private.limit_social_comments_v103();

drop trigger if exists community_content_rate_v103 on public.community_content;
create trigger community_content_rate_v103 before insert on public.community_content
for each row execute function wgang_private.limit_community_posts_v103();

create table if not exists wgang_private.retention_runs (
  id bigint generated always as identity primary key,
  ran_at timestamptz not null default pg_catalog.now(),
  deleted_accounts integer not null,
  skipped_accounts integer not null
);
revoke all on table wgang_private.retention_runs from public, anon, authenticated;

create or replace function wgang_private.cleanup_expired_accounts_v103()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate record;
  deleted_count integer := 0;
  skipped_count integer := 0;
begin
  for candidate in
    select p.id
    from public.profiles p
    where p.status::text in ('rejected','removed')
      and p.updated_at < pg_catalog.now() - interval '90 days'
    order by p.updated_at
  loop
    begin
      delete from auth.users where id = candidate.id;
      if found then
        deleted_count := deleted_count + 1;
      else
        delete from public.profiles where id = candidate.id;
        if found then deleted_count := deleted_count + 1; end if;
      end if;
    exception
      when foreign_key_violation then
        skipped_count := skipped_count + 1;
    end;
  end loop;

  insert into wgang_private.retention_runs(deleted_accounts,skipped_accounts)
  values (deleted_count,skipped_count);

  delete from wgang_private.retention_runs
  where ran_at < pg_catalog.now() - interval '1 year';

  return pg_catalog.jsonb_build_object(
    'deleted', deleted_count,
    'skipped_for_review', skipped_count
  );
end;
$$;

revoke all on function wgang_private.cleanup_expired_accounts_v103() from public, anon, authenticated;

-- Oppdaterer samme navngitte jobb hvis migrasjonen kjøres på nytt.
select cron.schedule(
  'wgang-retention-v103',
  '30 3 * * 1',
  'select wgang_private.cleanup_expired_accounts_v103();'
);

-- SECURITY DEFINER-funksjoner skal aldri være åpne for PUBLIC/anon.
do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
  loop
    execute pg_catalog.format('revoke all on function %s from public, anon', fn.signature);
  end loop;
end;
$$;

-- Den gamle resultatrutinen er erstattet av v76 og skal ikke kunne kalles.
do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'wgang_save_derby_result_v60'
  loop
    execute pg_catalog.format('revoke all on function %s from authenticated', fn.signature);
  end loop;
end;
$$;

commit;
