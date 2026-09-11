/**
 * Company contact details shown in the footer, contact page and structured data.
 * Override without a code change via NEXT_PUBLIC_CONTACT_* in `.env`.
 */
export const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || "+995 000 00 00 00";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "digitalport@gmail.com";
export const CONTACT_FACEBOOK = process.env.NEXT_PUBLIC_CONTACT_FACEBOOK || "https://facebook.com";
export const CONTACT_INSTAGRAM = process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM || "";
export const CONTACT_MAPS_URL = "https://maps.google.com/?q=Batumi,Georgia";

/** False until a real number is configured – placeholder digits are hidden from visitors. */
export const HAS_CONTACT_PHONE = !/000 00 00 00/.test(CONTACT_PHONE);
