# WGANG Portal v0.5.0

Komplett frontendpakke for WGANG-portalen.

## Innhold

- Offentlig forside
- Desktop- og mobiltilpasset hero-bakgrunn
- Kremfarget og rosa logoikon
- Dashboard
- Derby-senter
- Medlemsoversikt
- Oppgavepreferanser
- Diskusjoner
- WGANG Wiki
- Adminvisning
- Appikoner og favicon
- Dokumentasjon og testliste

## Filstruktur

```text
WGANG-Portal-v0.5/
├── index.html
├── main.css
├── app.js
├── demo-data.js
├── assets/
│   ├── logos/
│   ├── backgrounds/
│   └── app-icons/
└── docs/
```

## GitHub og Cloudflare Pages

Last opp innholdet i denne mappen til rotmappen i ønsket GitHub-gren.

Cloudflare Pages:
- Framework preset: None
- Build command: tomt
- Build output directory: /

## Anbefalt testgren

Opprett en gren, for eksempel:

`preview-v0.5`

Last opp hele pakken i denne grenen og test den før den flettes inn i `main`.

## Begrensning

Dette er fortsatt en frontend-prototype. Endringer lagres ikke permanent før database og innlogging kobles til.
