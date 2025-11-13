import { Share2, Phone, Loader2 } from 'lucide-react'
import { useApartments } from '@/lib/hooks/useApartments'
import { useParams } from 'react-router-dom'
import type { Apartment } from '@/lib/types/apartments'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { useProject } from '@/lib/hooks/useProjects'

const API_URL = 'http://localhost:3000'

const ApartmentCard = ({ apartment }: { apartment: Apartment }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-64 bg-gray-100">
        {apartment.images.length > 0 ? (
          <Carousel className="w-full h-full">
            <CarouselContent>
              {apartment.images.map((image, index) => (
                <CarouselItem key={index}>
                  <img
                    src={`${API_URL}/${image}`}
                    alt={`${apartment.room} room apartment - Image ${index + 1}`}
                    className="w-full h-64 object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {apartment.images.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400">No images</p>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          {apartment.room}-room apartment
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Area:</span>
            <span className="font-medium text-gray-800">
              {apartment.area} m²
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Floor:</span>
            <span className="font-medium text-gray-800">
              {apartment.floor} of {apartment.totalFloors}
            </span>
          </div>
        </div>

        {apartment.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {apartment.description}
          </p>
        )}

        <Button variant="default" size="lg" className="w-full">
          View Details
        </Button>
      </div>
    </div>
  )
}

const ProjectImageCarousel = ({
  gallery = [],
  image,
  projectName,
}: {
  gallery?: string[]
  image: string | null
  projectName: string
}) => {
  const allImages = image ? [image, ...gallery] : gallery
  const hasImages = allImages.length > 0

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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
        <div className="relative h-80 lg:h-[500px] bg-gray-900">
          <img
            src={`${API_URL}/${allImages[0]}`}
            alt={projectName}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
      <Carousel className="w-full h-80 lg:h-[500px]">
        <CarouselContent>
          {allImages.map((img, index) => (
            <CarouselItem key={index}>
              <div className="relative h-80 lg:h-[500px] bg-gray-900">
                <img
                  src={`${API_URL}/${img}`}
                  alt={`${projectName} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 hidden md:flex" />
        <CarouselNext className="right-4 hidden md:flex" />
      </Carousel>
    </div>
  )
}

const formatDate = (dateString: string | null): string | null => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const WhatsAppIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function ProjectPage() {
  const params = useParams()
  const id = params?.id as string

  const {
    data: apartments,
    isLoading: apartmentsLoading,
    error: apartmentsError,
  } = useApartments(undefined, Number(id))

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useProject(Number(id))

  const isLoading = apartmentsLoading || projectLoading
  const error = projectError || apartmentsError

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-900 animate-spin" />
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Project not found
          </h2>
          <p className="text-gray-600 mb-4">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="default" size="lg">
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-8">
        <div className="flex flex-col lg:flex-row gap-8 mb-12 lg:items-stretch">
          <div className="lg:flex-[2]">
            <ProjectImageCarousel
              gallery={project.gallery}
              image={project.image}
              projectName={project.projectName}
            />
          </div>

          <div className="lg:flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {project.projectName}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {project.projectLocation}
                  </p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Share project">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {project.priceFrom && (
                  <div className="border rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Price from</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₾{project.priceFrom.toLocaleString()}
                    </p>
                  </div>
                )}

                {project.deliveryDate && (
                  <div className="border rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Delivery Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(project.deliveryDate)}
                    </p>
                  </div>
                )}

                {project.numFloors && (
                  <div className="border rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Floors</p>
                    <p className="text-sm font-medium text-gray-900">
                      {project.numFloors} floors
                    </p>
                  </div>
                )}

                {project.numApartments && (
                  <div className="border rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Total Units</p>
                    <p className="text-sm font-medium text-gray-900">
                      {project.numApartments} apartments
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 mt-auto">
                <Button size="lg" className="w-full">
                  <Phone className="w-5 h-5" />
                  Show number
                </Button>

                <Button size="lg" className="w-full">
                  <WhatsAppIcon />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>

        {apartments && apartments.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Available Apartments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apartments.map(apartment => (
                <ApartmentCard key={apartment.id} apartment={apartment} />
              ))}
            </div>
          </div>
        )}

        {apartments && apartments.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600">
              No apartments available for this project yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
