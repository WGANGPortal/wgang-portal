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
