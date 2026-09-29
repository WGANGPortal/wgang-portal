-- WGANG Portal v0.18.0.85
-- Holder den ukentlige overgangsraden synkronisert når ledelsen publiserer
-- en spesialtype etter at standardderbyet allerede er opprettet.

create or replace function public.sync_weekly_transition_to_published_derby()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_oslo_start timestamp without time zone;
begin
  if new.status not in ('published','active') or new.start_at is null then
    return new;
  end if;

  v_oslo_start := pg_catalog.timezone('Europe/Oslo', new.start_at);
  if extract(isodow from v_oslo_start) <> 2
     or v_oslo_start::time <> time '10:00' then
    return new;
  end if;

  insert into public.derby_weekly_transitions (derby_start_at,event_id)
  values (new.start_at,new.id)
  on conflict (derby_start_at)
  do update set event_id = excluded.event_id;

  return new;
end;
$$;

revoke all on function public.sync_weekly_transition_to_published_derby() from public, anon, authenticated;

drop trigger if exists sync_weekly_transition_to_published_derby on public.derby_events;
create trigger sync_weekly_transition_to_published_derby
after insert or update of status,start_at,published_at on public.derby_events
for each row execute function public.sync_weekly_transition_to_published_derby();

-- Korriger denne ukens parallelle standardrad og aktiver riktig Power Derby.
update public.derby_events
set end_at = start_at,
    updated_at = pg_catalog.now()
where id = 14
  and name = 'Normal derby'
  and status = 'completed'
  and start_at = timestamptz '2026-09-29 08:00:00+00';

update public.derby_events
set status = 'active',
    updated_at = pg_catalog.now()
where id = 15
  and name = 'Power Derby'
  and status = 'published'
  and start_at = timestamptz '2026-09-29 08:00:00+00';

update public.derby_weekly_transitions
set event_id = 15
where derby_start_at = timestamptz '2026-09-29 08:00:00+00'
  and event_id = 14;
