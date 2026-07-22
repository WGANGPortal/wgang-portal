# WGANG Portal v0.18.0.20 – Profile Fix

- Retter profilknappen uten å endre oppgavekort/bildekoblinger.
- Fjerner en feilaktig `typeof showProfileHubSection`-sjekk som kunne treffe JavaScript temporal-dead-zone og stoppe profilåpningen.
- Beholder alle oppgaveillustrasjoner og teksten «Ikke aktuell for meg».
- Ingen CSS-endring.
- Ingen SQL nødvendig.
