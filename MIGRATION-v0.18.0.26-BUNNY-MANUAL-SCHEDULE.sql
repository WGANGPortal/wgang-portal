-- WGANG Portal v0.18.0.26
-- Manuell synkronisering av neste harepust per runde.
-- Ledelsen kan korrigere spillets faktiske tidspunkt.

create table if not exists public.bunny_round_schedule_overrides (
  event_id bigint not null references public.derby_events(id) on delete cascade,
  round_number smallint not null check (round_number between 1 and 3),
  next_bunny_at timestamptz not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id),
  primary key (event_id, round_number)
);

alter table public.bunny_round_schedule_overrides enable row level security;

grant select, insert, update, delete on public.bunny_round_schedule_overrides to authenticated;

drop policy if exists "approved members read bunny schedule overrides" on public.bunny_round_schedule_overrides;
create policy "approved members read bunny schedule overrides"
on public.bunny_round_schedule_overrides
for select to authenticated
using (public.is_approved_member());

drop policy if exists "leadership manages bunny schedule overrides" on public.bunny_round_schedule_overrides;
create policy "leadership manages bunny schedule overrides"
on public.bunny_round_schedule_overrides
for all to authenticated
using (public.is_wgang_leadership())
with check (public.is_wgang_leadership());

create index if not exists bunny_round_schedule_overrides_event_idx
  on public.bunny_round_schedule_overrides(event_id, round_number);
