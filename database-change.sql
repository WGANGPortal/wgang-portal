-- v0.18.0.123: readiness statuses; legacy values and RLS are preserved.
alter table public.task_preferences drop constraint task_preferences_preference_check;
alter table public.task_preferences add constraint task_preferences_preference_check check (preference in ('like','can','avoid','no','ready','preparing'));
