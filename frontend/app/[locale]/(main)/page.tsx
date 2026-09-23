import { IS_RENT_SITE } from "@/lib/market";
import { getLocale } from "next-intl/server";
import ClientsSection from "./_components/ClientsSection";
import CoverSection from "./_components/CoverSection";
import SuggestSection from "./_components/SuggestionsSection";
import MortgageCalculator from "./_components/MortgageCalculator";
import AboutParallax from "./_components/AboutParallax";
import PropertyCarousel from "./_components/PropertyCarousel";
import ProjectsCarousel from "./_components/ProjectsCarousel";
import ListPropertyCta from "./_components/ListPropertyCta";
import { jsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants/env";
import { CONTACT_EMAIL, CONTACT_FACEBOOK, CONTACT_INSTAGRAM, CONTACT_PHONE, HAS_CONTACT_PHONE } from "@/lib/constants/contact";

/** Organization + WebSite structured data: brand panel, sitelinks search box. */
function homeJsonLd(locale: string) {
  const sameAs = [CONTACT_FACEBOOK, CONTACT_INSTAGRAM].filter((u) => u && !/^https?:\/\/(www\.)?facebook\.com\/?$/.test(u));
  return [
    {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "@id": `${SITE_URL}/#organization`,
      name: IS_RENT_SITE ? "BuildUp Rent" : "Build Up Investment",
      url: SITE_URL,
      logo: `${SITE_URL}/icons/icon-512.png`,
      image: `${SITE_URL}/og-image.jpg`,
      ...(HAS_CONTACT_PHONE && { telephone: CONTACT_PHONE.replace(/\s/g, "") }),
      email: CONTACT_EMAIL,
      address: { "@type": "PostalAddress", addressLocality: "Batumi", addressCountry: "GE" },
      areaServed: { "@type": "Country", name: "Georgia" },
      ...(sameAs.length && { sameAs }),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: IS_RENT_SITE ? "BuildUp Rent" : "Build Up Investment",
      inLanguage: locale,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/properties?region={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

export default async function Page() {
  const locale = await getLocale();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(homeJsonLd(locale)) }} />
      <CoverSection />
      <PropertyCarousel />
      {!IS_RENT_SITE && <ProjectsCarousel />}
      <ListPropertyCta />
      {!IS_RENT_SITE && <AboutParallax />}
      {!IS_RENT_SITE && <SuggestSection />}
      {!IS_RENT_SITE && <MortgageCalculator />}
      {!IS_RENT_SITE && <ClientsSection />}
    </>
  );
}
