-- WGANG Portal v0.18.0.88
-- Privat skjermbilde av bingobrettet. Eier/admin kan administrere; godkjente medlemmer kan se.

alter table public.bingo_plans
  add column if not exists board_image_path text,
  add column if not exists board_image_mime_type text,
  add column if not exists board_image_size_bytes bigint,
  add column if not exists board_image_original_name text,
  add column if not exists board_image_updated_at timestamptz;

alter table public.bingo_plans
  drop constraint if exists bingo_plans_board_image_type_check;
alter table public.bingo_plans
  add constraint bingo_plans_board_image_type_check
  check (board_image_mime_type is null or board_image_mime_type in ('image/jpeg','image/png','image/webp'));

alter table public.bingo_plans
  drop constraint if exists bingo_plans_board_image_size_check;
alter table public.bingo_plans
  add constraint bingo_plans_board_image_size_check
  check (board_image_size_bytes is null or board_image_size_bytes between 1 and 10485760);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('bingo-boards','bingo-boards',false,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public=false,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists bingo_boards_read on storage.objects;
create policy bingo_boards_read on storage.objects
for select to authenticated
using (bucket_id='bingo-boards' and (select public.is_approved_member()));

drop policy if exists bingo_boards_admin_insert on storage.objects;
create policy bingo_boards_admin_insert on storage.objects
for insert to authenticated
with check (bucket_id='bingo-boards' and (select public.wgang_bingo_is_admin()));

drop policy if exists bingo_boards_admin_update on storage.objects;
create policy bingo_boards_admin_update on storage.objects
for update to authenticated
using (bucket_id='bingo-boards' and (select public.wgang_bingo_is_admin()))
with check (bucket_id='bingo-boards' and (select public.wgang_bingo_is_admin()));

drop policy if exists bingo_boards_admin_delete on storage.objects;
create policy bingo_boards_admin_delete on storage.objects
for delete to authenticated
using (bucket_id='bingo-boards' and (select public.wgang_bingo_is_admin()));

-- Det nyeste brettet har en aktiv 4-gangersoppgave i rute 6 (bare rute 7 og 12 er sperret).
update public.bingo_board_cells c
set task_name='Oppgave rute 6', required_count=4, classification='free', is_blocked=false, updated_at=now()
from public.bingo_plans p
join public.derby_events e on e.id=p.event_id
where c.plan_id=p.id and c.position=6 and c.task_name='Ikke i bruk' and c.is_blocked
  and e.name ilike '%bingo%' and e.status in ('published','active');
