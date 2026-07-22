# WGANG Portal v0.18.0.26 – Harepus tidsjustering

## Endret
- Harepusnedtellingen kan nå synkroniseres manuelt av eier/admin/ass. leder når tidspunktet i Hay Day avviker fra portalens estimat.
- Leder velger dato og klokkeslett for **neste harepust** i den aktive runden.
- Etter den manuelle synkroniseringen fortsetter portalen automatisk med 10 minutter harepust og ny start hvert 1,5 time.
- Manuell tid gjelder bare den aktuelle runden og påvirker ikke ferdigmarkerte runder.
- Leder kan når som helst velge **Bruk automatikk** for å fjerne den manuelle justeringen.
- Runde 2 og 3 vises som estimerte rundestarter frem til faktisk tidspunkt er kjent/synkronisert.

## Praktisk for pågående derby
Når spillet viser at neste harepust er kl. **22:40**, legger en leder inn dette tidspunktet. Alle medlemmer får deretter samme nedtelling, og portalen beregner videre harepust hvert 1,5 time fra 22:40 dersom haren ikke er tatt.

## Database
Kjør `MIGRATION-v0.18.0.26-BUNNY-MANUAL-SCHEDULE.sql` i Supabase SQL Editor. v0.18.0.25-migreringen beholdes.
