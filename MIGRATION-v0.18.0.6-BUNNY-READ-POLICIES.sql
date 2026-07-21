-- WGANG Portal v0.18.0.6
-- Ensure authenticated members can read the Chill Bunny library.
-- This fixes an empty category/name dropdown when RLS is enabled.

alter table public.bunny_task_library enable row level security;

drop policy if exists "members read bunny library" on public.bunny_task_library;

create policy "members read bunny library"
on public.bunny_task_library
for select
to authenticated
using (true);

-- Keep the same read access for the active board and statuses.
alter table public.bunny_board enable row level security;
alter table public.bunny_board_tasks enable row level security;
alter table public.bunny_task_status enable row level security;

drop policy if exists "members read bunny board" on public.bunny_board;
create policy "members read bunny board"
on public.bunny_board
for select
to authenticated
using (true);

drop policy if exists "members read bunny board tasks" on public.bunny_board_tasks;
create policy "members read bunny board tasks"
on public.bunny_board_tasks
for select
to authenticated
using (true);

drop policy if exists "members read bunny statuses" on public.bunny_task_status;
create policy "members read bunny statuses"
on public.bunny_task_status
for select
to authenticated
using (true);
