import {
  Phone,
  MessageCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react'
import { useApartments } from '@/lib/hooks/useApartments'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useProject } from '@/lib/hooks/useProjects'
import { ProjectApartmentCard } from '@/components/pages/projects/ProjectApartmentCard'
import { useTranslation } from 'react-i18next'
import { useState, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { getImageUrl } from '@/lib/utils/image-utils'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import MapboxMap from '@/components/shared/map/MapboxMap'
import { useDocumentMeta } from '@/lib/hooks/useDocumentMeta'

const getQuarter = (dateString: string | null | undefined): string | null => {
  if (!dateString) return null
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return null
  const month = date.getMonth()
  const quarter = Math.floor(month / 3) + 1
  const year = date.getFullYear()
  return `Q${quarter} ${year}`
}

const PHONE_NUMBER = '+995 595 80 47 95'
const PHONE_NUMBER_CLEAN = '995595804795'

export default function ProjectPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const projectId = Number(id)

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [copiedPhone, setCopiedPhone] = useState(false)

  const {
    data: project,
    isLoading: projectLoading,
    error,
  } = useProject(projectId, i18n.language)

  const { data: apartmentsResponse, isLoading: apartmentsLoading } =
    useApartments({
      projectId,
      lang: i18n.language,
    })

  const apartments = apartmentsResponse?.data || []

  const projectName = project?.translation?.projectName || project?.projectName
  const priceText = project?.priceFrom
    ? `Starting from $${project.priceFrom.toLocaleString()}`
    : ''
  const deliveryText = project?.deliveryDate
    ? `Delivery ${getQuarter(project.deliveryDate)}`
    : ''

  const documentTitle = projectName
    ? `${projectName} | United Construction`
    : t('meta.project.title', 'Project Details | United Construction')

  const documentDescription = project?.translation?.description
    ? project.translation.description.substring(0, 160)
    : t(
        'meta.project.description',
        `Explore ${projectName || 'this premium real estate project'} in ${project?.regionName || 'Batumi'}. ${priceText}. ${deliveryText}. View available apartments and project details.`
      ).substring(0, 160)

  const documentKeywords = t(
    'meta.project.keywords',
    `${projectName || ''}, real estate ${project?.regionName || ''}, apartments ${project?.regionName || ''}, new construction, ${project?.regionName || ''} property`
  )

  const documentOgImage = project?.image
    ? getImageUrl(project.image)
    : project?.gallery?.[0]
      ? getImageUrl(project.gallery[0])
      : undefined

  useDocumentMeta({
    title: documentTitle,
    description: documentDescription,
    keywords: documentKeywords,
    ogImage: documentOgImage,
    lang: i18n.language,
  })

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  })

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  )
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  )

  const handleThumbClick = useCallback(
    (index: number) => {
      setSelectedIndex(index)
      emblaApi && emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  useEffect(() => {
    if (!emblaApi || !thumbsApi) return

    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap()
      setSelectedIndex(index)
      thumbsApi.scrollTo(index)
    }

    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, thumbsApi])

  const images = project?.gallery?.length
    ? project.gallery.map((img: string) => getImageUrl(img))
    : project?.image
      ? [getImageUrl(project.image)]
      : []

  const coordinates = project?.location
    ? (() => {
        try {
          const [lat, lng] = project.location.split(',').map(Number)
          if (isNaN(lat) || isNaN(lng)) return null
          return { lat, lng }
        } catch (error) {
          return null
        }
      })()
    : null

  const handleImageClick = () => {
    setLightboxIndex(selectedIndex)
    setLightboxOpen(true)
  }

  const handleCopyPhone = async () => {
    await navigator.clipboard.writeText(PHONE_NUMBER)
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 2000)
  }

  const handlePhoneCall = () => {
    window.location.href = `tel:${PHONE_NUMBER_CLEAN}`
  }

  const handleWhatsApp = () => {
    const projectTitle =
      project?.translation?.projectName || project?.projectName || 'a project'
    const message = encodeURIComponent(
      `Hello! I'm interested in ${projectTitle}`
    )
    window.open(`https://wa.me/${PHONE_NUMBER_CLEAN}?text=${message}`, '_blank')
  }

  const isLoading = projectLoading || apartmentsLoading

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-900 animate-spin" />
          <p className="text-gray-600">{t('projectPage.loadingProject')}</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t('projectPage.projectNotFound')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('projectPage.projectNotFoundDescription')}
          </p>
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate('/projects')}
          >
            {t('projectPage.backToProjects')}
          </Button>
        </div>
      </div>
    )
  }

  const lightboxSlides = images.map((src: string) => ({ src }))

  const hasLocation = !!coordinates

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2  h-[350px] lg:h-[500px]">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm h-full relative">
              <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full">
                  {images.length > 0 ? (
                    images.map((img: string, index: number) => (
                      <div
                        className="relative flex-[0_0_100%] h-full"
                        key={index}
                      >
                        <div
                          className="relative flex justify-center items-center h-full cursor-zoom-in bg-black/5"
                          onClick={handleImageClick}
                        >
                          <img
                            src={img || '/placeholder.svg'}
                            alt={project.projectName || 'Project'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-400">No images available</p>
                    </div>
                  )}
                </div>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={scrollPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg z-20 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg z-20 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {images.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 z-20 px-4">
                  <div className="bg-black/10 rounded-xl p-3">
                    <div className="overflow-hidden" ref={thumbsRef}>
                      <div className="flex gap-2">
                        {images.map((img: string, index: number) => (
                          <div
                            key={index}
                            onClick={() => handleThumbClick(index)}
                            className={`flex-[0_0_auto] cursor-pointer rounded-lg overflow-hidden transition-all border-4
                    ${
                      index === selectedIndex
                        ? 'border-blue-600 scale-105 shadow-xl'
                        : 'border-white/50 opacity-70 hover:opacity-100 hover:border-blue-500/50'
                    }`}
                            style={{ width: '64px', height: '48px' }}
                          >
                            <img
                              src={img || '/placeholder.svg'}
                              alt={`Thumbnail ${index}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-5 h-auto lg:h-[500px] flex flex-col justify-between">
              <div className="space-y-2 sm:space-y-3">
                <div className="mb-4 sm:mb-5 pb-4 border-b-2 border-gray-300">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                    {project.translation?.projectName ||
                      project.projectName ||
                      t('projectPage.noName')}
                  </h1>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    {t('projectPage.region')}
                  </span>
                  <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                    {project.regionName || t('projectPage.notAvailable')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    {t('projectPage.startingPrice')}
                  </span>
                  <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                    {project.priceFrom
                      ? `$${project.priceFrom.toLocaleString()}`
                      : t('projectPage.notAvailable')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    {t('projectPage.delivery')}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-blue-900">
                    {project.deliveryDate
                      ? getQuarter(project.deliveryDate)
                      : t('projectPage.notAvailable')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    {t('projectPage.floors')}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-gray-900">
                    {project.numFloors || t('projectPage.notAvailable')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    {t('projectPage.totalUnits')}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-gray-900">
                    {project.numApartments || t('projectPage.notAvailable')}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-3 sm:pt-4">
                <div className="relative">
                  <Button
                    size="lg"
                    onClick={handlePhoneCall}
                    className="w-full bg-blue-900 hover:bg-blue-800 h-10 sm:h-11 lg:h-12 text-sm sm:text-base flex items-center justify-center pr-12"
                  >
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                    {PHONE_NUMBER}
                  </Button>
                  <button
                    onClick={handleCopyPhone}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-blue-800 rounded transition-colors"
                    title="Copy phone number"
                  >
                    {copiedPhone ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleWhatsApp}
                  className="w-full border-green-600 text-green-600 hover:bg-green-50 h-10 sm:h-11 lg:h-12 text-sm sm:text-base bg-transparent flex items-center justify-center"
                >
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  {t('projectPage.contactWhatsApp')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 lg:mt-12">
          {apartments.length > 0 ? (
            <>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t('projectPage.availableApartments')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {apartments.map((apartment: any) => (
                  <ProjectApartmentCard
                    key={apartment.id}
                    apartment={apartment}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 sm:p-12 text-center">
              <p className="text-sm sm:text-base text-gray-600">
                {t('projectPage.noApartments')}
              </p>
            </div>
          )}
        </div>

        {hasLocation && (
          <div className="mt-8 lg:mt-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 overflow-hidden">
              <div className="h-[300px] sm:h-[350px] rounded-xl overflow-hidden">
                <MapboxMap
                  latitude={coordinates.lat}
                  longitude={coordinates.lng}
                  title={
                    project.translation?.projectName || project.projectName
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
      />
    </div>
  )
}
