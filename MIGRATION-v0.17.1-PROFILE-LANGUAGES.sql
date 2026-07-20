-- WGANG Portal v0.17.1 – profile languages
alter table public.profiles
  add column if not exists languages text[] not null default '{}',
  add column if not exists other_languages text;

drop function if exists public.update_my_public_profile(text,text,text,text,text,text);

create or replace function public.update_my_public_profile(
  p_bio text default null,
  p_gender text default null,
  p_age_group text default null,
  p_country_place text default null,
  p_hay_day_since text default null,
  p_favorite_game_aspect text default null,
  p_languages text[] default '{}',
  p_other_languages text default null
)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  update public.profiles
  set bio=nullif(trim(p_bio),''),
      gender=nullif(trim(p_gender),''),
      age_group=nullif(trim(p_age_group),''),
      country_place=nullif(trim(p_country_place),''),
      hay_day_since=nullif(trim(p_hay_day_since),''),
      favorite_game_aspect=nullif(trim(p_favorite_game_aspect),''),
      languages=coalesce(p_languages,'{}'),
      other_languages=nullif(trim(p_other_languages),''),
      updated_at=now()
  where id=auth.uid();
end;
$$;

revoke all on function public.update_my_public_profile(text,text,text,text,text,text,text[],text) from public;
grant execute on function public.update_my_public_profile(text,text,text,text,text,text,text[],text) to authenticated;

grant select (
  id,hay_day_name,role,status,bio,gender,age_group,country_place,
  hay_day_since,favorite_game_aspect,languages,other_languages,created_at,updated_at
) on public.profiles to authenticated;
