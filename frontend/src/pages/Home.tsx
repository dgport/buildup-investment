import { useTranslation } from 'react-i18next'
import { usePartners } from '@/lib/hooks/usePartners'
import PropertyCarousel from '@/components/pages/home/PropertyCarousel'
import SuggestSection from '@/components/pages/home/SuggestionsSection'
import PartnersCarousel from '@/components/pages/home/PartnerCarousel'
import MortgageCalculator from '@/components/shared/calculator/MortgageCalculator'
import { useDocumentMeta } from '@/lib/hooks/useDocumentMeta'
import VideoCover from '@/components/pages/home/VideoCover'

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

  const partners = partnersResponse?.data || []

  return (
    <main className="min-h-screen w-full">
      <VideoCover />
      <PropertyCarousel />
      <SuggestSection />
      <MortgageCalculator />
      {partnersLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : partners.length > 0 ? (
        <section className="px-8 md:px-12 lg:px-16 xl:px-28 bg-[#FAFAF8] py-10">
          <PartnersCarousel partners={partners} />
        </section>
      ) : null}
    </main>
  )
}

export default HomePage
