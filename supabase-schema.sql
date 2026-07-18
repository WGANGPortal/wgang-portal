-- WGANG Portal v0.8 – Supabase schema
-- Run this whole file once in Supabase SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  hay_day_name text not null,
  role text not null default 'member' check (role in ('owner','admin','member')),
  status text not null default 'pending' check (status in ('pending','approved','rejected','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_hay_day_name_unique on public.profiles (lower(hay_day_name));

create table if not exists public.derby_participation (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  choice text not null default 'waiting' check (choice in ('joined','pause','unsure','waiting')),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_preferences (
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_type text not null,
  preference text not null check (preference in ('like','can','avoid','no')),
  updated_at timestamptz not null default now(),
  primary key (user_id, task_type)
);

create table if not exists public.derby_settings (
  id integer primary key check (id = 1),
  type text not null default 'Standard Derby',
  task_total integer not null default 9 check (task_total > 0),
  max_points integer not null default 320 check (max_points > 0),
  strategy jsonb not null default '["Ta kun oppgaver med 320 poeng i Standard Derby."]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.derby_settings (id) values (1) on conflict (id) do nothing;

-- Create a pending profile automatically when someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, hay_day_name, role, status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'hay_day_name', split_part(coalesce(new.email,''), '@', 1)),
    'member',
    'pending'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Helper functions used by RLS. SECURITY DEFINER avoids recursive profile policies.
create or replace function public.is_wgang_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved' and role in ('owner','admin')
  );
$$;

create or replace function public.is_approved_member()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  );
$$;

alter table public.profiles enable row level security;
alter table public.derby_participation enable row level security;
alter table public.task_preferences enable row level security;
alter table public.derby_settings enable row level security;

-- Profiles: a user can always read their own application; approved members can see approved members; admins can see all.
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select to authenticated
using (id = auth.uid() or (status = 'approved' and public.is_approved_member()) or public.is_wgang_admin());

-- Profiles are created only by the auth trigger. Admins manage approval and roles.
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles for update to authenticated
using (public.is_wgang_admin()) with check (public.is_wgang_admin());

drop policy if exists "profiles_admin_delete" on public.profiles;
create policy "profiles_admin_delete" on public.profiles for delete to authenticated
using (public.is_wgang_admin());

-- Participation: approved members can read team status and write only their own row.
drop policy if exists "participation_select" on public.derby_participation;
create policy "participation_select" on public.derby_participation for select to authenticated
using (public.is_approved_member());

drop policy if exists "participation_insert_own" on public.derby_participation;
create policy "participation_insert_own" on public.derby_participation for insert to authenticated
with check (user_id = auth.uid() and public.is_approved_member());

drop policy if exists "participation_update_own" on public.derby_participation;
create policy "participation_update_own" on public.derby_participation for update to authenticated
using (user_id = auth.uid() and public.is_approved_member())
with check (user_id = auth.uid() and public.is_approved_member());

-- Preferences: approved members can read team preferences and write only their own rows.
drop policy if exists "preferences_select" on public.task_preferences;
create policy "preferences_select" on public.task_preferences for select to authenticated
using (public.is_approved_member());

drop policy if exists "preferences_insert_own" on public.task_preferences;
create policy "preferences_insert_own" on public.task_preferences for insert to authenticated
with check (user_id = auth.uid() and public.is_approved_member());

drop policy if exists "preferences_update_own" on public.task_preferences;
create policy "preferences_update_own" on public.task_preferences for update to authenticated
using (user_id = auth.uid() and public.is_approved_member())
with check (user_id = auth.uid() and public.is_approved_member());

drop policy if exists "preferences_delete_own" on public.task_preferences;
create policy "preferences_delete_own" on public.task_preferences for delete to authenticated
using (user_id = auth.uid() and public.is_approved_member());

-- Derby settings: approved members read; admins write.
drop policy if exists "derby_settings_select" on public.derby_settings;
create policy "derby_settings_select" on public.derby_settings for select to authenticated
using (public.is_approved_member());

drop policy if exists "derby_settings_admin_insert" on public.derby_settings;
create policy "derby_settings_admin_insert" on public.derby_settings for insert to authenticated
with check (public.is_wgang_admin());

drop policy if exists "derby_settings_admin_update" on public.derby_settings;
create policy "derby_settings_admin_update" on public.derby_settings for update to authenticated
using (public.is_wgang_admin()) with check (public.is_wgang_admin());

-- Explicit Data API grants. RLS still controls which rows are accessible.
grant select, update, delete on public.profiles to authenticated;
grant select, insert, update on public.derby_participation to authenticated;
grant select, insert, update, delete on public.task_preferences to authenticated;
grant select, insert, update on public.derby_settings to authenticated;

-- AFTER your own account has signed up, make it the first owner by running:
-- update public.profiles set role='owner', status='approved' where email='DIN_EPOST_HER';

-- v0.9.0 community content ----------------------------------------------------
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
create index if not exists community_content_kind_status_idx on public.community_content (kind, status, created_at desc);
alter table public.community_content enable row level security;
drop policy if exists "community_content_select" on public.community_content;
create policy "community_content_select" on public.community_content for select to authenticated using (public.is_approved_member() and (status='published' or author_id=auth.uid() or public.is_wgang_admin()));
drop policy if exists "community_content_insert" on public.community_content;
create policy "community_content_insert" on public.community_content for insert to authenticated with check (author_id=auth.uid() and public.is_approved_member() and ((kind='derby' and status='published') or (kind='tip' and status='pending') or (public.is_wgang_admin() and kind in ('announcement','tip') and status='published')));
drop policy if exists "community_content_admin_update" on public.community_content;
create policy "community_content_admin_update" on public.community_content for update to authenticated using (public.is_wgang_admin()) with check (public.is_wgang_admin());
drop policy if exists "community_content_delete" on public.community_content;
create policy "community_content_delete" on public.community_content for delete to authenticated using (public.is_wgang_admin() or author_id=auth.uid());
grant select, insert, update, delete on public.community_content to authenticated;
grant usage, select on sequence public.community_content_id_seq to authenticated;
