-- WGANG Portal v0.18.0.92
-- Push notifications for private one-to-one messages.
-- The notification deliberately excludes message content.

alter table public.notification_preferences
add column if not exists push_private_messages boolean not null default true;

create or replace function wgang_private.preference_enabled(
  p_user_id uuid,
  p_category text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
select coalesce((
  select case p_category
    when 'announcements' then np.in_app_announcements
    when 'derby_chat' then np.in_app_derby_chat
    when 'leadership_chat' then np.in_app_leadership_chat
    when 'membership_requests' then np.in_app_membership_requests
    when 'pending_tips' then np.in_app_pending_tips
    when 'derby_published' then np.in_app_derby_published
    when 'derby_deadline' then np.in_app_derby_deadline_reminders
    when 'social_activity' then np.in_app_social_activity
    when 'private_messages' then np.push_private_messages
    when 'derby_removal' then true
    else false
  end
  from public.notification_preferences np
  where np.user_id = p_user_id
), true)
$$;

create or replace function wgang_private.queue_private_message_push_v92()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sender_name text;
begin
  select p.hay_day_name
    into v_sender_name
  from public.profiles p
  where p.id = new.sender_id;

  perform wgang_private.enqueue_for_audience(
    'private_messages',
    'Ny privat melding',
    coalesce(v_sender_name, 'Et medlem') || ' har sendt deg en privat melding.',
    'messages',
    new.sender_id::text,
    null,
    'wgang-private-message-' || new.sender_id::text,
    'private-message:' || new.id::text,
    null,
    null,
    new.recipient_id,
    array[new.sender_id]::uuid[]
  );

  return new;
end;
$$;

revoke all on function wgang_private.queue_private_message_push_v92() from public;
revoke all on function wgang_private.queue_private_message_push_v92() from anon;
revoke all on function wgang_private.queue_private_message_push_v92() from authenticated;

drop trigger if exists trg_queue_private_message_push_v92
on public.private_messages;

create trigger trg_queue_private_message_push_v92
after insert on public.private_messages
for each row
execute function wgang_private.queue_private_message_push_v92();

