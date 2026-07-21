-- WGANG Portal – Security Hardening v0.18.0.16
-- Verified and applied to LIVE Supabase on 2026-07-22.

begin;

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update
on public.profiles
for update
to authenticated
using (
  public.is_wgang_owner()
  or (public.is_wgang_admin() and role <> 'owner')
)
with check (
  public.is_wgang_owner()
  or (public.is_wgang_admin() and role <> 'owner')
);

drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_admin_delete
on public.profiles
for delete
to authenticated
using (
  public.is_wgang_owner()
  or (public.is_wgang_admin() and role <> 'owner')
);

alter policy "members read bunny board"
on public.bunny_board
using (public.is_approved_member());

alter policy "leadership manage bunny board"
on public.bunny_board
using (public.is_wgang_leadership())
with check (public.is_wgang_leadership());

alter policy "members read bunny board tasks"
on public.bunny_board_tasks
using (public.is_approved_member());

alter policy "leadership manage bunny board tasks"
on public.bunny_board_tasks
using (public.is_wgang_leadership())
with check (public.is_wgang_leadership());

alter policy "members read daily bunny status"
on public.bunny_daily_status
using (public.is_approved_member());

alter policy "members read hare attendance"
on public.bunny_hare_attendance
using (public.is_approved_member());

alter policy "members read hare rounds"
on public.bunny_hare_rounds
using (public.is_approved_member());

alter policy "members read bunny library"
on public.bunny_task_library
using (public.is_approved_member());

alter policy "leadership manage bunny library"
on public.bunny_task_library
using (public.is_wgang_leadership())
with check (public.is_wgang_leadership());

alter policy "members read bunny statuses"
on public.bunny_task_status
using (public.is_approved_member());

alter policy "admin owner read permission audit"
on public.permission_audit_log
using (public.is_wgang_admin());

alter policy "authenticated read role permissions"
on public.role_permissions
using (public.is_approved_member());

alter policy "owner manages role permissions"
on public.role_permissions
using (public.is_wgang_owner())
with check (public.is_wgang_owner());

commit;
