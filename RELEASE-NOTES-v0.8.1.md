# WGANG Portal v0.8.1 – Auth & Membership Flow

Denne versjonen bygger den permanente autentiserings- og medlemsflyten på Supabase-fundamentet.

## Nytt

- Supabase-konfigurasjonen er lagt inn i `config.js`.
- Invitasjonslenker oppdages ved retur til portalen.
- Invitert bruker får skjermbildet «Opprett passord».
- Passord lagres via Supabase Auth (`updateUser`).
- Etter opprettet passord logges brukeren ut og kan logge inn normalt.
- «Glemt passord?» sender Supabase reset-lenke og lar brukeren velge nytt passord i samme dialog.
- «Søk medlemskap» oppretter Supabase-bruker med Hay Day-navn som metadata og profilstatus `pending`.
- Nye medlemmer får ikke tilgang før admin setter status til `approved`.
- Admin kan godkjenne/avvise søkere i eksisterende adminpanel.
- Demo-innloggingsdata er fjernet fra produksjonsfeltene.

## Første eierkonto

Den første inviterte brukeren må settes til `owner` og `approved` én gang i databasen. Se `FIRST-OWNER-SETUP.sql`.

## Medlemsflyt

Vanlige medlemmer:

1. Søk medlemskap.
2. Oppgi Hay Day-navn, e-post og passord.
3. Bekreft e-post ved behov.
4. Profilen står som `pending`.
5. Admin kontrollerer Hay Day-navnet mot WGANG i spillet.
6. Admin godkjenner eller avviser.
7. Godkjent medlem logger inn og får tilgang.

Invitert bruker / første eier:

1. Motta invitasjon.
2. Åpne invitasjonslenken.
3. Opprett passord.
4. Logg inn.
5. Få tilgang når profilen er `approved`.
