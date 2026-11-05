# FLYDES Platform

Aplikacja webowa (praca inżynierska) do konfiguracji i zamówień personalizowanych części samochodowych (lotki / spoilery, druk 3D).

**Stos:** Next.js (App Router) + TypeScript + PostgreSQL + Prisma + Auth.js (NextAuth v5).

**Status:** MVP demo (Etapy 0-4). To repozytorium zawiera kod źródłowy - **nie jest hostingiem produkcyjnym**. Promotor / recenzent uruchamia aplikację lokalnie po sklonowaniu.

---

## Wymagania

- **Node.js** 20+
- **npm**
- **Docker Desktop** (Postgres przez `docker compose`)

---

## Uruchomienie lokalne

```bash
# 1. Zależności
npm install

# 2. Środowisko (bez sekretów w repo)
cp .env.example .env
# Windows (PowerShell): Copy-Item .env.example .env
# opcjonalnie: ustaw własny AUTH_SECRET (np. openssl rand -base64 32)

# 3. Postgres
docker compose up -d

# 4. Migracje + dane przykładowe
npx prisma migrate dev
npm run db:seed

# 5. Aplikacja
npm run dev
```

Aplikacja: [http://localhost:3000](http://localhost:3000)

Build produkcyjny (weryfikacja): `npm run build` → `npm start`

### Szybki reset bazy

```bash
npm run db:reset
```

(usuwa dane, ponawia migracje i seed)

---

## Konta demo

| Rola  | E-mail               | Hasło       |
|-------|----------------------|-------------|
| ADMIN | `admin@flydes.local` | `Admin123!` |
| USER  | `user@flydes.local`  | `User123!`  |

---

## Zakres MVP

- Konfigurator: marka → model → generacja → części (dane z Postgres)
- Koszyk (localStorage) → złożenie zamówienia (wymaga logowania; ceny z DB)
- Wycena niestandardowa (upload geometrii) + przegląd w panelu admina
- Panel admina: CRUD części, statusy zamówień, ochrona roli `ADMIN`
- Seed przykładowego katalogu + miniatury poglądowe SVG/PNG
- Karty marek: **inicjały + kolor UI** (bez oficjalnych logo OEM)

### Grafiki poglądowe

Miniatury w `/public/parts/` to **grafiki poglądowe** (bez logo ani znaków towarowych marek). Nazwy w katalogu demo służą tylko do nawigacji. Modele 3D w `/public/models/` są przykładowe.

### Poza zakresem MVP (świadomie)

- **Bramka płatności** (PayU / P24 / Stripe) - brak w aplikacji; temat tylko w części teoretycznej pracy
- Realne dane katalogowe firmy
- Pełny CRUD hierarchii Brand / Model / Generation (wystarczy wybór generacji przy części)

---

## Struktura ścieżek

| Ścieżka | Opis |
|---------|------|
| `/` | Strona startowa |
| `/konfigurator` | Konfigurator katalogowy |
| `/wycena` | Wycena niestandardowa |
| `/koszyk` | Koszyk + złożenie zamówienia |
| `/zamowienie/[id]` | Potwierdzenie zamówienia |
| `/zamowienia` | Lista zamówień użytkownika |
| `/login`, `/register` | Auth (credentials) |
| `/admin` | Panel ADMIN |

**Role:** `USER` / `ADMIN` · **Statusy Order:** `NEW` → `IN_PROGRESS` → `COMPLETED`

---

## Skrypty

| Skrypt | Opis |
|--------|------|
| `npm run dev` | serwer developerski |
| `npm run build` | build produkcyjny |
| `npm start` | start po buildzie |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:seed` | seed (marki, części, konta) |
| `npm run db:reset` | reset migracji + seed |

---

## Krótki scenariusz sprawdzenia

1. Zaloguj jako USER → konfigurator → dodaj część do koszyka → złóż zamówienie  
2. Zaloguj jako ADMIN → zmień status zamówienia  
3. Sprawdź miniatury części (Ctrl+F5 przy cache)

---

## Demo online (opcjonalnie, za darmo)

Aplikacja to Next.js + Postgres, więc sam GitHub nie wystarczy - potrzebny jest hosting aplikacji i baza.

**Rekomendowany wariant:** [Vercel](https://vercel.com) (app) + [Neon](https://neon.tech) (Postgres).

1. Załóż projekt Neon → skopiuj connection string (`DATABASE_URL`).
2. Lokalnie (raz), na bazie Neon:
   ```bash
   set DATABASE_URL=postgresql://...   # PowerShell: $env:DATABASE_URL="..."
   npx prisma migrate deploy
   npm run db:seed
   ```
3. Zaimportuj repo na Vercel → ustaw zmienne:
   - `DATABASE_URL` (z Neon)
   - `AUTH_SECRET` (np. `openssl rand -base64 32`)
   - `AUTH_URL` = URL po deployu, np. `https://praca-inzynierska.vercel.app`
4. Deploy. Link z Vercel wysyłasz promotorowi.

**Działa zdalnie:** konfigurator, koszyk, zamówienia katalogowe, logowanie, panel admina, seed.

**Ograniczenie free/serverless:** upload pliku 3D przy wycenie custom zapisuje na dysk kontenera - na Vercel plik może zniknąć po restarcie. Do pokazu wystarczy ścieżka katalogowa; pełny upload online wymagałby Blob storage.
