-- WGANG Portal v0.18.0.4
-- Chill Bunny reusable task templates.
alter table public.bunny_task_library add column if not exists template_key text;
alter table public.bunny_task_library add column if not exists image_key text;

update public.bunny_task_library
set template_key = lower(regexp_replace(name, '[^a-zA-Z0-9æøåÆØÅ]+', '-', 'g'))
where template_key is null;

update public.bunny_task_library
set image_key = template_key
where image_key is null;

-- Per-card deadline is no longer used. Chill Bunny uses 09:59 Europe/Oslo for all cards.
update public.bunny_task_library set task_deadline = null where task_deadline is not null;
