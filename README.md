# WGANG Portal v0.8.1 – Auth & Membership Flow

Denne pakken bygger videre på v0.7.3 og legger til ekte autentisering og felles database via Supabase.

**Før produksjonsbruk:** Følg `SETUP-SUPABASE.md`, kjør `supabase-schema.sql`, og legg Project URL + publishable/anon key i `config.js`.

---

# WGANG Portal v0.7.3

Statisk pilotportal for WGANG-nabolaget i Hay Day, med fokus på Derby-organisering.

## Demo
- Admin: `admin@wgang.no` / `WGANG2026`
- Medlem: `nabo@wgang.no` / `WGANG2026`

## Kjernefunksjoner
- Registrering og administratorgodkjenning
- Innlogging og roller
- Derbydeltakelse
- Oppgavepreferanser per medlem
- Adminoversikt over hvilke oppgavetyper WGANG liker og unngår
- Standard Derby-strategi med 320-poengsfokus

## Drift
Løsningen kan lastes opp direkte som statisk nettsted til Cloudflare Pages.

## Begrensning i pilot
Data lagres i nettleserens `localStorage`. Medlemmer på forskjellige enheter deler derfor ikke data. Neste tekniske milepæl er felles autentisering og database.


## Første eierkonto

Etter at den første brukeren er invitert og har opprettet passord, kjør `FIRST-OWNER-SETUP.sql` i Supabase SQL Editor med riktig e-postadresse. Dette setter kontoen til `owner` og `approved`.


## v0.10.0 database
Kjør `MIGRATION-v0.10.0-DERBY-PARTICIPATION.sql` etter Derby Management Foundation-migreringen før publisering.
