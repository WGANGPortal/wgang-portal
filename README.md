# WGANG Portal v0.7 – Community Foundation

Statisk, mobiltilpasset prototype for WGANGs Hay Day Derby-organisering.

## Nytt i v0.7
- Registrering med Hay Day-spillnavn, e-post og passord
- Administratorgodkjenning av nye medlemmer
- Innlogging og utlogging
- Roller: Eier, Administrator og Medlem
- Deltakelsesstatus for neste derby
- Administratoroversikt over svar og manglende svar
- Lokal lagring i nettleseren med `localStorage`

## Demo-kontoer
- Eier: `admin@wgang.no` / `WGANG2026`
- Medlem: `nabo@wgang.no` / `WGANG2026`

## Publisering
Last opp alle filene i rotmappen til Cloudflare Pages, GitHub Pages eller tilsvarende statisk hosting. Ingen build-kommando er nødvendig.

## Viktig begrensning
Dette er en funksjonell frontendpilot. Kontoer og passord lagres lokalt i brukerens nettleser og deles derfor ikke mellom enheter. Løsningen er ikke produksjonssikker før autentisering og database kobles til, for eksempel via Supabase.


## v0.7.1 login-fiks
Denne patchen bruker en ny lokal lagringsnøkkel slik at eldre nettleserdata ikke blokkerer demo-kontoene. Passordfeltet tåler også utilsiktede mellomrom ved innliming.
