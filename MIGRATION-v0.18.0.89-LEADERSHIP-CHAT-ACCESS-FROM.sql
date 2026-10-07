-- WGANG Portal v0.18.0.89
-- Nye ledere får tilgang til lederprat fra tidspunktet ledertilgangen gis.
-- Eksisterende ledere ved innføringstidspunktet beholder sin eksisterende historikk.

begin;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter table public.profiles
  add column if not exists leadership_access_from timestamptz;

comment on column public.profiles.leadership_access_from is
  'Tidligste tidspunkt brukeren kan lese lederprat fra. Null betyr ingen historisk tilgang.';

-- Eksisterende godkjente ledere skal ikke miste historikken de allerede har.
update public.profiles
set leadership_access_from = '-infinity'::timestamptz
where status = 'approved'
  and role in ('owner', 'admin', 'assistant_leader', 'senior')
  and leadership_access_from is null;

create or replace function private.wgang_set_leadership_access_from()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  old_had_leadership_access boolean := false;
  new_has_leadership_access boolean := false;
begin
  if tg_op = 'UPDATE' then
    old_had_leadership_access :=
      old.status = 'approved'
      and old.role in ('owner', 'admin', 'assistant_leader', 'senior');
  end if;

  new_has_leadership_access :=
    new.status = 'approved'
    and new.role in ('owner', 'admin', 'assistant_leader', 'senior');

  if new_has_leadership_access and not old_had_leadership_access then
    -- Førstegangsopprykk eller ny godkjenning som leder: historikken starter nå.
    new.leadership_access_from := pg_catalog.now();
  elsif not new_has_leadership_access then
    -- Ved nedgradering/fjerning nullstilles grensen. Et senere opprykk starter på nytt.
    new.leadership_access_from := null;
  elsif new.leadership_access_from is null then
    -- Sikkerhetsnett for eksisterende rader som mangler verdi.
    new.leadership_access_from := pg_catalog.now();
  end if;

  return new;
end;
$$;

revoke all on function private.wgang_set_leadership_access_from() from public, anon, authenticated;

drop trigger if exists trg_wgang_leadership_access_from on public.profiles;
create trigger trg_wgang_leadership_access_from
before insert or update of role, status on public.profiles
for each row
execute function private.wgang_set_leadership_access_from();

-- Sikkerhetsdefinert oppslag er nødvendig for å kunne brukes fra RLS på selve
-- leadership_messages uten rekursjon. Funksjonen returnerer bare true/false,
-- sjekker alltid innlogget bruker og er ikke tilgjengelig for anon/PUBLIC.
create or replace function private.wgang_can_view_leadership_message(p_message_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.leadership_messages m
    join public.profiles p on p.id = (select auth.uid())
    where m.id::text = p_message_id
      and p.status = 'approved'
      and p.role in ('owner', 'admin', 'assistant_leader', 'senior')
      and p.leadership_access_from is not null
      and m.created_at >= p.leadership_access_from
      and public.has_wgang_permission('chat.leadership.view')
  );
$$;

revoke all on function private.wgang_can_view_leadership_message(text) from public, anon;
grant execute on function private.wgang_can_view_leadership_message(text) to authenticated;

drop policy if exists leadership_messages_select_v56 on public.leadership_messages;
create policy leadership_messages_select_v89
on public.leadership_messages
for select
to authenticated
using (private.wgang_can_view_leadership_message(id::text));

drop policy if exists leadership_messages_delete_v56 on public.leadership_messages;
create policy leadership_messages_delete_v89
on public.leadership_messages
for delete
to authenticated
using (
  private.wgang_can_view_leadership_message(id::text)
  and ((user_id = (select auth.uid())) or public.has_wgang_permission('chat.moderate'))
);

drop policy if exists social_comments_select_v56 on public.social_comments;
create policy social_comments_select_v89
on public.social_comments
for select
to authenticated
using (
  (target_type = 'community' and public.has_wgang_permission('chat.community.view'))
  or
  (
    target_type = 'leadership'
    and private.wgang_can_view_leadership_message(target_id)
  )
);

drop policy if exists social_comments_insert_v56 on public.social_comments;
create policy social_comments_insert_v89
on public.social_comments
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (
    (
      target_type = 'community'
      and public.has_wgang_permission('chat.community.post')
      and exists (
        select 1
        from public.community_content c
        where c.id::text = social_comments.target_id
          and c.status = 'published'
      )
    )
    or
    (
      target_type = 'leadership'
      and public.has_wgang_permission('chat.leadership.post')
      and private.wgang_can_view_leadership_message(target_id)
    )
  )
);

drop policy if exists social_comments_delete_v56 on public.social_comments;
create policy social_comments_delete_v89
on public.social_comments
for delete
to authenticated
using (
  (
    (
      target_type = 'community'
      and public.has_wgang_permission('chat.community.view')
    )
    or
    (
      target_type = 'leadership'
      and private.wgang_can_view_leadership_message(target_id)
    )
  )
  and (
    user_id = (select auth.uid())
    or public.has_wgang_permission('chat.moderate')
  )
);

drop policy if exists social_likes_select_v68 on public.social_likes;
create policy social_likes_select_v89
on public.social_likes
for select
to authenticated
using (
  (target_type = 'community' and public.has_wgang_permission('chat.community.view'))
  or
  (
    target_type = 'leadership'
    and private.wgang_can_view_leadership_message(target_id)
  )
  or
  (
    target_type = 'comment'
    and exists (
      select 1
      from public.social_comments c
      where c.id::text = social_likes.target_id
    )
  )
);

drop policy if exists social_likes_insert_v68 on public.social_likes;
create policy social_likes_insert_v89
on public.social_likes
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (
    (
      target_type = 'community'
      and public.has_wgang_permission('chat.community.post')
      and exists (
        select 1
        from public.community_content c
        where c.id::text = social_likes.target_id
          and c.status = 'published'
      )
    )
    or
    (
      target_type = 'leadership'
      and public.has_wgang_permission('chat.leadership.post')
      and private.wgang_can_view_leadership_message(target_id)
    )
    or
    (
      target_type = 'comment'
      and exists (
        select 1
        from public.social_comments c
        where c.id::text = social_likes.target_id
          and (
            (c.target_type = 'community' and public.has_wgang_permission('chat.community.post'))
            or
            (c.target_type = 'leadership' and public.has_wgang_permission('chat.leadership.post'))
          )
      )
    )
  )
);

drop policy if exists content_translations_select_v56 on public.content_translations;
create policy content_translations_select_v89
on public.content_translations
for select
to authenticated
using (
  (target_type = 'community' and public.has_wgang_permission('chat.community.view'))
  or
  (
    target_type = 'leadership'
    and private.wgang_can_view_leadership_message(target_id)
  )
  or
  (
    target_type = 'comment'
    and exists (
      select 1
      from public.social_comments c
      where c.id::text = content_translations.target_id
    )
  )
);

drop policy if exists activity_notifications_select_own_v83 on public.activity_notifications;
create policy activity_notifications_select_own_v89
on public.activity_notifications
for select
to authenticated
using (
  recipient_id = (select auth.uid())
  and (
    (
      activity_type = 'derby_removed'
      and target_type = 'derby_event'
      and public.has_wgang_permission('derby.view')
    )
    or
    (target_type = 'community' and public.has_wgang_permission('chat.community.view'))
    or
    (
      target_type = 'leadership'
      and private.wgang_can_view_leadership_message(target_id)
    )
    or
    (
      target_type = 'comment'
      and exists (
        select 1
        from public.social_comments c
        where c.id::text = activity_notifications.target_id
      )
    )
  )
);

drop policy if exists chat_images_select_allowed_v86 on storage.objects;
create policy chat_images_select_allowed_v89
on storage.objects
for select
to authenticated
using (
  bucket_id = 'chat-images'
  and (select public.is_approved_member())
  and (
    exists (
      select 1
      from public.community_content cc
      where cc.attachment_path = objects.name
        and cc.kind = 'derby'
        and cc.status = 'published'
        and public.has_wgang_permission('chat.community.view')
    )
    or
    exists (
      select 1
      from public.leadership_messages lm
      where lm.attachment_path = objects.name
        and private.wgang_can_view_leadership_message(lm.id::text)
    )
    or
    exists (
      select 1
      from public.social_comments sc
      where sc.attachment_path = objects.name
        and (
          (
            sc.target_type = 'community'
            and public.has_wgang_permission('chat.community.view')
            and exists (
              select 1
              from public.community_content cc
              where cc.id::text = sc.target_id
                and cc.kind = 'derby'
                and cc.status = 'published'
            )
          )
          or
          (
            sc.target_type = 'leadership'
            and private.wgang_can_view_leadership_message(sc.target_id)
          )
        )
    )
  )
);

create index if not exists leadership_messages_created_at_idx
  on public.leadership_messages (created_at);

commit;
