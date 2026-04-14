# AAE gradnje – profesionalna aplikacija za račune

Aplikacija omogoča:
- ustvarjanje in shranjevanje računov,
- nalaganje obstoječih PDF računov,
- uvoz preteklih PDF dokumentov za tekoče leto,
- vodenje evidence po mesecih in iskanje po računih,
- osnovno prijavo uporabnika (JWT).

## Tehnologije
- **Backend:** Node.js, Express, Joi, JWT, Multer, pdf-lib
- **Hranjenje podatkov:** lokalni JSON (`backend/src/data/*.json`)
- **Frontend:** enostaven web UI v `frontend/index.html`

## Zagon
```bash
npm install
npm start
```
Aplikacija teče na `http://localhost:3000`.

## 1) Priprava uporabnika (prvi zagon)
Ker je aplikacija nova, najprej registriraj admin uporabnika:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"AAE Admin","email":"admin@aae.si","password":"MojeGeslo123"}'
```
Nato se prijaviš preko UI.

## 2) Uvoz obstoječih PDF računov
1. Ustvari mapo `existing-pdf/`.
2. Vanjo daj datoteke z imeni v obliki:
   - `RAC-001_2026-01-10_1250.50_Stranka d.o.o..pdf`
   - `RAC-002_2026-02-03_600_Peter Novak.pdf`
3. Zaženi:
```bash
npm run import:existing -- existing-pdf
```

## 3) Ključni API endpointi
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/invoices`
- `POST /api/invoices`
- `POST /api/invoices/upload`
- `PUT /api/invoices/:id`
- `DELETE /api/invoices/:id`
- `GET /api/invoices/:id/pdf`
- `GET /api/reports/monthly`

## Opomba
Za produkcijo priporočam:
- PostgreSQL namesto JSON datotek,
- objektno shrambo za PDF (npr. S3),
- HTTPS + varno hranjenje `JWT_SECRET`,
- revizijsko sled sprememb računov.
