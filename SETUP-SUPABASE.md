# WGANG Portal v0.8 – Koble til felles database

Denne versjonen kan kjøre i to moduser:

1. **Oppsettmodus (lokal demo)** – brukes automatisk når `config.js` ikke inneholder Supabase-nøkler.
2. **Felles medlemsportal (Supabase)** – ekte innlogging og felles data på tvers av telefoner og PC-er.

## 1. Opprett Supabase-prosjekt

Opprett et nytt prosjekt i Supabase Dashboard.

## 2. Opprett databasen

Åpne SQL Editor i prosjektet og kjør hele filen:

`supabase-schema.sql`

Denne oppretter:

- `profiles` – Hay Day-navn, rolle og medlemsstatus
- `derby_participation` – deltakelse i neste derby
- `task_preferences` – medlemmenes oppgavepreferanser
- `derby_settings` – felles derbyinnstillinger
- Row Level Security (RLS) for tilgangskontroll
- trigger som automatisk oppretter en medlemsprofil ved registrering

## 3. Legg inn Project URL og browser-safe key

Åpne `config.js` og fyll inn:

```js
window.WGANG_SUPABASE = {
  url: "DIN_SUPABASE_PROJECT_URL",
  anonKey: "DIN_PUBLISHABLE_ELLER_ANON_KEY"
};
```

Bruk kun Supabase sin browser-safe publishable/anon key. **Ikke legg inn `service_role`-nøkkelen i nettsiden.**

## 4. Opprett første eier

Etter at databasen er koblet til:

1. Gå til portalen.
2. Velg **Søk medlemskap**.
3. Registrer din egen konto.
4. Bekreft e-post dersom e-postbekreftelse er aktivert i Supabase.
5. Åpne SQL Editor og kjør:

```sql
update public.profiles
set role = 'owner', status = 'approved'
where email = 'DIN_EPOST_HER';
```

Logg deretter inn på nytt. Du har nå eiertilgang og kan godkjenne andre medlemmer fra adminpanelet.

## 5. Publiser på Cloudflare Pages

Last opp alle filene i ZIP-pakken. Portalen bruker Supabase direkte fra nettleseren og trenger ingen egen server på Cloudflare.

## Viktig sikkerhet

- Passord lagres og håndteres av Supabase Auth, ikke i WGANG-koden.
- Databasen bruker Row Level Security.
- Medlemmer kan bare endre egen deltakelse og egne preferanser.
- Administrator/eier kan godkjenne medlemmer, endre roller og redigere derbyinnstillinger.
- Fjernede medlemmer settes til status `removed`; historikk beholdes.

## E-postbekreftelse

Supabase kan være satt opp til å kreve e-postbekreftelse. Da må nye medlemmer først bekrefte e-posten sin og deretter vente på WGANG-admins godkjenning.

## Feilsøking

**Portalen viser demo admin:** `config.js` mangler gyldig Supabase URL eller key.

**Innlogging virker, men tilgang nektes:** Profilen står sannsynligvis som `pending`. Admin må godkjenne medlemmet.

**Første bruker kan ikke godkjenne andre:** Første eier må bootstrap-es én gang med SQL-kommandoen i steg 4.
