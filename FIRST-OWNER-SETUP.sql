-- WGANG Portal v0.8.1 – Første eierkonto
-- Bytt ut e-postadressen under med e-postadressen du inviterte i Supabase.
-- Kjør denne én gang i Supabase SQL Editor.

update public.profiles
set role = 'owner',
    status = 'approved',
    updated_at = now()
where email = 'DIN_EPOST_HER';

-- Kontroller resultatet:
select id, email, hay_day_name, role, status
from public.profiles
where email = 'DIN_EPOST_HER';
