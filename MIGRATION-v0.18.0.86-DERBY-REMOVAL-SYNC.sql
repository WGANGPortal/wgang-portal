-- WGANG Portal v0.18.0.86
-- Holder hovedpåmelding og spillprofilpåmelding samlet når eier/admin melder av.

alter table public.derby_game_participation
  drop constraint if exists derby_game_participation_choice_check;

alter table public.derby_game_participation
  add constraint derby_game_participation_choice_check
  check (choice in ('joined','pause','unsure','waiting','removed'));

create or replace function public.wgang_admin_remove_derby_participant(
  p_event_id bigint,
  p_user_id uuid,
  p_reason_code text,
  p_message text
)
returns public.derby_event_participation
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid:=auth.uid();
  v_actor_role text;
  v_message text:=trim(coalesce(p_message,''));
  v_row public.derby_event_participation%rowtype;
begin
  select role into v_actor_role
  from public.profiles
  where id=v_actor and status='approved';

  if v_actor is null
     or v_actor_role not in ('owner','admin')
     or not public.has_wgang_permission('derby.participation.remove') then
    raise exception 'Bare eier eller admin kan melde av derbydeltakere.' using errcode='42501';
  end if;
  if p_user_id=v_actor then
    raise exception 'Du kan ikke melde av din egen profil her.' using errcode='22023';
  end if;
  if p_reason_code not in ('insufficient_results','commitment_not_met','other') then
    raise exception 'Velg en gyldig begrunnelse.' using errcode='22023';
  end if;
  if char_length(v_message) not between 10 and 500 then
    raise exception 'Begrunnelsen må være mellom 10 og 500 tegn.' using errcode='22023';
  end if;
  if not exists(
    select 1 from public.derby_events
    where id=p_event_id and status in ('published','active')
  ) then
    raise exception 'Derbyet kan ikke endres i denne fasen.' using errcode='22023';
  end if;

  perform set_config('wgang.derby_admin_action','1',true);
  update public.derby_event_participation
     set choice='removed',removed_at=now(),removed_by=v_actor,
         rules_acknowledged_at=null,rules_acknowledgement_version=null,
         acknowledged_max_points=null,updated_at=now()
   where event_id=p_event_id and user_id=p_user_id and choice='joined'
   returning * into v_row;

  if not found then
    raise exception 'Spillprofilen er ikke registrert som deltaker i dette derbyet.' using errcode='P0002';
  end if;

  update public.derby_game_participation
     set choice='removed',rules_acknowledged_at=null,
         rules_acknowledgement_version=null,acknowledged_max_points=null,
         updated_at=now()
   where event_id=p_event_id and user_id=p_user_id;

  insert into public.derby_participation_admin_actions(
    event_id,user_id,action,reason_code,message,acted_by
  ) values(
    p_event_id,p_user_id,'removed',p_reason_code,v_message,v_actor
  );

  insert into public.activity_notifications(
    recipient_id,actor_id,activity_type,target_type,target_id,title,body
  ) values(
    p_user_id,v_actor,'derby_removed','derby_event',p_event_id::text,
    'Du er meldt av derby',v_message
  );
  return v_row;
end;
$$;

revoke all on function public.wgang_admin_remove_derby_participant(bigint,uuid,text,text) from public,anon;
grant execute on function public.wgang_admin_remove_derby_participant(bigint,uuid,text,text) to authenticated;

create or replace function public.wgang_set_game_participation(
  p_event_id bigint,
  p_game_identity_id bigint,
  p_choice text,
  p_rules_accepted boolean default false
)
returns public.derby_game_participation
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid:=(select auth.uid());
  v_event public.derby_events;
  v_identity public.member_game_identities;
  v_row public.derby_game_participation;
  v_lock timestamptz;
  v_aggregate text;
  v_joined public.derby_game_participation;
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

  insert into public.derby_game_participation(
    event_id,game_identity_id,user_id,choice,rules_acknowledged_at,
    rules_acknowledgement_version,acknowledged_max_points,updated_at
  ) values(
    p_event_id,p_game_identity_id,v_user,p_choice,
    case when p_choice='joined' then now() end,
    case when p_choice='joined' then 'WGANG-DERBY-RULES-v1' end,
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
$$;

revoke all on function public.wgang_set_game_participation(bigint,bigint,text,boolean) from public,anon;
grant execute on function public.wgang_set_game_participation(bigint,bigint,text,boolean) to authenticated;

-- Rett opp eksisterende avmeldinger, blant annet Hagen i aktivt Power Derby.
update public.derby_game_participation gp
set choice='removed',rules_acknowledged_at=null,
    rules_acknowledgement_version=null,acknowledged_max_points=null,
    updated_at=now()
where exists(
  select 1
  from public.derby_event_participation ep
  where ep.event_id=gp.event_id
    and ep.user_id=gp.user_id
    and ep.choice='removed'
);
