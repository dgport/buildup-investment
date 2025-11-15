import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import PartnerCard from '@/components/pages/partners/PartnerCard'
import Pagination from '@/components/shared/pagination/Pagination'
import { usePartners } from '@/lib/hooks/usePartners'

export default function Partners() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') || '1', 10)

  const { data, isLoading, error } = usePartners({
    lang: i18n.language,
    page,
    limit: 9,
  })

  const partners = data?.data || []
  const meta = data?.meta

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 md:px-8 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl text-center sm:text-4xl font-bold text-gray-800 mb-8">
            {t('partners.title')}
          </h1>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 md:px-8 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl text-center sm:text-4xl font-bold text-gray-800 mb-8">
            {t('partners.title')}
          </h1>
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{t('partners.errorLoading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 md:px-8 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl text-center sm:text-4xl font-bold text-gray-800 mb-8">
          {t('partners.title')}
        </h1>

        {partners.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {partners.map(partner => (
                <Link key={partner.id} to={`/partners/${partner.id}`}>
                  <PartnerCard partner={partner} />
                </Link>
              ))}
            </div>

            {meta && meta.totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={meta.totalPages}
                hasNextPage={meta.hasNextPage}
                hasPreviousPage={meta.hasPreviousPage}
                onPageChange={handlePageChange}
                translations={{
                  previous: t('pagination.previous'),
                  next: t('pagination.next'),
                }}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('partners.noPartners')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
