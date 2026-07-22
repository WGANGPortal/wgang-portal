-- WGANG Portal v0.18.0.17 – nye Chill Bunny-oppgaver
-- Legger de 10 nye oppgavetypene i biblioteket. Bacon og Eplejuice finnes allerede.

insert into public.bunny_task_library
  (category, name, amount, icon, description, active, template_key, image_key)
select v.category, v.name, v.amount, v.icon, v.description, true, v.template_key, v.image_key
from (values
  ('Besøkende i byen','Cowboy',1,'🤠','Betjen 1 × Cowboy','cowboy','cowboy'),
  ('Produksjon','Blå ullue',4,'🧢','Produser og samle inn 4 × Blå ullue','bla-ullue','bla-ullue'),
  ('Bybyggeoppgave','Kino',2,'🎬','Ta imot 2 byggjester i Kino','kino','kino'),
  ('Produksjon','Bomullsskjorte',3,'👕','Produser og samle inn 3 × Bomullsskjorte','bomullsskjorte','bomullsskjorte'),
  ('Produksjon','Sesam-is',2,'🍨','Produser og samle inn 2 × Sesam-is','sesam-is','sesam-is'),
  ('Fôroppgave','Mat dyr',18,'🐾','Mat 18 dyr','mat-dyr','mat-dyr'),
  ('Produksjon','Sesamkrokan',4,'🍯','Produser og samle inn 4 × Sesamkrokan','sesamkrokan','sesamkrokan'),
  ('Produksjon','Sushirull',2,'🍣','Produser og samle inn 2 × Sushirull','sushirull','sushirull'),
  ('Innhøsting','Salat',37,'🥬','Høst inn fra salatåkrer: 37','salat','salat'),
  ('Produksjon','Tofupølse',2,'🌭','Produser og samle inn 2 × Tofupølse','tofupolse','tofupolse')
) as v(category,name,amount,icon,description,template_key,image_key)
where not exists (
  select 1 from public.bunny_task_library b where lower(b.name)=lower(v.name)
);
