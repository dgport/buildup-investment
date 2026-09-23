# Rental catalogue

`buildup.ge` lists SALE properties and development projects.
`rent.buildup.ge` lists RENT and DAILY_RENT properties. Both use the existing
investment API, database, uploads and users; no data migration or copy is needed.

The same frontend source builds twice. Docker build arguments
`NEXT_PUBLIC_SITE_MODE` and `NEXT_PUBLIC_SITE_URL` select the market and canonical
origin. Runtime-only env changes do not rebuild the browser bundle.

Accounts, sign-in (including Google), dashboard, listing creation/editing and admin
are centralized on `buildup.ge`. Rental links navigate there using the existing
session. No parent-domain authentication cookies are added, so other applications
on sibling domains receive no new access to investment credentials.

Public API queries send `market=sale|rent`. This intersects with dealType and the
existing visibility/moderation filters. My listings and admin can select either
market or all. Old detail and catalogue links redirect to the correct origin.
Sitemaps, canonicals, metadata and rental navigation are market-specific.

## Deployment

1. Add DNS A record `rent` -> `68.183.219.11` (DNS only while issuing TLS).
2. Back up the investment database and tag both existing app images for rollback.
3. Pull, then build sequentially to stay within VPS memory:
   `docker compose -f docker-compose.prod.yml -f docker-compose.rent.yml build backend`
   and the same command with `frontend`, then `rent`.
4. Start only `backend` and `rent` with `up -d --no-build --no-deps --wait`.
   Check the rental app on server-local port 3002. Do not recreate postgres.
5. Create an isolated HTTP nginx vhost for `rent.buildup.ge` serving
   `/.well-known/acme-challenge/` from `/var/www/buildup-rent-acme`.
   Obtain a dedicated cert using certbot certonly --webroot. Install
   `deploy/rent.nginx.conf` as its own vhost, validate nginx, then reload.
   Do not edit the CRM vhost or its certificates.
6. Once rental HTTPS works, start the new `frontend` image to expose the split.
7. Verify CORS, sale/rental filters, both rental subtypes, cross-origin redirects,
   shared account routes, robots/sitemaps, and all three app health checks.

Integration regression (local database only; fixtures always roll back):
`cd backend && npm run build && node scripts/test-market-split.cjs`.

Rollback: restore the tagged investment backend/frontend images and recreate
those app services only. Existing database contents remain compatible. Keep the
rental vhost operational until any external rental links have been accounted for.
