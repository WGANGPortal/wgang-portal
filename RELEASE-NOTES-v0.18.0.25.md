# WGANG Portal v0.18.0.25 – Harepus live countdown

## Nytt
- Oversikt viser automatisk nedtelling til neste harepust mens Harepus Derby pågår.
- Runde 1 åpner 6 timer etter derbystart, runde 2 etter 1,5 døgn og runde 3 etter 3,5 døgn.
- Innen aktiv runde beregnes Harepust som 10 minutter aktiv tid med ny start hvert 1,5 time.
- Under selve Harepusten skifter visningen til «HAREPUST PÅGÅR» og teller ned de 10 minuttene.
- Eier/admin/ass. leder kan markere «Harepus tatt – avslutt runde». Status lagres i Supabase og blir felles for alle medlemmer.
- Når en runde avsluttes teller portalen ned til neste faste rundestart. Etter runde 3 vises at alle tre harepusene er tatt.
- Harepus-ikonet på Oversikt har fått høy kontrast og er tydelig synlig på rosa bakgrunn.
- Tips-teksten er endret slik at populære oppgaver skal være forhåndsklargjort og gjennomføres raskt, uten oppfordringen «Ta de mest populære oppgavene først».

## Database
Kjør `MIGRATION-v0.18.0.25-BUNNY-ROUND-COUNTDOWN.sql` i Supabase SQL Editor.
