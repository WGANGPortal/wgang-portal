-- WGANG Portal v0.9.0 – Community Content
-- Run this once in Supabase SQL Editor before uploading v0.9.0.

create table if not exists public.community_content (
  id bigint generated always as identity primary key,
  author_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('announcement','derby','tip')),
  title text not null check (char_length(title) between 1 and 100),
  body text not null check (char_length(body) between 1 and 3000),
  category text,
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists community_content_kind_status_idx
  on public.community_content (kind, status, created_at desc);

alter table public.community_content enable row level security;

drop policy if exists "community_content_select" on public.community_content;
create policy "community_content_select"
on public.community_content
for select
to authenticated
using (
  public.is_approved_member()
  and (
    status = 'published'
    or author_id = auth.uid()
    or public.is_wgang_admin()
  )
);

drop policy if exists "community_content_insert" on public.community_content;
create policy "community_content_insert"
on public.community_content
for insert
to authenticated
with check (
  author_id = auth.uid()
  and public.is_approved_member()
  and (
    (kind = 'derby' and status = 'published')
    or (kind = 'tip' and status = 'pending')
    or (public.is_wgang_admin() and kind in ('announcement','tip') and status = 'published')
  )
);

drop policy if exists "community_content_admin_update" on public.community_content;
create policy "community_content_admin_update"
on public.community_content
for update
to authenticated
using (public.is_wgang_admin())
with check (public.is_wgang_admin());

drop policy if exists "community_content_delete" on public.community_content;
create policy "community_content_delete"
on public.community_content
for delete
to authenticated
using (public.is_wgang_admin() or author_id = auth.uid());

grant select, insert, update, delete on public.community_content to authenticated;
grant usage, select on sequence public.community_content_id_seq to authenticated;
