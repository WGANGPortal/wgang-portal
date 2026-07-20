# KI-oversettelse – v0.17.0

Portalen inneholder Edge Function-koden i:
`supabase/functions/translate-content/index.ts`

Funksjonen krever to secrets:
- `OPENAI_API_KEY`
- `OPENAI_TRANSLATION_MODEL`

Når English er valgt, vil portalen be Edge Function om oversettelse for dynamisk innhold som ikke allerede finnes i `content_translations`. Oversettelsen caches i databasen og brukes ved senere visninger.

Supabase Edge Functions er riktig sted for API-nøkkelen; den skal ikke ligge i nettleserkoden.
