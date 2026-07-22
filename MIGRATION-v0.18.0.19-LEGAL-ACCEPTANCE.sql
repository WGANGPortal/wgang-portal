-- WGANG Portal v0.18.0.19 – Legal document acknowledgement
-- Run once in Supabase SQL Editor before deploying the matching frontend.

create table if not exists public.legal_acceptances (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  privacy_version text not null,
  rules_version text not null,
  acknowledged_at timestamptz not null default now()
);

alter table public.legal_acceptances enable row level security;

drop policy if exists legal_acceptances_select_own on public.legal_acceptances;
create policy legal_acceptances_select_own
on public.legal_acceptances
for select to authenticated
using (user_id = auth.uid());

drop policy if exists legal_acceptances_insert_own on public.legal_acceptances;
create policy legal_acceptances_insert_own
on public.legal_acceptances
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists legal_acceptances_update_own on public.legal_acceptances;
create policy legal_acceptances_update_own
on public.legal_acceptances
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists legal_acceptances_admin_read on public.legal_acceptances;
create policy legal_acceptances_admin_read
on public.legal_acceptances
for select to authenticated
using (public.is_wgang_admin());
