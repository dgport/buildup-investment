import { useTranslation } from 'react-i18next'
import type { Apartment } from '@/lib/types/apartments'
import { getImageUrl } from '@/lib/utils/image-utils'

interface ApartmentCardProps {
  apartment: Apartment
}

const ApartmentCard = ({ apartment }: ApartmentCardProps) => {
  const { t } = useTranslation()

  const mainImage = getImageUrl(
    apartment.images?.[0] ?? null,
    import.meta.env.VITE_API_IMAGE_URL
  )

  return (
    <div className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-white">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={mainImage || '/placeholder.svg'}
          alt={`${apartment.room || '?'} ${t('apartments.room')}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => {
            e.currentTarget.src = '/placeholder.svg'
          }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            {apartment.room ?? '-'} {t('apartments.room')}
          </h3>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            {apartment.area ?? '-'} m²
          </span>
        </div>
      </div>
    </div>
  )
}

export default ApartmentCard
