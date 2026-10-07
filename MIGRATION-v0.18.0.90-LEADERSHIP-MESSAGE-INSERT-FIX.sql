-- WGANG Portal v0.18.0.90
-- Retter innsetting av nye ledermeldinger etter tilgangsgrensen i v0.18.0.89.
--
-- PostgREST bruker INSERT ... RETURNING. Select-policyen må derfor kunne
-- vurdere created_at direkte på raden som nettopp er opprettet. Et separat
-- oppslag i leadership_messages ser ikke den nye raden før setningen er ferdig.

begin;

create or replace function private.wgang_can_view_leadership_at(p_created_at timestamptz)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.status = 'approved'
      and p.role in ('owner', 'admin', 'assistant_leader', 'senior')
      and p.leadership_access_from is not null
      and p_created_at >= p.leadership_access_from
      and public.has_wgang_permission('chat.leadership.view')
  );
$$;

revoke all on function private.wgang_can_view_leadership_at(timestamptz) from public, anon;
grant execute on function private.wgang_can_view_leadership_at(timestamptz) to authenticated;

drop policy if exists leadership_messages_select_v89 on public.leadership_messages;
create policy leadership_messages_select_v90
on public.leadership_messages
for select
to authenticated
using (private.wgang_can_view_leadership_at(created_at));

commit;
