# BuildUp — real estate listings (Batumi / Adjara)

Monorepo with two apps:

| Folder      | Stack                                                    | Port |
| ----------- | -------------------------------------------------------- | ---- |
| `backend/`  | NestJS 11 · Prisma 6 · PostgreSQL 15 · JWT + Google OAuth | 3000 |
| `frontend/` | Next.js 16 · React 19 · next-intl (ka / en) · Tailwind 4  | 3001 |

Signed-in users publish their own listings (apartments, villas, land, commercial,
hotels) with photos, a map pin and titles/descriptions in Georgian, English and
Russian. Listings are public immediately; owners edit them from **My listings**.

## Run locally (recommended for development)

Requirements: Node 20+, a PostgreSQL server (local install or the Docker one below).

```bash
# 1. Backend
cd backend
cp .env.example .env            # fill in secrets; DATABASE_URL defaults to localhost:5432/buildup
npm install
npx prisma migrate deploy       # creates/updates the schema
npx prisma db seed              # region names (+ optional default phone)
npm run start:dev               # http://localhost:3000/api  (Swagger: /api/docs)

# 2. Frontend
cd frontend
cp .env.example .env            # Mapbox + Web3Forms keys
npm install
npm run dev                     # http://localhost:3001 (uses .env.development → localhost API)
```

Uploaded photos are stored in `backend/public/uploads/` and served from
`http://localhost:3000/uploads/...`.

## Run with Docker

```bash
# Postgres (host port 5434) + API with hot reload; run the frontend on the host
docker compose -f docker-compose.dev.yml up --build

# Full production stack (API + Next.js standalone + Postgres)
POSTGRES_PASSWORD=change-me docker compose -f docker-compose.prod.yml up -d --build
```

Both compose files inject `DATABASE_URL` themselves, so `backend/.env` can keep
the localhost URL. `frontend/.env.production` must point `NEXT_PUBLIC_API_*` at
the public API origin (e.g. `https://api.buildup.ge`).

## Environment files

- `backend/.env` — database, JWT secrets, Google OAuth, Resend (e-mail), `FRONTEND_URL`
  (see `backend/.env.example`).
- `frontend/.env` — shared public keys (Mapbox, Web3Forms);
  `frontend/.env.development` / `.env.production` — API URLs per environment.

## Useful commands

```bash
# backend
npm run build          # compiles to dist/
npx prisma studio      # browse the database
npx prisma migrate dev --name <change>   # after editing prisma/schema.prisma

# frontend
npm run typecheck
npm run lint
npm run build
```

## API overview

| Method | Path                                     | Auth        | Purpose                                  |
| ------ | ---------------------------------------- | ----------- | ---------------------------------------- |
| GET    | `/api/properties`                        | –           | Public listings with filters & paging    |
| GET    | `/api/properties/:id`                    | –           | Public listing                           |
| GET    | `/api/properties/my-properties`          | user        | Own listings (any status/visibility)     |
| GET    | `/api/properties/my-properties/stats`    | user        | Counts per status                        |
| GET    | `/api/properties/:id/manage`             | owner/admin | Listing for editing                      |
| POST   | `/api/properties` (multipart)            | user        | Create listing (+ `images[]`)            |
| PATCH  | `/api/properties/:id` (multipart)        | owner/admin | Update fields, add photos                |
| DELETE | `/api/properties/:id`                    | owner/admin | Delete listing and its files             |
| PATCH  | `/api/properties/:id/images/order`       | owner/admin | Reorder gallery (`imageIds`)             |
| DELETE | `/api/properties/:id/images/:imageId`    | owner/admin | Delete one photo                         |
| GET/PATCH | `/api/properties/:id/translations`    | owner/admin | Per-language title/address/description   |
| GET    | `/api/properties/admin/all`              | admin       | Everything incl. hidden listings         |

Full interactive docs: `http://localhost:3000/api/docs`.
