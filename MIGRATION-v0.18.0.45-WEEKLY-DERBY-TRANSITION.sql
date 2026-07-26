-- WGANG Portal v0.18.0.45
-- Ukentlig overgang til neste derby/påmelding.
--
-- Mål:
-- 1) Søndag kl. 18.00 Europe/Oslo blir neste tirsdags derby den aktive
--    påmeldingskonteksten.
-- 2) Deltakelsessvar nullstilles UTEN å slette historikk, fordi neste derby
--    får sin egen derby_events-rad og dermed egne derby_event_participation-rader.
-- 3) Finnes allerede et publisert/opprettet derby for neste tirsdag, brukes det.
--    Hvis ikke opprettes "Normal derby" fra aktiv Normal/Standard-mal.
-- 4) Kan kjøres flere ganger uten dubletter.
--
-- Funksjonen kalles automatisk av portalen ved innlasting/refresh.
-- Den siste SELECT-en gjør også overgangen umiddelbart når denne migreringen
-- kjøres i SQL Editor denne søndagen.

create table if not exists public.derby_weekly_transitions (
  derby_start_at timestamptz primary key,
  event_id bigint references public.derby_events(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.derby_weekly_transitions enable row level security;
revoke all on public.derby_weekly_transitions from anon, authenticated;

create or replace function public.ensure_weekly_derby_transition()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now_oslo timestamp without time zone := timezone('Europe/Oslo', now());
  v_dow integer;
  v_minutes integer;
  v_days_to_tuesday integer;
  v_start_date date;
  v_start_at timestamptz;
  v_deadline_at timestamptz;
  v_end_at timestamptz;
  v_event_id bigint;
  v_template public.derby_templates%rowtype;
  v_creator uuid;
begin
  -- Kun SQL Editor/postgres eller godkjent medlem får trigge den faste,
  -- parameterløse overgangen.
  if auth.uid() is null then
    if session_user <> 'postgres' then
      return null;
    end if;
  elsif not public.is_approved_member() then
    return null;
  end if;

  v_dow := extract(dow from v_now_oslo)::integer;
  v_minutes := extract(hour from v_now_oslo)::integer * 60
               + extract(minute from v_now_oslo)::integer;

  -- Påmeldingsvindu: søndag 18:00 -> tirsdag 10:00.
  if not (
    (v_dow = 0 and v_minutes >= 18 * 60)
    or v_dow = 1
    or (v_dow = 2 and v_minutes < 10 * 60)
  ) then
    return null;
  end if;

  v_days_to_tuesday := (2 - v_dow + 7) % 7;
  v_start_date := v_now_oslo::date + v_days_to_tuesday;
  v_start_at := (v_start_date + time '10:00') at time zone 'Europe/Oslo';
  v_deadline_at := ((v_start_date - 1) + time '23:00') at time zone 'Europe/Oslo';
  v_end_at := ((v_start_date + 7) + time '10:00') at time zone 'Europe/Oslo';

  -- Unngå race dersom flere medlemmer åpner portalen samtidig.
  perform pg_advisory_xact_lock(hashtext('wgang-derby-' || v_start_at::text));

  select t.event_id
    into v_event_id
  from public.derby_weekly_transitions t
  where t.derby_start_at = v_start_at;

  if v_event_id is not null then
    return v_event_id;
  end if;

  -- Dersom ledelsen allerede har opprettet neste ukes derby, behold derbytypen.
  select e.id
    into v_event_id
  from public.derby_events e
  where e.start_at = v_start_at
  order by e.id desc
  limit 1;

  if v_event_id is null then
    -- Normal er standard/fallback. Legacy-navnet Standard støttes.
    select *
      into v_template
    from public.derby_templates t
    where t.is_active = true
      and (
        lower(t.name) in ('normal derby', 'standard derby', 'normal', 'standard')
        or lower(coalesce(t.slug,'')) in ('normal','normal-derby','standard','standard-derby')
      )
    order by
      case
        when lower(t.name) in ('normal derby','normal') then 0
        when lower(coalesce(t.slug,'')) in ('normal','normal-derby') then 1
        else 2
      end,
      t.id
    limit 1;

    if not found then
      raise exception 'Fant ingen aktiv Normal/Standard-derbymal. Opprett/aktiver malen i Derbyadministrasjon.';
    end if;

    select p.id
      into v_creator
    from public.profiles p
    where p.status = 'approved' and p.role = 'owner'
    order by p.id
    limit 1;

    if v_creator is null then
      v_creator := auth.uid();
    end if;

    insert into public.derby_events (
      template_id,
      name,
      status,
      start_at,
      end_at,
      signup_deadline,
      task_total,
      extra_tasks,
      max_points,
      daily_task_limit,
      description,
      rules,
      strategy,
      published_at,
      created_by,
      updated_at
    )
    values (
      v_template.id,
      'Normal derby',
      'published',
      v_start_at,
      v_end_at,
      v_deadline_at,
      v_template.default_task_total,
      coalesce(v_template.default_extra_tasks,0),
      v_template.default_max_points,
      v_template.daily_task_limit,
      v_template.description,
      coalesce(v_template.rules,'[]'::jsonb),
      coalesce(v_template.strategy,'[]'::jsonb),
      now(),
      v_creator,
      now()
    )
    returning id into v_event_id;

    insert into public.derby_settings (
      id,type,task_total,max_points,strategy,updated_at
    )
    values (
      1,
      'Normal derby',
      coalesce(v_template.default_task_total,9),
      coalesce(v_template.default_max_points,320),
      coalesce(v_template.strategy,'[]'::jsonb),
      now()
    )
    on conflict (id) do update
    set type = excluded.type,
        task_total = excluded.task_total,
        max_points = excluded.max_points,
        strategy = excluded.strategy,
        updated_at = excluded.updated_at;
  end if;

  insert into public.derby_weekly_transitions (derby_start_at,event_id)
  values (v_start_at,v_event_id)
  on conflict (derby_start_at)
  do update set event_id = excluded.event_id;

  return v_event_id;
end;
$$;

revoke all on function public.ensure_weekly_derby_transition() from public, anon;
grant execute on function public.ensure_weekly_derby_transition() to authenticated;

-- Umiddelbar overgang denne uken dersom SQL-en kjøres i påmeldingsvinduet.
-- I SQL Editor kjøres dette som postgres.
select public.ensure_weekly_derby_transition() as next_derby_event_id;

-- Kontroll: neste tirsdags event skal stå øverst og ha tom påmelding i utgangspunktet.
select
  e.id,
  e.name,
  e.status,
  e.start_at,
  e.signup_deadline,
  count(p.user_id) as registered_answers
from public.derby_events e
left join public.derby_event_participation p on p.event_id = e.id
where e.start_at >= now() - interval '1 day'
group by e.id,e.name,e.status,e.start_at,e.signup_deadline
order by e.start_at desc
limit 3;
