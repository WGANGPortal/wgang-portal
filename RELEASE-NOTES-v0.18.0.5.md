# WGANG Portal v0.18.0.5

## Chill Bunny dropdown fix

- Oppgavetype-rullegardinen bygges direkte fra kategoriene som faktisk finnes i `bunny_task_library`.
- Oppgavenavn filtreres robust mot valgt kategori og ignorerer forskjeller i store/små bokstaver og ekstra mellomrom.
- Hvis en kategori mangler oppgaver, vises en tydelig forklaring i stedet for bare «Ingen valg».
- De eksisterende 12 oppgavemalene fra Supabase kan nå velges direkte.
