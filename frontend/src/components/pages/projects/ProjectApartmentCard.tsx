import type React from 'react'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import type { Apartment } from '@/lib/types/apartments'
import { useTranslation } from 'react-i18next'

export const ProjectApartmentCard = ({
  apartment,
}: {
  apartment: Apartment
}) => {
  const { t } = useTranslation()
  const [current, setCurrent] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const hasImages = apartment.images.length > 0
  const hasMultipleImages = apartment.images.length > 1

  const slides = apartment.images.map(img => ({
    src: `${import.meta.env.VITE_API_IMAGE_URL}/${img}`,
    alt: t('apartmentCard.roomApartment', { count: apartment.room }),
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
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 border-b-[3px] border-b-blue-500 overflow-hidden">
        <div className="relative h-64 bg-gray-100">
          {hasImages ? (
            <div className="relative h-full bg-gray-900">
              {apartment.images.map((img, index) => (
                <img
                  key={index}
                  src={`${import.meta.env.VITE_API_IMAGE_URL}/${img}`}
                  alt={`${t('apartmentCard.roomApartment', { count: apartment.room })} - Image ${index + 1}`}
                  onClick={() => openLightbox(current)}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 cursor-zoom-in shadow-lg ${
                    index === current ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}

              {hasMultipleImages && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
                    aria-label={t('apartmentCard.previousImage')}
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-800" />
                  </button>

                  <button
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
                    aria-label={t('apartmentCard.nextImage')}
                  >
                    <ChevronRight className="w-4 h-4 text-gray-800" />
                  </button>

                  {/* Thumbnail Strip at Bottom */}
                  {apartment.images.length <= 5 ? (
                    <div className="absolute bottom-2 left-2 right-2 z-10">
                      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-1.5">
                        <div className="flex gap-1.5 justify-center">
                          {apartment.images.map((img, index) => (
                            <button
                              key={index}
                              onClick={e => {
                                e.stopPropagation()
                                setCurrent(index)
                              }}
                              className={`relative flex-shrink-0 rounded overflow-hidden transition-all border-2 ${
                                index === current
                                  ? 'border-white scale-105 shadow-lg'
                                  : 'border-white/40 opacity-70 hover:opacity-100 hover:border-white/70'
                              }`}
                              style={{ width: '48px', height: '36px' }}
                              aria-label={t('apartmentCard.goToImage', {
                                number: index + 1,
                              })}
                            >
                              <img
                                src={`${import.meta.env.VITE_API_IMAGE_URL}/${img}`}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Dots for many images */
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/20 backdrop-blur-sm rounded-full px-2.5 py-1.5">
                      {apartment.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={e => {
                            e.stopPropagation()
                            setCurrent(index)
                          }}
                          className={`h-2 rounded-full transition-all ${
                            index === current
                              ? 'bg-white w-6'
                              : 'bg-white/50 w-2 hover:bg-white/75'
                          }`}
                          aria-label={t('apartmentCard.goToImage', {
                            number: index + 1,
                          })}
                        />
                      ))}
                    </div>
                  )}

                  {/* Image counter */}
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full z-10">
                    {current + 1} / {apartment.images.length}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-400">{t('apartmentCard.noImages')}</p>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col h-32 border-t-2 border-gray-100">
          <div className="mb-2 pb-2 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              {t('apartmentCard.roomApartment', { count: apartment.room })}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {t('apartmentCard.area')}:
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {apartment.area} m²
              </span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-xs text-gray-600 line-clamp-3">
              {apartment.description || t('apartmentCard.noDescription')}
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
