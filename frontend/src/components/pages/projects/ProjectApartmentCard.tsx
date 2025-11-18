import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import type { Apartment } from '@/lib/types/apartments'

export const ProjectApartmentCard = ({
  apartment,
}: {
  apartment: Apartment
}) => {
  const [current, setCurrent] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const hasImages = apartment.images.length > 0

  const slides = apartment.images.map(img => ({
    src: `${import.meta.env.VITE_API_IMAGE_URL}/${img}`,
    alt: `${apartment.room}-room apartment`,
  }))

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrent(
      prev => (prev - 1 + apartment.images.length) % apartment.images.length
    )
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrent(prev => (prev + 1) % apartment.images.length)
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
        <div className="relative h-64 bg-gray-100">
          {hasImages ? (
            <>
              {apartment.images.length === 1 ? (
                <div
                  className="relative h-full bg-gray-900 cursor-zoom-in"
                  onClick={() => openLightbox(0)}
                >
                  <img
                    src={`${import.meta.env.VITE_API_IMAGE_URL}/${apartment.images[0]}`}
                    alt={`${apartment.room}-room apartment`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative h-full bg-gray-900 group">
                  {apartment.images.map((img, index) => (
                    <img
                      key={index}
                      src={`${import.meta.env.VITE_API_IMAGE_URL}/${img}`}
                      alt={`${apartment.room}-room apartment - Image ${index + 1}`}
                      onClick={() => openLightbox(current)}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 cursor-zoom-in ${
                        index === current ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}

                  <button
                    onClick={goToPrevious}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-800" />
                  </button>

                  <button
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-800" />
                  </button>

                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {apartment.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={e => {
                          e.stopPropagation()
                          setCurrent(index)
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                          index === current
                            ? 'bg-white w-6'
                            : 'bg-white/50 w-1.5 hover:bg-white/75'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-400">No images available</p>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col h-32 border-t-2 border-gray-100">
          <div className="mb-2 pb-2 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              {apartment.room}-room apartment
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Area:</span>
              <span className="text-sm font-semibold text-gray-900">
                {apartment.area} m²
              </span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-xs text-gray-600 line-clamp-3">
              {apartment.description ||
                'No description available for this apartment.'}
            </p>
          </div>
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={slides}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 3,
          scrollToZoom: true,
        }}
      />
    </>
  )
}
