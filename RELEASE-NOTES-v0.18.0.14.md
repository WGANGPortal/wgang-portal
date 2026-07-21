# WGANG Portal v0.18.0.14 – Chat AutoScroll Fix

- Robust automatisk plassering i chat etter at siden er ferdig rendret.
- Hvis det finnes uleste innlegg: åpner ved «NYE INNLEGG» / eldste uleste.
- Hvis alt er lest: åpner ved siste/nyeste innlegg.
- Gjentar plasseringen etter layoutendringer, fontlasting og bilder slik at nettleserens scroll-gjenoppretting ikke sender siden tilbake til toppen.
- Samme prinsipp brukes på Lederprat og øvrige chatkanaler med samme struktur.
- Ingen ny SQL nødvendig.
