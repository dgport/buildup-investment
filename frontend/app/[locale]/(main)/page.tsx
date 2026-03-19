import { getPageMetadata } from "@/lib/getMetadata";
import ClientssSection from "./_components/ClientsSection";
import CoverSection from "./_components/CoverSection";
import SuggestSection from "./_components/SuggestionsSection";
import MortgageCalculator from "./_components/MortgageCalculator";
import AboutParallax from "./_components/AboutParallax";
import PropertyCarousel from "./_components/PropertyCarousel";

export async function generateMetadata() {
  return getPageMetadata("home");
}

export default function Page() {
  return (
    <main>
      <CoverSection />
      <PropertyCarousel />
      <AboutParallax />
      <SuggestSection />
      <MortgageCalculator />
      <ClientssSection />
    </main>
  );
}
