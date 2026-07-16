# Project Rooster Foundation

Project Rooster er kodebasen bak WGANG Portal.

## Hensikt

WGANG Portal skal være et uavhengig organiserings- og fellesskapsverktøy for WGANG. Portalen skal ikke kopiere Hay Day eller hente data fra Supercells systemer.

## Foundation v0.1 inneholder

- samlet navigasjon og layout
- medlemsdashboard
- derby-senter
- medlemsoversikt
- oppgavepreferanser
- diskusjonskategorier
- WGANG Wiki
- adminområde
- demo-data i egen fil
- dokumentasjon og prosjektstruktur

## Mappestruktur

```text
project-rooster-foundation/
├── index.html
├── css/
│   └── main.css
├── js/
│   └── app.js
├── data/
│   └── demo-data.js
├── assets/
│   ├── icons/
│   └── images/
├── docs/
│   ├── PRODUCT.md
│   ├── DESIGN.md
│   └── ROADMAP.md
└── README.md
```

## Publisering på Cloudflare Pages

- Framework preset: None
- Build command: tomt
- Build output directory: `/`

## Viktig arbeidsregel

Alle nye versjoner skal være komplette prosjektversjoner som bygger videre på denne kodebasen. Ingen senere modul skal erstatte eller fjerne tidligere moduler uten at det er en uttrykkelig beslutning.
