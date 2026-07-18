# Changelog

## v0.7.3 – Derby Preference Foundation
- Gjorde oppgavepreferanser persistente per medlem.
- La til adminmatrise for nabolagets oppgavepreferanser.
- La til tavleanbefalinger basert på preferansedata.
- Oppdaterte Standard Derby-strategi til 320-poengsfokus.
- Viser medlemmenes positive preferanser på medlemskort.
- Lagrer derbyinnstillinger lokalt.
- La til migrering av eldre v0.7-localStorage.
- Bedret dialog-fallback og HTML-escaping.

## v0.7.2 – Button Fix
- Rettet JavaScript-feil som gjorde auth-knapper inaktive.

## v0.7.1 – Login Fix
- Ny lokal lagringsnøkkel og mer robust innlogging.

## v0.7 – Community Foundation
- Medlemsregistrering, godkjenning, innlogging, roller og derbystatus.

## v0.8.0 – Shared Data Foundation
- Supabase Auth for ekte e-post/passord-innlogging.
- Felles Postgres-database for medlemmer, derbystatus og oppgavepreferanser.
- RLS-beskyttede tabeller og rollebasert administrasjon.
- Medlemssøknader opprettes automatisk ved registrering.
- Admin kan godkjenne, avslå og deaktivere medlemmer.
- Derbyinnstillinger synkroniseres mellom enheter.
- Lokal demo beholdes som automatisk fallback når Supabase ikke er konfigurert.
