-- ============================================================
-- WGANG Portal v0.11.0
-- Member Profiles, Hay Day Name Normalization & Email Privacy
--
-- Safe, additive migration:
-- - keeps existing members, roles, derby answers and content
-- - normalizes Hay Day names to uppercase
-- - adds optional public profile fields
-- - prevents authenticated clients from selecting profile email
-- - adds a safe RPC for members to edit only their own public profile
-- ============================================================

alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists age_group text;
alter table public.profiles add column if not exists country_place text;
alter table public.profiles add column if not exists hay_day_since text;
alter table public.profiles add column if not exists favorite_game_aspect text;

-- Normalize existing Hay Day names.
update public.profiles
set hay_day_name = upper(hay_day_name),
    updated_at = now()
where hay_day_name is not null
  and hay_day_name <> upper(hay_day_name);

-- Normalize all new/updated Hay Day names automatically.
create or replace function public.normalize_hay_day_name()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.hay_day_name is not null then
    new.hay_day_name := upper(trim(new.hay_day_name));
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_normalize_hay_day_name on public.profiles;
create trigger profiles_normalize_hay_day_name
before insert or update of hay_day_name on public.profiles
for each row execute function public.normalize_hay_day_name();

-- Members may update only their own optional public profile fields.
-- SECURITY DEFINER is used deliberately so we don't need to grant normal
-- members generic UPDATE access to role/status fields.
create or replace function public.update_my_public_profile(
  p_bio text default null,
  p_gender text default null,
  p_age_group text default null,
  p_country_place text default null,
  p_hay_day_since text default null,
  p_favorite_game_aspect text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set bio = nullif(trim(p_bio), ''),
      gender = nullif(trim(p_gender), ''),
      age_group = nullif(trim(p_age_group), ''),
      country_place = nullif(trim(p_country_place), ''),
      hay_day_since = nullif(trim(p_hay_day_since), ''),
      favorite_game_aspect = nullif(trim(p_favorite_game_aspect), ''),
      updated_at = now()
  where id = auth.uid();
end;
$$;

revoke all on function public.update_my_public_profile(text,text,text,text,text,text) from public;
grant execute on function public.update_my_public_profile(text,text,text,text,text,text) to authenticated;

-- Email privacy: authenticated portal users can read only the public/member
-- columns from profiles. The email remains stored for authentication/admin
-- backend purposes but is not selectable through the browser Data API.
revoke select on table public.profiles from authenticated;
grant select (
  id,
  hay_day_name,
  role,
  status,
  bio,
  gender,
  age_group,
  country_place,
  hay_day_since,
  favorite_game_aspect,
  created_at,
  updated_at
) on table public.profiles to authenticated;
