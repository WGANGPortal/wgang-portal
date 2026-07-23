# WGANG Portal v0.18.0.23 – Bunny Card Redesign

## Oppgavekort
- Ny kompakt layout med kategori øverst.
- Illustrasjon til venstre og oppgavenavn/beskrivelse til høyre.
- Antall er dynamisk og vises oppå illustrasjonen.
- Beskrivelsen inneholder ikke antall, slik at samme mal kan gjenbrukes.
- Felles interesse vises på en grønn → gul → oransje → rød skala fra 0 til 30.
- Kun to personlige valg: «Jeg klargjør den» og «Ikke aktuelt for meg».
- Valg kan trykkes på nytt for å fjernes.

## Harepus-sesjoner
- Planleggingsvalg knyttes til den konkrete neste 10-minutters harepusten.
- Når harepusten er over, arkiveres valgene i historikk og aktive valg nullstilles.
- Hvis 30/30 ikke er nådd, opprettes neste harepust automatisk 90 minutter etter forrige start.
- Når 30/30 nås, stoppes denne automatikken for runden.
- Leder kan publisere/korrigere neste harepustid fra Derbyadministrasjon.

## Nye oppgaver
- Bomull ×38
- Stekte tomater ×3
- Gresskarpai ×2
- Stormester ×1
- Bringebærmuffins ×4
- Hvete gjenbruker eksisterende illustrasjon/mal.

SQL-migrasjonen må kjøres i Supabase.
