-- Kjør etter migrasjonen. Skriptet endrer ingen data og stopper ved avvik.
do $$
begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind='r' and not c.relrowsecurity
  ) then
    raise exception 'Minst én offentlig tabell mangler RLS.';
  end if;

  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.prosecdef
      and has_function_privilege('anon',p.oid,'EXECUTE')
  ) then
    raise exception 'anon kan fortsatt kjøre en SECURITY DEFINER-funksjon.';
  end if;

  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='wgang_save_derby_result_v60'
      and has_function_privilege('authenticated',p.oid,'EXECUTE')
  ) then
    raise exception 'Utdatert resultatrutine v60 er fortsatt tilgjengelig.';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname='profiles_sensitive_aal2_v103' and not tgisinternal
  ) then
    raise exception 'MFA-triggeren er ikke installert.';
  end if;
end;
$$;

select 'WGANG security v0.18.0.103: OK' as result;
