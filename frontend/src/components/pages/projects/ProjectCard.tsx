import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getImageUrl } from '@/lib/utils/image-utils'
import type { Project } from '@/lib/types/projects'

type TranslatableFields = 'projectName' | 'projectLocation'

const ProjectCard = ({ project }: { project: Project }) => {
  const [imageError, setImageError] = useState(false)
  const { t } = useTranslation()

  const getTranslatedValue = (field: TranslatableFields) =>
    project.translation?.[field] ?? project[field] ?? ''

  const projectImage = getImageUrl(project.image ?? undefined)
  const projectName = getTranslatedValue('projectName')
  const projectLocation = getTranslatedValue('projectLocation')

  return (
    <div className="bg-white rounded-xl border border-gray-300 border-b-[3px] border-b-blue-500 transition-all duration-300 h-full p-1 cursor-pointer shadow-md hover:shadow-lg">
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
            <div className="absolute top-4 -right-8 w-32 bg-linear-to-r from-red-600 to-red-500 text-white text-xs font-bold py-1.5 text-center shadow-lg transform rotate-45">
              HOT SALE
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 hover:text-blue-900 transition-colors line-clamp-2">
            {projectName}
          </h3>

          <div className="flex items-center justify-between gap-2">
            {projectLocation && (
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <p className="text-sm text-gray-600 truncate">
                  {projectLocation}
                </p>
              </div>
            )}

            {project.priceFrom && (
              <span className="text-sm font-semibold text-blue-900 whitespace-nowrap">
                {t('home.fromPrice')}${project.priceFrom.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard
