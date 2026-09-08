import ClientssSection from "./_components/ClientsSection";
import CoverSection from "./_components/CoverSection";
import SuggestSection from "./_components/SuggestionsSection";
import MortgageCalculator from "./_components/MortgageCalculator";
import AboutParallax from "./_components/AboutParallax";
import PropertyCarousel from "./_components/PropertyCarousel";
import ProjectsCarousel from "./_components/ProjectsCarousel";

export default function Page() {
  return (
    <main>
      <CoverSection />
      <PropertyCarousel />
      <ProjectsCarousel />
      <AboutParallax />
      <SuggestSection />
      <MortgageCalculator />
      <ClientssSection />
    </main>
  );
}
