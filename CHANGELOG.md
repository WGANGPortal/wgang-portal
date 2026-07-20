
## v0.8.3 – Content & admin polish
- Endret informasjonsteksten i innloggingsvinduet til en enklere medlemsrettet velkomsttekst.
- Administrator kan nå endre andre brukere fra Eier tilbake til Administrator eller Medlem. Egen Eier-rolle er fortsatt låst i grensesnittet for å unngå utilsiktet nedgradering.
- Beholder tydelig «Under utvikling»-merking og WGANG Tips & triks fra v0.8.2.

## v0.8.1 – Auth & Membership Flow

- Permanent invitasjonsflyt med oppretting av passord.
- Glemt-passord-flyt via Supabase.
- Medlemssøknader opprettes som `pending` og må godkjennes av admin.
- Produksjonskonfigurasjon for WGANG Supabase lagt inn.
- Demo-verdier fjernet fra innloggingsfeltene.
- Nytt oppsett for første Owner-konto.

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

## v0.8.2 – Content & Development Status
- Merket moduler uten reelle data tydelig som «Under utvikling».
- Fjernet misvisende demo-innhold for oppgavefremdrift og nabolagsnytt fra hovedoversikten.
- Derbyfremdrift og scoreboard vises nå som planlagte funksjoner i stedet for falske data.
- Diskusjonsmodulen er markert som under utvikling.
- WGANG Wiki er erstattet/utvidet med «WGANG Tips & triks» og første strategiske tips.
- La inn tydelig beskjed om at kunnskapsdelen skal vokse gjennom nabolagets tilbakemeldinger.

## v0.9.0 – Community Content
- La til databasebaserte kunngjøringer.
- La til Derbyprat for godkjente medlemmer.
- La til medlemmenes innsending av Tips & triks med admin-godkjenning.
- La til adminpublisering av tips og kunngjøringer.
- La til moderering og sletting av innhold.


## v0.9.1
- PWA-støtte med manifest og service worker.
- Installér som app-veiledning.
- Grupperte oppgavepreferanser med 10 hovedkategorier.
- Nytt samarbeidstips.
- Forenklet kunngjøringstekst.

## v0.10.0
- La til derbyadministrasjon med grunnmaler og publisering av neste derby.
- La til per-derby deltakelse.
- La til adminvarsler for saker som krever handling.
- Utvidet adminoversikt for oppgavepreferanser med medlem → oppgaver.
- La til Tomat under innhøstingsoppgaver.
- Oppdatert svarfrist til mandag kl. 23:00.

## v0.12.0
- Added voluntary member profiles.
- Added uppercase normalization for Hay Day names.
- Removed email from member/admin presentation and browser-readable profile columns.
- Added safe self-service profile editing through Supabase RPC.
- Added Norwegian/English language selector foundation.
