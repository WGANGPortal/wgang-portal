# WGANG Portal v0.18.0.103 – sikkerhetsoppdatering

Denne oppdateringen følger opp sikkerhetsgjennomgangens punkt 1–7.

## Gjennomført i portal og database

- Eier og administrator må bruke TOTP-tofaktorautentisering.
- Sensitive rolle-, medlems-, derby- og resultatendringer krever AAL2 også i databasen.
- Alle offentlige SECURITY DEFINER-funksjoner mister eksplisitt tilgang for PUBLIC og anon.
- Den utgåtte resultatrutinen v60 stenges for innloggede brukere.
- Databasekontroll verifiserer RLS, funksjonstilgang og MFA-trigger.
- Private meldinger, kommentarer og innlegg får serverbaserte aktivitetsgrenser.
- Avslåtte/fjernede kontoer eldre enn 90 dager ryddes ukentlig når referanser tillater trygg sletting.
- HSTS aktiveres.
- Bilder dekodes og kodes på nytt i nettleseren før opplasting. Dette fjerner EXIF og annen skjult metadata.
- Registreringsskjemaet har honeypot og støtte for Cloudflare Turnstile.
- Personverninformasjonen er oppdatert til 10. oktober 2026.

## Krever én gangs innstilling i Supabase

To Auth-innstillinger kan ikke endres med SQL:

1. Slå på **Leaked password protection** under Authentication → Attack Protection.
2. Opprett Cloudflare Turnstile, legg hemmelig nøkkel inn under Authentication → Bot and Abuse Protection, og legg den offentlige site key-en i config.js.

Ikke aktiver CAPTCHA i Supabase før turnstileSiteKey er satt og v0.18.0.103 er publisert, ellers kan innlogging stoppe.
