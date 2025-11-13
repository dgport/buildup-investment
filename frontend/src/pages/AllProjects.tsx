import { useTranslation } from 'react-i18next'
import { Building2 } from 'lucide-react'
import ProjectCard from '@/components/pages/projects/ProjectCard'
import { useProjects } from '@/lib/hooks/useProjects'

export default function AllProjects() {
  const { t, i18n } = useTranslation()
  const {
    data: allProjects = [],
    isLoading,
    error,
  } = useProjects(i18n.language)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('projects.title')}
            </h1>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="ml-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('projects.title')}
            </h1>
          </div>
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">
              {t('projects.errorLoading', { defaultValue: t('common.error') })}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('projects.title')}
          </h1>
        </div>

        {allProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                currentLanguage={i18n.language}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {t('projects.noProjects')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
