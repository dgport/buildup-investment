import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useProjects, useDeleteProject } from '@/lib/hooks/useProjects'
import { Button } from '@/components/ui/button'

import { EditProject } from './EditProject'
import { AdminProjectCard } from './AdminProjectCard'
import type { Project } from '@/lib/types/projects'

import { Pagination } from '@/components/shared/pagination/Pagination'
import { CreateProject } from './CreateProject'

const PROJECTS_PER_PAGE = 5

export default function ProjectsPanel() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page') || 1)

  const {
    data: projectsResponse,
    isLoading,
    error,
  } = useProjects({
    lang: 'en',
    page,
    limit: PROJECTS_PER_PAGE,
  })
  const deleteProject = useDeleteProject()

  const projects = projectsResponse?.data || []
  const meta = projectsResponse?.meta

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEdit = (project: Project) => {
    setSelectedProject(project)
    setView('edit')
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return

    try {
      await deleteProject.mutateAsync(id)

      if (projects.length === 1 && page > 1) {
        handlePageChange(page - 1)
      }
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete project'
      )
    }
  }

  const handleBack = () => {
    setView('list')
    setSelectedProject(null)
  }

  if (view === 'create') {
    return <CreateProject onBack={handleBack} onSuccess={handleBack} />
  }

  if (view === 'edit' && selectedProject) {
    return (
      <EditProject
        project={selectedProject}
        onBack={handleBack}
        onSuccess={handleBack}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-2 flex-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Construction Projects
          </h1>
        </div>

        <Button onClick={() => setView('create')} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-destructive font-medium">
            Error loading projects. Please try again.
          </p>
        </div>
      ) : projects.length > 0 ? (
        <>
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="grid grid-cols-12 gap-4 items-center p-4 bg-muted/50 border-b border-border font-medium text-sm text-muted-foreground">
              <div className="col-span-1">Image</div>
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-2">Partner</div>
              <div className="col-span-2">Price From</div>
              <div className="col-span-1">Hot Sale</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {projects.map(project => (
              <AdminProjectCard
                key={project.id}
                project={project}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              hasNextPage={meta.hasNextPage}
              hasPreviousPage={meta.hasPreviousPage}
            />
          )}
        </>
      ) : (
        <div className="col-span-full rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground font-medium">No projects found</p>
        </div>
      )}
    </div>
  )
}
