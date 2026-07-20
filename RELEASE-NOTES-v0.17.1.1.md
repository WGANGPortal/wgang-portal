# WGANG Portal v0.17.1.1 – Login Fix

- Fikser innlogging etter at den gamle utloggingsknappen i topplinjen ble fjernet.
- Årsak: JavaScript forsøkte fortsatt å koble en klikkhendelse til den fjernede `closePortal`-knappen.
- Beholder:
  - Logg ut i profilmenyen
  - ingen pilknapp i topplinjen
  - profilspråk (Norsk / Engelsk / Andre språk)
  - varslingsinnstillinger
