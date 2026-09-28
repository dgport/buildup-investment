# Authentication

Accounts remain on `https://buildup.ge`; rental account links redirect there.
The API lives at `https://api.buildup.ge/api`.

## Email delivery

Select `EMAIL_PROVIDER=resend` (default) or `EMAIL_PROVIDER=sendly`.
For Sendly set `SENDLY_EMAIL_KEY` and a plain sender address such as
`EMAIL_FROM=noreply@buildup.ge`. Activate an Email plan and verify the domain
using the exact DNS records generated in Sendly's dashboard before switching
production. Resend DNS records are not interchangeable with Sendly's records.
The adapter uses `POST https://app.sendly.ge/api/v1/email/send`, requires a
202 response with an ID and `queued` status, and has a 15-second timeout.
Queued means accepted, not delivered; check Email Logs and the recipient inbox.
Provider failures retain the existing `EMAIL_UNAVAILABLE` behavior. Do not
automatically retry through another provider: a timeout may follow acceptance.
Keep the existing provider active until Sendly credentials and DNS are ready.

Set `RESEND_API_KEY` and `EMAIL_FROM` in the server's ignored `backend/.env`.
Use a sender on a verified Resend domain, for example
`BuildUp <noreply@buildup.ge>`. The `onboarding@resend.dev` sender only sends to
the Resend account owner and is unsuitable for public registration.
Copy the exact DNS records supplied by Resend into the domain's DNS provider,
verify the domain, and use a sending key authorized for that domain. Never
commit credentials. Recreate only the investment backend after changing its
environment; do not restart PostgreSQL or the unrelated CRM.

Signup preserves the account when delivery fails and returns
`verificationEmailSent: false`, so the UI offers resend without claiming that
a message arrived. Recovery endpoints validate and normalize email addresses.
Provider acceptance does not prove inbox delivery: verify a real received
message and follow its link before declaring email setup complete.

## Google

Google Cloud OAuth web client must allow exactly:
`https://api.buildup.ge/api/auth/google/callback`.
Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` and
`FRONTEND_URL=https://buildup.ge` on the backend. Check the consent screen's
publishing/test-user restrictions in the owning Google project.

Google requests carry signed state bound to an HttpOnly, Secure, SameSite=Lax
cookie, expiring in ten minutes. Callback rejects missing, mismatched or expired
state and unverified Google email. Success sets the existing API refresh cookie;
the frontend exchanges it via POST for an access token. Tokens never travel in
the redirect URL. A same-origin return path preserves the intended destination.
Real Google consent and token exchange still need a browser test with the owner.

## Checks

From backend: `node node_modules/jest/bin/jest.js --runInBand auth`.
From frontend: `npm run typecheck` and lint the changed files.

After building the backend, `node scripts/test-auth-flows.cjs` exercises the
real database, Argon2 and token services. It captures mail in memory and rolls
back its transaction, including all temporary users and sessions. It must run
with the investment database configuration. It does not test provider delivery
or replace a real Google consent test.

Check signup, verify/resend, login, logout, forgot/reset, expired/reused links,
Google success/cancel and `next=/admin`/rental return paths. Test Georgian and
English, desktop and mobile. After reset, refresh sessions are revoked; an
already issued access token retains its existing short expiry.
