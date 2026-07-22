# WGANG Portal v0.18.0.22 – Profile Handler Restore

Årsak funnet:
- Profilknappen fungerte i den tidligere recovery-versjonen med én enkel `onclick`-handler.
- Feilen oppstod etter at vi la på ekstra `pointerup`, `touchend` og capture/fallback-logikk for iPhone.
- Disse ekstra hendelsene kunne konkurrere med/avbryte den normale Safari-klikkhendelsen.

Endring:
- Gjenoppretter den siste kjente fungerende enkle `profileChip.onclick`-løsningen.
- Fjerner alle eksperimentelle touch/pointer/hitbox-handlere.
- Oppgavebilder, nye oppgaver og «Ikke aktuell for meg» beholdes uendret.
- Ingen SQL nødvendig.
