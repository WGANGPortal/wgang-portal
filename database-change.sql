-- Shared product names. Individual readiness remains in task_preferences.
create table public.task_product_catalog (
  name text primary key,
  created_at timestamptz not null default now(),
  constraint task_product_catalog_valid_name check (
    char_length(name) between 1 and 60
    and name = lower(btrim(regexp_replace(name, '[[:space:]]+', ' ', 'g')))
    and name !~ '[<>[:cntrl:]]'
  )
);
alter table public.task_product_catalog enable row level security;
revoke all on public.task_product_catalog from public, anon, authenticated;
grant select, insert on public.task_product_catalog to authenticated;
create policy task_product_catalog_read on public.task_product_catalog
  for select to authenticated using (
    public.has_wgang_permission('derby.plan') or public.has_wgang_permission('derby.preferences.view')
  );
create policy task_product_catalog_add on public.task_product_catalog
  for insert to authenticated with check (public.has_wgang_permission('derby.plan'));

create function wgang_private.remember_task_product_v125()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare product_name text;
begin
  if left(new.task_type,9) = 'Produkt: ' then
    product_name := lower(btrim(regexp_replace(normalize(substring(new.task_type from 10), NFC), '[[:space:]]+', ' ', 'g')));
    if char_length(product_name) between 1 and 60 and product_name !~ '[<>[:cntrl:]]' then
      insert into public.task_product_catalog(name) values(product_name) on conflict(name) do nothing;
    end if;
  end if;
  return new;
end;
$$;
revoke all on function wgang_private.remember_task_product_v125() from public, anon, authenticated;
create trigger task_preferences_remember_product_v125
  after insert or update of task_type on public.task_preferences
  for each row execute function wgang_private.remember_task_product_v125();

insert into public.task_product_catalog(name)
select distinct name from (
  select lower(btrim(regexp_replace(normalize(substring(task_type from 10), NFC), '[[:space:]]+', ' ', 'g'))) name
  from public.task_preferences where left(task_type,9) = 'Produkt: '
) existing where char_length(name) between 1 and 60 and name !~ '[<>[:cntrl:]]'
on conflict(name) do nothing;
notify pgrst, 'reload schema';
