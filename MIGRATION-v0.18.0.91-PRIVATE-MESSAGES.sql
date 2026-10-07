-- WGANG Portal v0.18.0.91
-- Private one-to-one messages. Only the two participants can read each row.

create table if not exists public.private_messages (
  id bigint generated always as identity primary key,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint private_messages_not_self check (sender_id <> recipient_id),
  constraint private_messages_body_length check (char_length(btrim(body)) between 1 and 4000)
);

create index if not exists private_messages_participants_created_idx
on public.private_messages(sender_id,recipient_id,created_at desc);

create index if not exists private_messages_recipient_unread_idx
on public.private_messages(recipient_id,created_at desc)
where read_at is null;

alter table public.private_messages enable row level security;

drop policy if exists private_messages_select_participants_v91 on public.private_messages;
create policy private_messages_select_participants_v91
on public.private_messages
for select
to authenticated
using (
  (select public.is_approved_member())
  and (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()))
);

drop policy if exists private_messages_insert_sender_v91 on public.private_messages;
create policy private_messages_insert_sender_v91
on public.private_messages
for insert
to authenticated
with check (
  (select public.is_approved_member())
  and sender_id = (select auth.uid())
  and recipient_id <> (select auth.uid())
  and exists (
    select 1 from public.profiles recipient
    where recipient.id = private_messages.recipient_id
      and recipient.status = 'approved'
  )
);

drop policy if exists private_messages_update_recipient_v91 on public.private_messages;
create policy private_messages_update_recipient_v91
on public.private_messages
for update
to authenticated
using (
  (select public.is_approved_member())
  and recipient_id = (select auth.uid())
)
with check (
  (select public.is_approved_member())
  and recipient_id = (select auth.uid())
);

revoke all on table public.private_messages from anon;
revoke all on table public.private_messages from authenticated;
grant select on table public.private_messages to authenticated;
grant insert(sender_id,recipient_id,body) on table public.private_messages to authenticated;
grant update(read_at) on table public.private_messages to authenticated;
grant usage,select on sequence public.private_messages_id_seq to authenticated;

comment on table public.private_messages is
'Private WGANG one-to-one messages. RLS restricts rows to sender and recipient; portal admins have no separate content access.';
