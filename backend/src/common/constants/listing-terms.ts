/**
 * Version of the listing terms owners accept before publishing
 * (frontend page: /listing-terms). Bump it whenever the terms change in a way
 * owners must agree to again – e.g. when paid phone visibility is introduced.
 * Keep it in sync with `version` in frontend/messages/{ka,en}/terms.json.
 */
export const LISTING_TERMS_VERSION = '2026-09-16';

export const hasAcceptedListingTerms = (user?: {
  listingTermsVersion?: string | null;
}) => user?.listingTermsVersion === LISTING_TERMS_VERSION;

/** Adds `listingTermsAccepted` to a user object sent to the frontend. */
export const withListingTermsStatus = <
  T extends { listingTermsVersion?: string | null },
>(
  user: T,
) => ({ ...user, listingTermsAccepted: hasAcceptedListingTerms(user) });
