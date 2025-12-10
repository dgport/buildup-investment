import { useTranslation } from 'react-i18next'
import { usePartners } from '@/lib/hooks/usePartners'
import { useProjects } from '@/lib/hooks/useProjects'
import ProjectsCarousel from '@/components/pages/home/ProjectsCarousel'
import PropertyCarousel from '@/components/pages/home/PropertyCarousel'
import SuggestSection from '@/components/pages/home/SuggestionsSection'
import FeaturesSection from '@/components/pages/home/FeaturesSection'
import Cover from '@/components/pages/home/Cover'
import PartnersCarousel from '@/components/pages/home/PartnerCarousel'
import MortgageCalculator from '@/components/shared/calculator/MortgageCalculator'

const HomePage = () => {
  const { i18n } = useTranslation()

  const { data: partnersResponse, isLoading: partnersLoading } = usePartners({
    lang: i18n.language,
    page: 1,
    limit: 9,
  })

  const { data: projectsResponse, isLoading: projectsLoading } = useProjects({
    lang: i18n.language,
  })

  const partners = partnersResponse?.data || []

  return (
    <main className="min-h-screen w-full">
      <Cover />

      <section className="px-6 sm:px-8 md:px-12 lg:px-16 xl:px-28">
        <PropertyCarousel />
      </section>
      {projectsLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : projectsResponse ? (
        <section className="px-6 sm:px-8 md:px-12 lg:px-16 xl:px-28">
          <ProjectsCarousel projectsResponse={projectsResponse} />
        </section>
      ) : null}

      <FeaturesSection />
      <MortgageCalculator />
      <SuggestSection />

      {partnersLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : partners.length > 0 ? (
        <section className="px-6 sm:px-8 md:px-12 lg:px-16 xl:px-28">
          <PartnersCarousel partners={partners} />
        </section>
      ) : null}
    </main>
  )
}

export default HomePage
