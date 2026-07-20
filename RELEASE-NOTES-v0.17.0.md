# WGANG Portal v0.17.0 – Social & Bilingual Foundation

## Innhold
- Fullere kvalitetssikret engelsk systemoversettelse på Derby, Wiki, Diskusjoner og Lederprat.
- KI-oversettelsesarkitektur for dynamisk/publisert innhold.
- Automatisk henting av lagrede engelske oversettelser når English er valgt.
- Likes og kommentarer på kunngjøringer, Derbyprat og publiserte tips.
- Likes og kommentarer i Lederprat med samme tilgangsbeskyttelse som Lederprat.
- Rollebasert sletting av kommentarer.
- Aktivitetsvarsler til innleggsforfatter ved nye likes og kommentarer.
- Lederprat-undertekst: «Et lukket rom for lederne.» / “A private space for the leadership team.”

## Før utrulling
1. Kjør `MIGRATION-v0.17.0-SOCIAL-BILINGUAL.sql` i Supabase.
2. Deploy Edge Function `translate-content`.
3. Legg `OPENAI_API_KEY` og `OPENAI_TRANSLATION_MODEL` inn som Supabase Edge Function secrets.
4. Last deretter portalfilene opp til GitHub.

API-nøkler skal ikke legges i frontend eller GitHub.
