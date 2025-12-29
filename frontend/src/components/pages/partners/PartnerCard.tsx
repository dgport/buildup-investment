import type { Partner } from '@/lib/types/partners'
import { useState } from 'react'

const PartnerCard = ({ partner }: { partner: Partner }) => {
  const [imageError, setImageError] = useState(false)

  const displayName = partner.translation?.companyName || partner.companyName

  return (
    <div className="flex flex-col items-center group cursor-pointer p-4">
      <div className="relative w-32 h-32 sm:w-44 sm:h-44 mb-5">
        <div className="absolute inset-0 rounded-2xl bg-primary/10 scale-105 opacity-0 group-hover:opacity-100 transition-all duration-500" />

        <div
          className="relative w-full h-full rounded-2xl overflow-hidden bg-secondary transition-all duration-500
                     border border-border
                     group-hover:border-primary/30 group-hover:shadow-lg"
        >
          {!imageError ? (
            <img
              src={partner.image || '/placeholder.svg'}
              alt={displayName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <svg
                className="w-12 h-12 text-muted-foreground/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-foreground text-center group-hover:text-primary transition-colors duration-300">
        {displayName}
      </h3>
      <span className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        View Profile →
      </span>
    </div>
  )
}

export default PartnerCard
