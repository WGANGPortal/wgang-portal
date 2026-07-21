# WGANG Portal v0.18.0.12 – Roller, varslinger og lesestatus

## Roller og rettigheter
- Ny detaljert rettighetsmatrise under Medlemmer og roller.
- Matrisen viser portalens faktiske standardtilganger.
- Eier kan endre rettigheter for Admin, Ass. leder og Medlem.
- Eier-rettigheter er låst.
- Rettighetsendringer logges med gammel/ny verdi, bruker og tidspunkt.
- Rettigheter brukes nå i sentrale funksjoner for medlemsbehandling, Lederprat, godkjenning og varslinger.

## Varslinger
- Varsler filtreres etter faktisk rettighet før de vises.
- Lederprat-varsler kan bare vises til roller som har tilgang til Lederprat.
- Medlemsforespørsler og innlegg til godkjenning varsles bare til brukere som kan behandle dem.
- «Viktige derbyvarsler» samler derbyrelaterte varselvalg.
- Varslingsbadge teller nå antall ventende administrasjonssaker der dette er kjent.

## Lederprat
- Chatten markerer eldste uleste innlegg med «Nye innlegg».
- Ved åpning flyttes visningen til eldste uleste.
- «nyere innlegg»-indikator vises når det finnes flere meldinger under.
- Lesestatus lagres per bruker og kanal.

## Historikk
- Eksisterende `derby_events.id` brukes videre som Derby-ID.
- Rettighetsendringer får egen revisjonslogg.

E-postutsending og iPhone/web-push er fortsatt ikke aktivert; dette bygges på etter at varslingsmotoren er testet.
