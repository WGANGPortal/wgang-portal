-- ============================================================
-- WGANG Portal v0.17.0 – Social Content, Activity Notifications
-- and Translation Cache
-- Additiv migrering. Eksisterende data beholdes.
-- ============================================================

create table if not exists public.social_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('community','leadership')),
  target_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);

create table if not exists public.social_comments (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('community','leadership')),
  target_id text not null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists social_comments_target_idx
on public.social_comments(target_type, target_id, created_at);

create table if not exists public.content_translations (
  target_type text not null check (target_type in ('community','leadership','comment')),
  target_id text not null,
  language text not null check (language in ('en')),
  title text,
  body text not null,
  source_text text,
  updated_at timestamptz not null default now(),
  primary key (target_type, target_id, language)
);

create table if not exists public.activity_notifications (
  id bigint generated always as identity primary key,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  activity_type text not null check (activity_type in ('like','comment')),
  target_type text not null check (target_type in ('community','leadership')),
  target_id text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists activity_notifications_recipient_idx
on public.activity_notifications(recipient_id, read_at, created_at desc);

alter table public.social_likes enable row level security;
alter table public.social_comments enable row level security;
alter table public.content_translations enable row level security;
alter table public.activity_notifications enable row level security;

drop policy if exists "social_likes_select" on public.social_likes;
create policy "social_likes_select" on public.social_likes
for select to authenticated
using (
  public.is_approved_member()
  and (
    target_type='community'
    or (target_type='leadership' and public.is_wgang_leadership())
  )
);

drop policy if exists "social_likes_insert" on public.social_likes;
create policy "social_likes_insert" on public.social_likes
for insert to authenticated
with check (
  user_id=auth.uid()
  and public.is_approved_member()
  and (
    target_type='community'
    or (target_type='leadership' and public.is_wgang_leadership())
  )
);

drop policy if exists "social_likes_delete" on public.social_likes;
create policy "social_likes_delete" on public.social_likes
for delete to authenticated
using (user_id=auth.uid());

drop policy if exists "social_comments_select" on public.social_comments;
create policy "social_comments_select" on public.social_comments
for select to authenticated
using (
  public.is_approved_member()
  and (
    target_type='community'
    or (target_type='leadership' and public.is_wgang_leadership())
  )
);

drop policy if exists "social_comments_insert" on public.social_comments;
create policy "social_comments_insert" on public.social_comments
for insert to authenticated
with check (
  user_id=auth.uid()
  and public.is_approved_member()
  and (
    target_type='community'
    or (target_type='leadership' and public.is_wgang_leadership())
  )
);

drop policy if exists "social_comments_delete" on public.social_comments;
create policy "social_comments_delete" on public.social_comments
for delete to authenticated
using (
  user_id=auth.uid()
  or (target_type='community' and public.is_wgang_admin())
  or (target_type='leadership' and public.is_wgang_owner())
);

drop policy if exists "content_translations_select" on public.content_translations;
create policy "content_translations_select" on public.content_translations
for select to authenticated
using (
  public.is_approved_member()
  and (
    target_type <> 'leadership'
    or public.is_wgang_leadership()
  )
);

drop policy if exists "activity_notifications_select_own" on public.activity_notifications;
create policy "activity_notifications_select_own" on public.activity_notifications
for select to authenticated
using (recipient_id=auth.uid());

drop policy if exists "activity_notifications_update_own" on public.activity_notifications;
create policy "activity_notifications_update_own" on public.activity_notifications
for update to authenticated
using (recipient_id=auth.uid())
with check (recipient_id=auth.uid());

create or replace function public.social_target_author(p_target_type text, p_target_id text)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_author uuid;
begin
  if p_target_type='community' then
    select author_id into v_author
    from public.community_content
    where id::text=p_target_id;
  elsif p_target_type='leadership' then
    select user_id into v_author
    from public.leadership_messages
    where id::text=p_target_id;
  end if;
  return v_author;
end;
$$;

create or replace function public.notify_social_activity()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare v_recipient uuid;
declare v_activity text;
begin
  v_recipient := public.social_target_author(new.target_type,new.target_id);
  if v_recipient is null or v_recipient=new.user_id then
    return new;
  end if;

  if tg_table_name='social_likes' then
    v_activity := 'like';
  else
    v_activity := 'comment';
  end if;

  insert into public.activity_notifications
    (recipient_id,actor_id,activity_type,target_type,target_id)
  values
    (v_recipient,new.user_id,v_activity,new.target_type,new.target_id);

  return new;
end;
$$;

drop trigger if exists notify_social_like on public.social_likes;
create trigger notify_social_like
after insert on public.social_likes
for each row execute function public.notify_social_activity();

drop trigger if exists notify_social_comment on public.social_comments;
create trigger notify_social_comment
after insert on public.social_comments
for each row execute function public.notify_social_activity();

grant select, insert, delete on public.social_likes to authenticated;
grant select, insert, delete on public.social_comments to authenticated;
grant usage, select on sequence public.social_comments_id_seq to authenticated;
grant select on public.content_translations to authenticated;
grant select, update on public.activity_notifications to authenticated;
grant usage, select on sequence public.activity_notifications_id_seq to authenticated;
