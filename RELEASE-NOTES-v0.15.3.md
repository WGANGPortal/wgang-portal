# WGANG Portal v0.15.3 – Mobile Menu Close Fix

## Rettelse
- Retter feilen der Admin-underkategorier ikke lukket sidemenyen på mobil.
- `closeMenu()` var kalt i v0.15.2, men selve funksjonen manglet.
- Sidemenyen lukkes nå eksplisitt etter valg av:
  - hovedside
  - Lederprat
  - Admin-underkategori
- Ingen databaseendring kreves.
