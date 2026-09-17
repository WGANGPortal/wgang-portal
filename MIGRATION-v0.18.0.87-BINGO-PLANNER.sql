-- WGANG Portal v0.18.0.87
-- Bingobrett, bindende oppgavefordeling og privat beredskap.

create table if not exists public.bingo_plans (
  id bigint generated always as identity primary key,
  event_id bigint not null unique references public.derby_events(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft','published','active','completed')),
  target_points integer not null default 28800 check (target_points > 0),
  max_points integer not null default 320 check (max_points > 0),
  commitments_per_profile integer not null default 5 check (commitments_per_profile between 1 and 20),
  planned_standby_count integer not null default 3 check (planned_standby_count between 0 and 20),
  reward_line_count integer not null default 3 check (reward_line_count between 1 and 10),
  strategy_lines jsonb not null default '[]'::jsonb check (jsonb_typeof(strategy_lines) = 'array'),
  instructions text,
  created_by uuid not null default auth.uid() references public.profiles(id),
  updated_by uuid not null default auth.uid() references public.profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bingo_board_cells (
  id bigint generated always as identity primary key,
  plan_id bigint not null references public.bingo_plans(id) on delete cascade,
  position smallint not null check (position between 1 and 16),
  task_name text not null check (char_length(btrim(task_name)) between 1 and 80),
  task_type text,
  icon text,
  image_key text,
  required_count smallint not null default 4 check (required_count between 0 and 20),
  classification text not null default 'free' check (classification in ('focus','free','delete')),
  is_blocked boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(plan_id, position)
);

create table if not exists public.bingo_assignments (
  id bigint generated always as identity primary key,
  plan_id bigint not null references public.bingo_plans(id) on delete cascade,
  cell_id bigint not null references public.bingo_board_cells(id) on delete cascade,
  slot_number smallint not null check (slot_number between 1 and 20),
  game_identity_id bigint not null references public.member_game_identities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting','in_progress','completed','problem','reassigned')),
  actual_details text,
  actual_deadline timestamptz,
  points integer check (points is null or points between 0 and 1000),
  claimed_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(cell_id, slot_number)
);

create index if not exists bingo_assignments_plan_identity_idx
  on public.bingo_assignments(plan_id, game_identity_id);
create index if not exists bingo_assignments_cell_idx
  on public.bingo_assignments(cell_id);

create table if not exists public.bingo_standby (
  id bigint generated always as identity primary key,
  plan_id bigint not null references public.bingo_plans(id) on delete cascade,
  game_identity_id bigint not null references public.member_game_identities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reserved_slots smallint not null default 3 check (reserved_slots between 1 and 20),
  status text not null default 'selected' check (status in ('selected','confirmed','activated','released')),
  private_note text,
  selected_by uuid not null default auth.uid() references public.profiles(id),
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(plan_id, game_identity_id)
);

create or replace function public.wgang_bingo_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.status = 'approved'
      and p.role in ('owner','admin')
  );
$$;

revoke all on function public.wgang_bingo_is_admin() from public, anon;
grant execute on function public.wgang_bingo_is_admin() to authenticated;

create or replace function public.wgang_bingo_assignment_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner uuid;
  v_event bigint;
  v_plan_status text;
  v_limit integer;
  v_required integer;
  v_count integer;
  v_slot integer;
  v_admin boolean := public.wgang_bingo_is_admin();
begin
  select i.user_id into v_owner
  from public.member_game_identities i
  where i.id = new.game_identity_id;
  if not found then raise exception 'Spillprofilen finnes ikke.'; end if;

  select p.event_id, p.status, p.commitments_per_profile
    into v_event, v_plan_status, v_limit
  from public.bingo_plans p where p.id = new.plan_id;
  if not found then raise exception 'Bingoplanen finnes ikke.'; end if;

  select c.required_count into v_required
  from public.bingo_board_cells c
  where c.id = new.cell_id and c.plan_id = new.plan_id and not c.is_blocked;
  if not found or v_required < 1 then raise exception 'Denne ruten kan ikke velges.'; end if;

  if not exists (
    select 1 from public.derby_game_participation d
    where d.event_id = v_event and d.game_identity_id = new.game_identity_id
      and d.user_id = v_owner and d.choice = 'joined'
  ) then raise exception 'Spillprofilen er ikke påmeldt dette derbyet.'; end if;

  new.user_id := v_owner;

  if tg_op = 'UPDATE' then
    if not v_admin and (
      new.plan_id <> old.plan_id or new.cell_id <> old.cell_id
      or new.slot_number <> old.slot_number or new.game_identity_id <> old.game_identity_id
      or new.user_id <> old.user_id
    ) then raise exception 'En bindende oppgave kan ikke flyttes av spilleren.'; end if;
  else
    if not v_admin then
      if auth.uid() is distinct from v_owner then raise exception 'Du kan bare velge for egne spillprofiler.'; end if;
      if v_plan_status not in ('published','active') then raise exception 'Bingoplanen er ikke åpnet.'; end if;
      if exists (
        select 1 from public.bingo_standby s
        where s.plan_id = new.plan_id and s.game_identity_id = new.game_identity_id
          and s.status in ('selected','confirmed','activated')
      ) then raise exception 'Beredskapsprofiler skal holde oppgaver ledige.'; end if;
    end if;

    select count(*) into v_count from public.bingo_assignments a
    where a.plan_id = new.plan_id and a.game_identity_id = new.game_identity_id
      and a.status <> 'reassigned';
    if not v_admin and v_count >= v_limit then
      raise exception 'Spillprofilen har allerede bundet seg til % oppgaver.', v_limit;
    end if;

    select s into v_slot
    from generate_series(1, v_required) s
    where not exists (
      select 1 from public.bingo_assignments a
      where a.cell_id = new.cell_id and a.slot_number = s and a.status <> 'reassigned'
    ) order by s limit 1;
    if v_slot is null then raise exception 'Alle plassene på denne oppgaven er fordelt.'; end if;
    new.slot_number := v_slot;
  end if;

  new.updated_at := now();
  if new.status = 'in_progress' and new.started_at is null then new.started_at := now(); end if;
  if new.status = 'completed' and new.completed_at is null then new.completed_at := now(); end if;
  return new;
end;
$$;

drop trigger if exists bingo_assignment_guard on public.bingo_assignments;
create trigger bingo_assignment_guard
before insert or update on public.bingo_assignments
for each row execute function public.wgang_bingo_assignment_guard();

create or replace function public.wgang_bingo_standby_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_owner uuid;
begin
  select i.user_id into v_owner from public.member_game_identities i where i.id = new.game_identity_id;
  if not found then raise exception 'Spillprofilen finnes ikke.'; end if;
  new.user_id := v_owner;
  if tg_op = 'UPDATE' and not public.wgang_bingo_is_admin() then
    if auth.uid() is distinct from old.user_id
       or new.plan_id <> old.plan_id
       or new.game_identity_id <> old.game_identity_id
       or new.user_id <> old.user_id
       or new.reserved_slots <> old.reserved_slots
       or new.private_note is distinct from old.private_note
       or old.status not in ('selected','confirmed')
       or new.status <> 'confirmed' then
      raise exception 'Du kan bare bekrefte din egen beredskapsrolle.';
    end if;
  end if;
  new.updated_at := now();
  if new.status = 'activated' and new.activated_at is null then new.activated_at := now(); end if;
  return new;
end;
$$;

drop trigger if exists bingo_standby_guard on public.bingo_standby;
create trigger bingo_standby_guard before insert or update on public.bingo_standby
for each row execute function public.wgang_bingo_standby_guard();

alter table public.bingo_plans enable row level security;
alter table public.bingo_board_cells enable row level security;
alter table public.bingo_assignments enable row level security;
alter table public.bingo_standby enable row level security;

drop policy if exists bingo_plans_read on public.bingo_plans;
create policy bingo_plans_read on public.bingo_plans for select to authenticated
using (public.is_approved_member() and (status <> 'draft' or public.wgang_bingo_is_admin()));
drop policy if exists bingo_plans_admin on public.bingo_plans;
drop policy if exists bingo_plans_admin_insert on public.bingo_plans;
drop policy if exists bingo_plans_admin_update on public.bingo_plans;
drop policy if exists bingo_plans_admin_delete on public.bingo_plans;
create policy bingo_plans_admin on public.bingo_plans for all to authenticated
using (public.wgang_bingo_is_admin()) with check (public.wgang_bingo_is_admin());

drop policy if exists bingo_cells_read on public.bingo_board_cells;
create policy bingo_cells_read on public.bingo_board_cells for select to authenticated
using (public.is_approved_member() and exists (
  select 1 from public.bingo_plans p where p.id = plan_id
    and (p.status <> 'draft' or public.wgang_bingo_is_admin())
));
drop policy if exists bingo_cells_admin on public.bingo_board_cells;
drop policy if exists bingo_cells_admin_insert on public.bingo_board_cells;
drop policy if exists bingo_cells_admin_update on public.bingo_board_cells;
drop policy if exists bingo_cells_admin_delete on public.bingo_board_cells;
create policy bingo_cells_admin on public.bingo_board_cells for all to authenticated
using (public.wgang_bingo_is_admin()) with check (public.wgang_bingo_is_admin());

drop policy if exists bingo_assignments_read on public.bingo_assignments;
create policy bingo_assignments_read on public.bingo_assignments for select to authenticated
using (public.is_approved_member() and exists (
  select 1 from public.bingo_plans p where p.id = plan_id
    and (p.status <> 'draft' or public.wgang_bingo_is_admin())
));
drop policy if exists bingo_assignments_insert on public.bingo_assignments;
create policy bingo_assignments_insert on public.bingo_assignments for insert to authenticated
with check (public.is_approved_member() and (user_id = auth.uid() or public.wgang_bingo_is_admin()));
drop policy if exists bingo_assignments_update on public.bingo_assignments;
create policy bingo_assignments_update on public.bingo_assignments for update to authenticated
using (user_id = auth.uid() or public.wgang_bingo_is_admin())
with check (user_id = auth.uid() or public.wgang_bingo_is_admin());
drop policy if exists bingo_assignments_admin_delete on public.bingo_assignments;
create policy bingo_assignments_admin_delete on public.bingo_assignments for delete to authenticated
using (public.wgang_bingo_is_admin());

drop policy if exists bingo_standby_private_read on public.bingo_standby;
create policy bingo_standby_private_read on public.bingo_standby for select to authenticated
using (user_id = auth.uid() or public.wgang_bingo_is_admin());
drop policy if exists bingo_standby_admin on public.bingo_standby;
create policy bingo_standby_admin on public.bingo_standby for all to authenticated
using (public.wgang_bingo_is_admin()) with check (public.wgang_bingo_is_admin());
drop policy if exists bingo_standby_confirm on public.bingo_standby;
create policy bingo_standby_confirm on public.bingo_standby for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid() and status = 'confirmed');

grant select, insert, update, delete on public.bingo_plans to authenticated;
grant select, insert, update, delete on public.bingo_board_cells to authenticated;
grant select, insert, update, delete on public.bingo_assignments to authenticated;
grant select, insert, update, delete on public.bingo_standby to authenticated;
grant usage, select on sequence public.bingo_plans_id_seq to authenticated;
grant usage, select on sequence public.bingo_board_cells_id_seq to authenticated;
grant usage, select on sequence public.bingo_assignments_id_seq to authenticated;
grant usage, select on sequence public.bingo_standby_id_seq to authenticated;

-- Klargjør et utkast for det pågående bingoderbyet uten å gjette valgte strategilinjer.
with current_bingo as (
  select id, max_points from public.derby_events
  where name ilike '%bingo%' and status in ('published','active')
    and now() between start_at - interval '1 day' and end_at + interval '1 day'
  order by start_at desc limit 1
)
insert into public.bingo_plans(event_id,status,target_points,max_points,commitments_per_profile,planned_standby_count,reward_line_count,instructions,created_by,updated_by)
select e.id,'draft',28800,coalesce(e.max_points,320),5,3,3,
  'Velg fem gjennomførbare bingooppgaver per ordinære spillprofil. Vent med å ta oppgaver til planen er publisert. Beredskap holder avtalte oppgaveplasser ledige.',
  p.id,p.id
from current_bingo e
cross join lateral (select id from public.profiles where role='owner' and status='approved' order by created_at limit 1) p
on conflict (event_id) do nothing;

with plan as (
  select bp.id from public.bingo_plans bp join public.derby_events e on e.id=bp.event_id
  where e.name ilike '%bingo%' and e.status in ('published','active')
  order by e.start_at desc limit 1
), seed(position,task_name,icon,required_count,classification,is_blocked) as (
  values
    (1,'Egg','🥚',5,'free',false),(2,'Produksjonsoppgave','🏭',4,'free',false),
    (3,'Potet','🥔',5,'free',false),(4,'Melk','🥛',4,'free',false),
    (5,'Tog','🚂',4,'free',false),(6,'Ikke i bruk','🚫',0,'delete',true),
    (7,'Ikke i bruk','🚫',0,'delete',true),(8,'Bygjester','🧑',4,'free',false),
    (9,'Båt','🚤',4,'free',false),(10,'Bybygning','🏪',4,'free',false),
    (11,'Høsting','🌾',4,'free',false),(12,'Ikke i bruk','🚫',0,'delete',true),
    (13,'Spesifikk person','🤠',4,'free',false),(14,'Bomull','☁️',4,'free',false),
    (15,'Hjelpeoppgave','❗',4,'free',false),(16,'Lastebil','🚚',4,'free',false)
)
insert into public.bingo_board_cells(plan_id,position,task_name,icon,required_count,classification,is_blocked)
select p.id,s.position,s.task_name,s.icon,s.required_count,s.classification,s.is_blocked from plan p cross join seed s
on conflict (plan_id,position) do nothing;

-- Sikkerhets- og ytelsesherding: triggerfunksjoner skal ikke kunne kalles som RPC.
revoke all on function public.wgang_bingo_assignment_guard() from public, anon, authenticated;
revoke all on function public.wgang_bingo_standby_guard() from public, anon, authenticated;

-- Unngå overlappende SELECT-regler ved å skille admin-skriving fra lesing.
drop policy if exists bingo_plans_admin on public.bingo_plans;
create policy bingo_plans_admin_insert on public.bingo_plans for insert to authenticated
with check (public.wgang_bingo_is_admin());
create policy bingo_plans_admin_update on public.bingo_plans for update to authenticated
using (public.wgang_bingo_is_admin()) with check (public.wgang_bingo_is_admin());
create policy bingo_plans_admin_delete on public.bingo_plans for delete to authenticated
using (public.wgang_bingo_is_admin());

drop policy if exists bingo_cells_admin on public.bingo_board_cells;
create policy bingo_cells_admin_insert on public.bingo_board_cells for insert to authenticated
with check (public.wgang_bingo_is_admin());
create policy bingo_cells_admin_update on public.bingo_board_cells for update to authenticated
using (public.wgang_bingo_is_admin()) with check (public.wgang_bingo_is_admin());
create policy bingo_cells_admin_delete on public.bingo_board_cells for delete to authenticated
using (public.wgang_bingo_is_admin());

drop policy if exists bingo_standby_admin on public.bingo_standby;
drop policy if exists bingo_standby_confirm on public.bingo_standby;
drop policy if exists bingo_standby_admin_insert on public.bingo_standby;
drop policy if exists bingo_standby_update on public.bingo_standby;
drop policy if exists bingo_standby_admin_delete on public.bingo_standby;
create policy bingo_standby_admin_insert on public.bingo_standby for insert to authenticated
with check (public.wgang_bingo_is_admin());
create policy bingo_standby_update on public.bingo_standby for update to authenticated
using (user_id = (select auth.uid()) or public.wgang_bingo_is_admin())
with check (user_id = (select auth.uid()) or public.wgang_bingo_is_admin());
create policy bingo_standby_admin_delete on public.bingo_standby for delete to authenticated
using (public.wgang_bingo_is_admin());

create index if not exists bingo_assignments_identity_idx on public.bingo_assignments(game_identity_id);
create index if not exists bingo_assignments_user_idx on public.bingo_assignments(user_id);
create index if not exists bingo_plans_created_by_idx on public.bingo_plans(created_by);
create index if not exists bingo_plans_updated_by_idx on public.bingo_plans(updated_by);
create index if not exists bingo_standby_identity_idx on public.bingo_standby(game_identity_id);
create index if not exists bingo_standby_user_idx on public.bingo_standby(user_id);
create index if not exists bingo_standby_selected_by_idx on public.bingo_standby(selected_by);
