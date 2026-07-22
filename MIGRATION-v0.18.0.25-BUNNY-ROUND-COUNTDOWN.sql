-- WGANG Portal v0.18.0.25
-- Felles status for de tre Harepus-rundene.
-- Kjør denne i Supabase SQL Editor før/ved publisering av portaloppdateringen.

create table if not exists public.bunny_round_completions (
  event_id bigint not null references public.derby_events(id) on delete cascade,
  round_number smallint not null check (round_number between 1 and 3),
  completed_at timestamptz not null default now(),
  completed_by uuid not null references auth.users(id),
  primary key (event_id, round_number)
);

alter table public.bunny_round_completions enable row level security;

grant select, insert, update, delete on public.bunny_round_completions to authenticated;

drop policy if exists "approved members read bunny round completions" on public.bunny_round_completions;
create policy "approved members read bunny round completions"
on public.bunny_round_completions
for select to authenticated
using (public.is_approved_member());

drop policy if exists "leadership manages bunny round completions" on public.bunny_round_completions;
create policy "leadership manages bunny round completions"
on public.bunny_round_completions
for all to authenticated
using (public.is_wgang_leadership())
with check (public.is_wgang_leadership());

create index if not exists bunny_round_completions_event_idx
  on public.bunny_round_completions(event_id, round_number);
