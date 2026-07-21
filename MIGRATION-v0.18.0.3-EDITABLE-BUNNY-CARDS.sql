-- WGANG Portal v0.18.0.3
-- Editable standard Chill Bunny cards: name, amount and task deadline.

alter table public.bunny_task_library
  add column if not exists task_deadline interval;

-- Current board cards: 21 t 52–55 min when observed.
-- We store the task duration as an editable interval, not a fixed clock time.
update public.bunny_task_library
set task_deadline = interval '21 hours 52 minutes'
where name in ('Gjester i Matbutikk','Kake med røde bær','Soyabønner','Innbygger')
  and task_deadline is null;

update public.bunny_task_library
set task_deadline = interval '21 hours 53 minutes'
where name in ('Gulrøtter','Bacon','Gulrotkake','Eplejuice')
  and task_deadline is null;

update public.bunny_task_library
set task_deadline = interval '21 hours 54 minutes'
where name in ('Egg','Frutti di Mare-pizza')
  and task_deadline is null;

update public.bunny_task_library
set task_deadline = interval '21 hours 55 minutes'
where name = 'Gresskar'
  and task_deadline is null;

update public.bunny_task_library
set task_deadline = interval '21 hours 54 minutes'
where name = 'Hvete'
  and task_deadline is null;
