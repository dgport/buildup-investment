import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

export const ProjectImageCarousel = ({
  gallery = [],
  image,
  projectName,
}: {
  gallery?: string[]
  image: string | null
  projectName: string
}) => {
  const [current, setCurrent] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const allImages = image ? [image, ...gallery] : gallery
  const hasImages = allImages.length > 0

  // Prepare slides for lightbox
  const slides = allImages.map(img => ({
    src: `${import.meta.env.VITE_API_IMAGE_URL}/${img}`,
    alt: projectName,
  }))

  const goToPrevious = () => {
    setCurrent(prev => (prev - 1 + allImages.length) % allImages.length)
  }

  const goToNext = () => {
    setCurrent(prev => (prev + 1) % allImages.length)
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  if (!hasImages) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="h-80 bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">No images available</p>
        </div>
      </div>
    )
  }

  if (allImages.length === 1) {
    return (
      <>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div
            className="relative h-80 lg:h-[500px] bg-gray-900 cursor-zoom-in"
            onClick={() => openLightbox(0)}
          >
            <img
              src={`${import.meta.env.VITE_API_IMAGE_URL}/${allImages[0]}`}
              alt={projectName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
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

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
        <div
          className="relative h-full bg-gray-900 group"
          style={{ minHeight: '500px' }}
        >
          {allImages.map((img, index) => (
            <img
              key={index}
              src={`${import.meta.env.VITE_API_IMAGE_URL}/${img}`}
              alt={`${projectName} - Image ${index + 1}`}
              onClick={() => openLightbox(current)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 cursor-zoom-in ${
                index === current ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`h-2 rounded-full transition-all ${
                  index === current
                    ? 'bg-white w-8'
                    : 'bg-white/50 w-2 hover:bg-white/75'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
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
