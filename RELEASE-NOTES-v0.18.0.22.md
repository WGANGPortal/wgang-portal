# WGANG Portal v0.18.0.22 – Dynamisk derbyfokus

## Endringer
- Oversikt skifter automatisk fra **Neste derby** til **Pågående derby** når derbyets starttid er passert.
- Dersom starttid ikke er tilgjengelig, brukes tirsdag kl. 10:00 i tidssonen Europe/Oslo som reserve.
- Oversikt tilpasses derbytypen som er publisert.
- For Chill Bunny/Harepus får planleggingsfasen eget fokus på Harepusplanen.
- Etter start endres tekst, statusfelt og hovedhandling til gjennomføringsfokus.
- Ingen databaseendring eller SQL-migrering kreves.

## Filer som er endret
- `index.html`
- `app.js`
- `service-worker.js`
