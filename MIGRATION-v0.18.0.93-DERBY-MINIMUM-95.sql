-- WGANG Portal v0.18.0.93
-- 95 % minimum, rules v2 and one-derby suspension after a result below minimum.

alter table public.derby_member_results
  drop column minimum_met;

alter table public.derby_member_results
  add column minimum_met boolean generated always as (
    case
      when included_tasks * points_per_task > 0
        then points_earned::numeric >= (included_tasks * points_per_task)::numeric * 0.95
      else false
    end
  ) stored;

comment on column public.derby_member_results.minimum_met is
  'True when the result reaches WGANG minimum of 95 percent of the included maximum score.';

create or replace function public.wgang_set_game_participation(
  p_event_id bigint,
  p_game_identity_id bigint,
  p_choice text,
  p_rules_accepted boolean default false
)
returns public.derby_game_participation
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_user uuid := (select auth.uid());
  v_event public.derby_events;
  v_identity public.member_game_identities;
  v_row public.derby_game_participation;
  v_lock timestamptz;
  v_aggregate text;
  v_joined public.derby_game_participation;
  v_previous_archive_id bigint;
  v_previous_percent numeric;
  v_rules_version text;
begin
  if v_user is null or not public.is_approved_member() or not public.has_wgang_permission('derby.plan') then
    raise exception 'Ingen tilgang.' using errcode='42501';
  end if;
  if p_choice not in ('joined','pause','unsure') then
    raise exception 'Ugyldig derby-svar.';
  end if;
  select * into v_identity
  from public.member_game_identities
  where id=p_game_identity_id and user_id=v_user;
  if not found then
    raise exception 'Spillprofilen tilhører ikke innlogget bruker.' using errcode='42501';
  end if;
  select * into v_event
  from public.derby_events
  where id=p_event_id and status in ('published','active');
  if not found then
    raise exception 'Derbyet er ikke tilgjengelig for påmelding.';
  end if;
  if exists(
    select 1 from public.derby_event_participation
    where event_id=p_event_id and user_id=v_user and choice='removed'
  ) then
    raise exception 'Ledelsen har meldt deg av dette derbyet. Deltakelsen er låst.' using errcode='42501';
  end if;
  if v_event.start_at is not null then
    v_lock:=least(v_event.start_at,greatest(coalesce(v_event.signup_deadline,v_event.start_at-interval '2 hours'),v_event.start_at-interval '2 hours'));
  else
    v_lock:=v_event.signup_deadline;
  end if;
  if v_lock is not null and now()>=v_lock then
    raise exception 'Svarfristen er utløpt.';
  end if;
  if p_choice='joined' and not coalesce(p_rules_accepted,false) then
    raise exception 'Derbyreglene må bekreftes.';
  end if;

  if p_choice='joined' then
    select archive.id into v_previous_archive_id
    from public.derby_result_archives archive
    where coalesce(archive.ended_at,archive.started_at) < v_event.start_at
    order by coalesce(archive.ended_at,archive.started_at) desc, archive.id desc
    limit 1;

    if v_previous_archive_id is not null then
      select result.result_percent into v_previous_percent
      from public.derby_member_results result
      where result.archive_id=v_previous_archive_id and result.user_id=v_user;
    end if;

    if v_previous_percent is not null and v_previous_percent < 95 then
      raise exception 'Du nådde ikke minimumskravet på 95 %% i forrige derby og kan derfor ikke melde deg på dette derbyet.' using errcode='42501';
    end if;
  end if;

  v_rules_version:=case
    when v_event.start_at < timestamptz '2026-10-13 08:00:00+00' then 'WGANG-DERBY-RULES-v1'
    else 'WGANG-DERBY-RULES-v2'
  end;

  insert into public.derby_game_participation(
    event_id,game_identity_id,user_id,choice,rules_acknowledged_at,
    rules_acknowledgement_version,acknowledged_max_points,updated_at
  ) values(
    p_event_id,p_game_identity_id,v_user,p_choice,
    case when p_choice='joined' then now() end,
    case when p_choice='joined' then v_rules_version end,
    case when p_choice='joined' then v_event.max_points end,now()
  )
  on conflict(event_id,game_identity_id) do update
    set choice=excluded.choice,
        rules_acknowledged_at=excluded.rules_acknowledged_at,
        rules_acknowledgement_version=excluded.rules_acknowledgement_version,
        acknowledged_max_points=excluded.acknowledged_max_points,
        updated_at=now()
  returning * into v_row;

  select case
    when bool_or(choice='joined') then 'joined'
    when bool_or(choice='unsure') then 'unsure'
    else 'pause'
  end into v_aggregate
  from public.derby_game_participation
  where event_id=p_event_id and user_id=v_user;

  select * into v_joined
  from public.derby_game_participation
  where event_id=p_event_id and user_id=v_user and choice='joined'
  order by updated_at desc limit 1;

  insert into public.derby_event_participation(
    event_id,user_id,choice,rules_acknowledged_at,
    rules_acknowledgement_version,acknowledged_max_points,updated_at
  ) values(
    p_event_id,v_user,v_aggregate,
    case when v_aggregate='joined' then v_joined.rules_acknowledged_at end,
    case when v_aggregate='joined' then v_joined.rules_acknowledgement_version end,
    case when v_aggregate='joined' then v_joined.acknowledged_max_points end,
    now()
  )
  on conflict(event_id,user_id) do update
    set choice=excluded.choice,
        rules_acknowledged_at=excluded.rules_acknowledged_at,
        rules_acknowledgement_version=excluded.rules_acknowledgement_version,
        acknowledged_max_points=excluded.acknowledged_max_points,
        updated_at=now();
  return v_row;
end;
$function$;

revoke all on function public.wgang_set_game_participation(bigint,bigint,text,boolean) from public, anon;
grant execute on function public.wgang_set_game_participation(bigint,bigint,text,boolean) to authenticated;

create or replace function wgang_private.remove_ineligible_next_signup_v93()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_archive public.derby_result_archives;
  v_next_event_id bigint;
begin
  if new.user_id is null or new.result_percent >= 95 then
    return new;
  end if;

  select * into v_archive
  from public.derby_result_archives
  where id=new.archive_id;

  if not found then
    return new;
  end if;

  select event.id into v_next_event_id
  from public.derby_events event
  where event.start_at > coalesce(v_archive.ended_at,v_archive.started_at)
    and event.start_at > now()
    and event.status='published'
  order by event.start_at, event.id
  limit 1;

  if v_next_event_id is not null then
    delete from public.derby_game_participation
    where event_id=v_next_event_id and user_id=new.user_id and choice='joined';

    delete from public.derby_event_participation
    where event_id=v_next_event_id and user_id=new.user_id and choice='joined';
  end if;

  return new;
end;
$function$;

revoke all on function wgang_private.remove_ineligible_next_signup_v93() from public, anon, authenticated;

drop trigger if exists derby_result_remove_ineligible_next_signup_v93
  on public.derby_member_results;

create trigger derby_result_remove_ineligible_next_signup_v93
after insert or update of included_tasks,points_per_task,points_earned
on public.derby_member_results
for each row
execute function wgang_private.remove_ineligible_next_signup_v93();
