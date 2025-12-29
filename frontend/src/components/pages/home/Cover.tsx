import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { getImageUrl } from '@/lib/utils/image-utils'
import { useSlides } from '@/lib/hooks/useSlides'
import { useTranslation } from 'react-i18next'

export default function Cover() {
  const { t } = useTranslation()
  const { data: slidesResponse, isError } = useSlides()
  const slides = slidesResponse?.data || []

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (slides.length <= 1) return

    const timer = setInterval(() => {
      handleNext()
    }, 5000)

    return () => clearInterval(timer)
  }, [currentSlide, slides.length])

  const handleNext = () => {
    if (isTransitioning || slides.length === 0) return
    setIsTransitioning(true)
    setCurrentSlide(prev => (prev + 1) % slides.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const handlePrev = () => {
    if (isTransitioning || slides.length === 0) return
    setIsTransitioning(true)
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return
    setIsTransitioning(true)
    setCurrentSlide(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  if (isError || slides.length === 0) {
    return (
      <div className="w-full">
        <div className="relative w-full h-[calc(100vh-80px)]">
          <div className="absolute w-full h-full bg-gradient-to-br from-blue-500 to-purple-600">
            <div className="absolute w-full inset-0 bg-gradient-to-b from-black/20 to-black/40"></div>
          </div>
          <div className="relative z-10 container mx-auto w-full h-full flex flex-col justify-center items-center text-center px-4">
            <h1
              className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight"
              style={{
                textShadow:
                  '0 8px 24px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4)',
              }}
            >
              {t('home.findYourDreamProperty')}
            </h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden">
        <div className="absolute w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute w-full h-full bg-cover bg-center transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${getImageUrl(slide.image)})`,
              }}
            >
              <div className="absolute w-full inset-0 bg-gradient-to-b from-black/20 to-black/40"></div>
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              disabled={isTransitioning}
              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed z-20"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-white group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed z-20"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-white group-hover:scale-110 transition-transform" />
            </button>
          </>
        )}

        {slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? 'w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 container mx-auto w-full h-full flex flex-col justify-center items-center text-center px-4 -mt-20 md:-mt-24">
          <div className="relative w-full max-w-5xl flex items-center justify-center">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 flex flex-col items-center justify-center gap-6 md:gap-8 transition-all duration-500 ${
                  index === currentSlide
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
              >
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white px-8"
                  style={{
                    textShadow:
                      '0 8px 24px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4)',
                  }}
                >
                  {slide.title}
                </h1>
                {slide.link && (
                  <a
                    href={slide.link}
                    className="px-8 py-3 md:px-10 md:py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    style={{
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    {t('home.findMore')}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
