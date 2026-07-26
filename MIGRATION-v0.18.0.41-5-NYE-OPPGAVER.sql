-- WGANG Portal v0.18.0.41
-- 5 nye oppgavekort med bildekoblinger.
-- Følger eksisterende bunny_task_library-mal.
-- Kan kjøres flere ganger uten å lage dubletter.

with v(category,name,amount,icon,description,template_key,image_key) as (
  values
    ('Produksjon','Popkorn med smør',4,'🍿','Produser og samle inn 4 × Popkorn med smør','popkorn-med-smor','popkorn-med-smor'),
    ('Produksjon','Genser',2,'🧶','Produser og samle inn 2 × Genser','genser','genser'),
    ('Bybyggeoppgave','Kafé',2,'☕','Ta imot 2 bygjester i Kafé','bygjester-kafe','bygjester-kafe'),
    ('Produksjon','Bjørnebær-muffins',3,'🧁','Produser og samle inn 3 × Bjørnebær-muffins','bjornebaer-muffins','bjornebaer-muffins'),
    ('Produksjon','Olivenolje',3,'🫒','Produser og samle inn 3 × Olivenolje','olivenolje','olivenolje')
)
insert into public.bunny_task_library
  (category,name,amount,icon,description,active,template_key,image_key)
select
  v.category,v.name,v.amount,v.icon,v.description,true,v.template_key,v.image_key
from v
where not exists (
  select 1
  from public.bunny_task_library b
  where lower(b.name)=lower(v.name)
);

with v(category,name,amount,icon,description,template_key,image_key) as (
  values
    ('Produksjon','Popkorn med smør',4,'🍿','Produser og samle inn 4 × Popkorn med smør','popkorn-med-smor','popkorn-med-smor'),
    ('Produksjon','Genser',2,'🧶','Produser og samle inn 2 × Genser','genser','genser'),
    ('Bybyggeoppgave','Kafé',2,'☕','Ta imot 2 bygjester i Kafé','bygjester-kafe','bygjester-kafe'),
    ('Produksjon','Bjørnebær-muffins',3,'🧁','Produser og samle inn 3 × Bjørnebær-muffins','bjornebaer-muffins','bjornebaer-muffins'),
    ('Produksjon','Olivenolje',3,'🫒','Produser og samle inn 3 × Olivenolje','olivenolje','olivenolje')
)
update public.bunny_task_library b
set
  category=v.category,
  amount=v.amount,
  icon=v.icon,
  description=v.description,
  active=true,
  template_key=v.template_key,
  image_key=v.image_key
from v
where lower(b.name)=lower(v.name);

-- Kontroll: alle fem skal vises her etter kjøring.
select category,name,amount,description,template_key,image_key,active
from public.bunny_task_library
where lower(name) in (
  'popkorn med smør',
  'genser',
  'kafé',
  'bjørnebær-muffins',
  'olivenolje'
)
order by category,name;
