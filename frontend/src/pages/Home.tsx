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
import { useDocumentMeta } from '@/lib/hooks/useDocumentMeta'

const HomePage = () => {
  const { i18n, t } = useTranslation()

  useDocumentMeta({
    title: t(
      'meta.home.title',
      'United Construction and Real Estate | Premium Properties in Batumi'
    ),
    description: t(
      'meta.home.description',
      'Find your dream property in Batumi, Georgia. Explore apartments, houses, and commercial real estate from trusted developers. Expert construction and real estate services.'
    ),
    keywords: t(
      'meta.home.keywords',
      'real estate Batumi, property Georgia, apartments Batumi, construction Georgia, real estate investment, Batumi developers, buy apartment Batumi'
    ),
    ogImage: '/Logo.png',
    lang: i18n.language,
  })

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

      <section className="px-8 md:px-12 lg:px-16 xl:px-28">
        <PropertyCarousel />
      </section>
      {projectsLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : projectsResponse ? (
        <section className="px-8 md:px-12 lg:px-16 xl:px-28">
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
        <section className="px-8 md:px-12 lg:px-16 xl:px-28">
          <PartnersCarousel partners={partners} />
        </section>
      ) : null}
    </main>
  )
}

export default HomePage
