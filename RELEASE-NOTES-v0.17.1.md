# WGANG Portal v0.17.1

- Fikser låsing etter lagring av varslingsinnstillinger.
- Fjerner portalspråk fra Innstillinger; flagget i topplinjen styrer fortsatt visningsspråk.
- Legger språk til medlemsprofilen: Norsk, Engelsk og Andre språk (flervalg).
- Når Andre språk velges kan medlemmet skrive hvilke språk.
- Valgte språk vises på offentlig medlemsprofil.
- Legger Logg ut tilbake i profilmenyen og bruker Supabase-utlogging.
- Fjerner den separate pilknappen for utlogging fra topplinjen.

Kjør MIGRATION-v0.17.1-PROFILE-LANGUAGES.sql i Supabase før testing av profilspråk.
