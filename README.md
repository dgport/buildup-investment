# BuildUp — real estate listings (Batumi / Adjara)

Monorepo with two apps:

| Folder      | Stack                                                    | Port |
| ----------- | -------------------------------------------------------- | ---- |
| `backend/`  | NestJS 11 · Prisma 6 · PostgreSQL 15 · JWT + Google OAuth | 3000 |
| `frontend/` | Next.js 16 · React 19 · next-intl (ka / en) · Tailwind 4  | 3001 |

Signed-in users publish their own listings (apartments, villas, land, commercial,
hotels) with photos, a map pin and titles/descriptions in Georgian, English and
Russian. Owners edit them from **My listings**. By default listings go live
immediately; switch on **listing moderation** in `/admin/settings` and new
listings wait in the admin queue instead (owners are e-mailed when approved or
rejected, and a rejected listing returns to the queue as soon as its owner edits
it).

**Admin panel** (`/admin`): overview with pending queue and latest leads,
listing moderation (approve / reject with reason / VIP / delete), developer
projects, developers, leads inbox, user management (role, block) and site
settings (moderation switch, default contact phone). New leads and listings
awaiting review are e-mailed to `ADMIN_NOTIFY_EMAIL` (falls back to `ADMIN_EMAIL`).

**Developer projects** (new-build complexes) are curated by the admin from
`/admin`: developers with logo and profile, projects with gallery, status and
construction progress, delivery quarter, price per m² / starting price,
installment terms, amenities, video / 3D tour, map pin, and apartment types
(rooms, area range, price, floor plans, availability). Visitors browse
`/projects` (list + map view, filters) and `/developers`, and send consultation
requests that land in `/admin/leads`.

### Becoming admin

1. Sign up on the site with the e-mail you want to use.
2. Put it in `backend/.env` as `ADMIN_EMAIL=you@example.com`.
3. Run `cd backend && npx prisma db seed` — the account is promoted to `ADMIN`
   and the **ადმინი / Admin** link appears in the profile menu.

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

## Security & operations

- API: `helmet` security headers, gzip `compression`, global rate limit (300 req/min per IP)
  with stricter limits on sign-in (10/min), sign-up (5/min), password reset (3/min) and the
  lead form (5 per 10 min); uploads are verified by magic bytes, not just MIME type.
- The API refuses to start in production with JWT secrets shorter than 32 characters or
  identical secrets. Swagger (`/api/docs`) is off in production unless `ENABLE_SWAGGER=true`.
- `GET /health` reports API + database status and drives the Docker healthchecks.
- Frontend: `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS and
  `frame-ancestors` CSP; private pages (`/admin`, `/dashboard`, auth screens) are `noindex`.
- SEO: `/robots.txt`, `/sitemap.xml` (listings, projects, developers), `/manifest.webmanifest`,
  canonical URLs, Open Graph defaults and schema.org JSON-LD on property and project pages.

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
| GET    | `/api/properties/admin/all`              | admin       | Everything incl. hidden listings (`status`, `search`) |
| PATCH  | `/api/properties/admin/:id/status`       | admin       | Approve / reject (`rejectionReason`) / re-queue |
| GET    | `/api/admin/stats`                       | admin       | Dashboard counters, pending queue, latest leads |
| GET/PATCH | `/api/admin/users[/:id]`              | admin       | List users; change `role` / `isActive`   |
| GET/PATCH | `/api/admin/settings`                 | admin       | `default_contact_phone`, `listing_moderation` |
| GET    | `/api/projects`, `/api/projects/map`     | –           | Published development projects / map pins |
| GET    | `/api/projects/:idOrSlug`                | –           | Project with developer, unit types, related |
| POST   | `/api/projects/:id/leads`                | –           | Consultation request (rate-limited)      |
| GET    | `/api/developers`, `/api/developers/:slug` | –         | Developers with project counts           |
| POST/PATCH/DELETE | `/api/projects`, `/api/projects/:id` | admin | Manage projects (JSON)                   |
| POST   | `/api/projects/:id/images`               | admin       | Upload gallery photos (multipart `images[]`) |
| POST/PATCH/DELETE | `/api/projects/:id/unit-types[/:utId]` | admin | Apartment types (+ `/images` floor plans) |
| POST/PATCH/DELETE | `/api/developers[/:id]`        | admin       | Manage developers (+ `/logo` upload)     |
| GET/PATCH/DELETE | `/api/projects/leads[/:id]`     | admin       | Leads inbox                              |

Full interactive docs: `http://localhost:3000/api/docs`.
