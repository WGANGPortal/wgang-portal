-- WGANG Portal v0.9.1 – migrer eldre generelle oppgavepreferanser til ny struktur.
-- Kjør én gang i Supabase SQL Editor. Ingen medlemmer eller innhold slettes.

update public.task_preferences set task_type = 'Annen høsting' where task_type = 'Høsting' and not exists (select 1 from public.task_preferences t2 where t2.user_id = task_preferences.user_id and t2.task_type = 'Annen høsting');
delete from public.task_preferences where task_type = 'Høsting';

update public.task_preferences set task_type = 'Produksjonsoppgaver' where task_type = 'Produksjon' and not exists (select 1 from public.task_preferences t2 where t2.user_id = task_preferences.user_id and t2.task_type = 'Produksjonsoppgaver');
delete from public.task_preferences where task_type = 'Produksjon';

update public.task_preferences set task_type = 'Lastebiloppgaver' where task_type = 'Lastebil' and not exists (select 1 from public.task_preferences t2 where t2.user_id = task_preferences.user_id and t2.task_type = 'Lastebiloppgaver');
delete from public.task_preferences where task_type = 'Lastebil';

update public.task_preferences set task_type = 'Båtoppgaver' where task_type = 'Båt' and not exists (select 1 from public.task_preferences t2 where t2.user_id = task_preferences.user_id and t2.task_type = 'Båtoppgaver');
delete from public.task_preferences where task_type = 'Båt';

update public.task_preferences set task_type = 'Besøkende' where task_type = 'By' and not exists (select 1 from public.task_preferences t2 where t2.user_id = task_preferences.user_id and t2.task_type = 'Besøkende');
delete from public.task_preferences where task_type = 'By';

update public.task_preferences set task_type = 'Fiskeoppgaver' where task_type = 'Fisk' and not exists (select 1 from public.task_preferences t2 where t2.user_id = task_preferences.user_id and t2.task_type = 'Fiskeoppgaver');
delete from public.task_preferences where task_type = 'Fisk';

update public.task_preferences set task_type = 'Gruveoppgaver' where task_type = 'Gruve' and not exists (select 1 from public.task_preferences t2 where t2.user_id = task_preferences.user_id and t2.task_type = 'Gruveoppgaver');
delete from public.task_preferences where task_type = 'Gruve';
