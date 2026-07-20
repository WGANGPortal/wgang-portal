# WGANG Portal v0.16.0 – Notifications

## Nytt
- Varselbjelle i topplinjen med teller for uleste varsler.
- «Nytt siden sist» på Oversikt.
- Rollebaserte varsler:
  - alle: kunngjøringer, Derbyprat og publisert derby
  - ledelse: Lederprat
  - Admin/Eier: medlemssøknader og tips til behandling
- Varsler er klikkbare og åpner relevant område.
- Lest-status lagres per bruker via Supabase.
- Varslingsinnstillinger på egen profil.
- Frivillig opt-in for fremtidige e-postvarsler.
- Faktisk e-postutsending er ikke aktivert i denne versjonen.

Krever SQL-migreringen for v0.16.0 notification_preferences og notification_read_state.
