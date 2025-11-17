import { useState } from 'react'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { getImageUrl } from '@/lib/utils/image-utils'
import type { Project } from '@/lib/types/projects'
type TranslatableFields = 'projectName' | 'projectLocation'

const ProjectCard = ({ project }: { project: Project }) => {
  const [imageError, setImageError] = useState(false)

  const getTranslatedValue = (field: TranslatableFields) => {
    return project.translation?.[field] ?? project[field] ?? ''
  }
  const projectImage = getImageUrl(project.image ?? undefined)
  const projectName = getTranslatedValue('projectName')
  const projectLocation = getTranslatedValue('projectLocation')
  const partnerName =
    project?.partner?.translation?.companyName || project?.partner?.companyName

  return (
    <div className="bg-white rounded-xl border border-gray-300 transition-all duration-300 h-full p-1 cursor-pointer hover:shadow-lg">
      <div className="relative h-72 overflow-hidden rounded-lg">
        {!imageError ? (
          <img
            src={projectImage}
            alt={projectName}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
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

        {project.hotSale && (
          <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
            <div className="absolute top-4 -right-8 w-32 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold py-1.5 text-center shadow-lg transform rotate-45">
              HOT SALE
            </div>
          </div>
        )}
      </div>

      <div className="p-2 sm:p-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 hover:text-blue-900 transition-colors">
              {projectName}
            </h3>
            {projectLocation && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500 truncate">
                  {projectLocation}
                </p>
              </div>
            )}
            {partnerName && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                {partnerName}
              </p>
            )}
          </div>
          <div className="bg-gray-200 rounded-full p-2 hover:bg-blue-900 transition-colors flex-shrink-0 group">
            <ArrowUpRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard
