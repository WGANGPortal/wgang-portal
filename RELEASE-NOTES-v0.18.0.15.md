# WGANG Portal v0.18.0.15 – Inner Chat Scroll Fix

- Retter at hele nettsiden ble scrollet i stedet for selve chatfeltet.
- Lederprat scroller nå den interne meldingslisten (`leadershipMessageList`).
- Finnes uleste innlegg, plasseres «NYE INNLEGG» / eldste uleste synlig i chatfeltet.
- Er alt lest, går chatfeltet til siste melding.
- Samme mekanisme brukes for øvrige chatkanaler når de har eget scrollbart meldingsfelt.
- Ingen ny SQL nødvendig.
