import { useState } from 'react'
import { Plus, Filter } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useApartments, useDeleteApartment } from '@/lib/hooks/useApartments'
import { useProjects } from '@/lib/hooks/useProjects'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreateApartment } from './CreateApartment'
import { EditApartment } from './EditApartment'
import { AdminApartmentCard } from './AdminApartmentCard'
import type { Apartment } from '@/lib/types/apartments'
import { Pagination } from '@/components/shared/pagination/Pagination'

const APARTMENTS_PER_PAGE = 10

export default function ApartmentsPanel() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null
  )

  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [selectedProjectId, setSelectedProjectId] = useState<
    number | undefined
  >(undefined)

  const {
    data: apartmentsResponse,
    isLoading,
    error,
  } = useApartments({
    page,
    limit: APARTMENTS_PER_PAGE,
    projectId: selectedProjectId,
  })

  const { data: projectsResponse } = useProjects()
  const deleteApartment = useDeleteApartment()

  const apartments = apartmentsResponse?.data || []
  const meta = apartmentsResponse?.meta
  const projects = projectsResponse?.data || []

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFilterChange = (value: string) => {
    setSelectedProjectId(value === 'all' ? undefined : Number(value))
    handlePageChange(1)
  }

  const handleEdit = (apartment: Apartment) => {
    setSelectedApartment(apartment)
    setView('edit')
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this apartment?'))
      return

    try {
      await deleteApartment.mutateAsync(id)
      if (apartments.length === 1 && page > 1) {
        handlePageChange(page - 1)
      }
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete apartment'
      )
    }
  }

  const handleBack = () => {
    setView('list')
    setSelectedApartment(null)
  }

  if (view === 'create') {
    return <CreateApartment onBack={handleBack} onSuccess={handleBack} />
  }

  if (view === 'edit' && selectedApartment) {
    return (
      <EditApartment
        apartment={selectedApartment}
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
            Apartments
          </h1>
          <p className="text-muted-foreground">
            Manage individual apartment units and translations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-[220px]">
            <Select
              value={selectedProjectId?.toString() || 'all'}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.projectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => setView('create')}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Apartment
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-destructive font-medium">
            Error loading apartments. Please try again.
          </p>
        </div>
      ) : apartments.length > 0 ? (
        <>
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="grid grid-cols-12 gap-4 items-center p-4 bg-muted/50 border-b border-border font-medium text-sm text-muted-foreground">
              <div className="col-span-1">Image</div>
              <div className="col-span-3">Project & ID</div>
              <div className="col-span-3">Location</div>
              <div className="col-span-2">Rooms</div>
              <div className="col-span-2">Area</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {apartments.map(apartment => (
              <AdminApartmentCard
                key={apartment.id}
                apartment={apartment}
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
          <p className="text-muted-foreground font-medium">
            {selectedProjectId
              ? 'No apartments found for this project.'
              : 'No apartments found.'}
          </p>
        </div>
      )}
    </div>
  )
}
