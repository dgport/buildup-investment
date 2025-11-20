import { Phone, MessageCircle, Loader2 } from 'lucide-react'
import { useApartments } from '@/lib/hooks/useApartments'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useProject } from '@/lib/hooks/useProjects'
import { ProjectImageCarousel } from '@/components/pages/projects/ProjectImageCarousel'
import { ProjectApartmentCard } from '@/components/pages/projects/ProjectApartmentCard'

const getQuarter = (dateString: string | null | undefined): string | null => {
  if (!dateString) return null
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return null
  const month = date.getMonth()
  const quarter = Math.floor(month / 3) + 1
  const year = date.getFullYear()
  return `Q${quarter} ${year}`
}

export default function ProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const projectId = Number(id)

  // Fetch project details
  const {
    data: project,
    isLoading: projectLoading,
    error,
  } = useProject(projectId)

  // Fetch apartments for the project
  const { data: apartmentsResponse, isLoading: apartmentsLoading } =
    useApartments({
      projectId,
      lang: 'en', // or i18n.language if using translations
    })

  const apartments = apartmentsResponse?.data || []

  const isLoading = projectLoading || apartmentsLoading

  // Loading state
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

  // Error / not found state
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
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate('/projects')}
          >
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8">
        {/* Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          <div className="lg:col-span-2 h-[400px] lg:h-[500px]">
            <ProjectImageCarousel
              gallery={project.gallery || []}
              image={project.image || ''}
              projectName={project.projectName || ''}
            />
          </div>

          <div className="lg:col-span-1 h-[400px] lg:h-[500px]">
            <div className="bg-white rounded-xl shadow-sm p-5 h-full flex flex-col">
              {/* Project Header */}
              <div className="mb-4 pb-4 border-b">
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  {project.projectName || 'No name'}
                </h1>
                <p className="text-sm text-gray-600">
                  {project.projectLocation || 'No location'}
                </p>
              </div>

              {/* Project Info */}
              <div className="space-y-3 mb-4 flex-1">
                <div className="flex items-center justify-between py-2.5 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    Starting Price
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {project.priceFrom
                      ? `${project.priceFrom.toLocaleString()}`
                      : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    Delivery
                  </span>
                  <span className="text-base font-semibold text-blue-900">
                    {project.deliveryDate
                      ? getQuarter(project.deliveryDate)
                      : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    Floors
                  </span>
                  <span className="text-base font-semibold text-gray-900">
                    {project.numFloors || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm font-medium text-gray-600">
                    Total Units
                  </span>
                  <span className="text-base font-semibold text-gray-900">
                    {project.numApartments || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-3 mt-auto">
                <Button
                  size="lg"
                  className="w-full bg-blue-900 hover:bg-blue-800 h-12"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Show Phone Number
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50 h-12"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact via WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Apartments Section */}
        {apartments.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Available Apartments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apartments.map(apartment => (
                <ProjectApartmentCard
                  key={apartment.id}
                  apartment={apartment}
                />
              ))}
            </div>
          </div>
        ) : (
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
