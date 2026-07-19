-- WGANG Portal v0.10.0 – per-derby deltakelse
-- Kjør etter Derby Management Foundation-migreringen.
-- Eksisterende data slettes ikke.

create table if not exists public.derby_event_participation (
  event_id bigint not null references public.derby_events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  choice text not null default 'waiting'
    check (choice in ('joined','pause','unsure','waiting')),
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

alter table public.derby_event_participation enable row level security;

drop policy if exists "derby_event_participation_select" on public.derby_event_participation;
create policy "derby_event_participation_select"
on public.derby_event_participation
for select
to authenticated
using (public.is_approved_member());

drop policy if exists "derby_event_participation_insert_own" on public.derby_event_participation;
create policy "derby_event_participation_insert_own"
on public.derby_event_participation
for insert
to authenticated
with check (user_id = auth.uid() and public.is_approved_member());

drop policy if exists "derby_event_participation_update_own" on public.derby_event_participation;
create policy "derby_event_participation_update_own"
on public.derby_event_participation
for update
to authenticated
using (user_id = auth.uid() and public.is_approved_member())
with check (user_id = auth.uid() and public.is_approved_member());

grant select, insert, update on public.derby_event_participation to authenticated;
