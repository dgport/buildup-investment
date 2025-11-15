// PartnerCard.tsx
import type { Partner } from '@/lib/types/partners'
import { getImageUrl } from '@/lib/utils/image-utils'
import { useState } from 'react'

// Fixed: Changed prop name from 'partners' to 'partner' and type to Partner (singular)
const PartnerCard = ({ partner }: { partner: Partner }) => {
  const [imageError, setImageError] = useState(false)

  // Fixed: Use 'partner' instead of 'partners'
  const displayName = partner.translation?.companyName || partner.companyName
  const imageUrl = getImageUrl(partner.image)

  return (
    <div className="flex flex-col items-center group cursor-pointer">
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4">
        <div
          className="w-full h-full rounded-full overflow-hidden bg-gray-100 transition-all duration-300
                     border-2 border-blue-500 shadow-[0px_5px_30px_#3B82F6]
                     group-hover:shadow-[0px_8px_40px_#2563EB]"
        >
          {!imageError ? (
            <img
              src={imageUrl}
              alt={displayName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 text-center group-hover:text-blue-900 transition-colors">
        {displayName}
      </h3>
    </div>
  )
}

export default PartnerCard
