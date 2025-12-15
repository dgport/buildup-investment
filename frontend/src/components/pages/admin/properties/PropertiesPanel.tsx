import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import {
  usePropertiesAdmin,
  useDeleteProperty,
} from '@/lib/hooks/useProperties'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/shared/pagination/Pagination'
import { AdminPropertyCard } from './AdminPropertyCard'
import type { Property } from '@/lib/types/properties'

import { EditProperty } from './EditProperty'
import { CreateProperty } from './CreateProperty'

const PROPERTIES_PER_PAGE = 10

export default function PropertiesPanel() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  )
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') || '1', 10)

  // Use usePropertiesAdmin to get ALL properties (public + private)
  const {
    data: propertiesResponse,
    isLoading,
    error,
  } = usePropertiesAdmin({
    page,
    limit: PROPERTIES_PER_PAGE,
  })
  const deleteProperty = useDeleteProperty()

  const properties = propertiesResponse?.data || []
  const meta = propertiesResponse?.meta

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEdit = (property: Property) => {
    setSelectedProperty(property)
    setView('edit')
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property?'))
      return

    try {
      await deleteProperty.mutateAsync(id)

      if (properties.length === 1 && page > 1) {
        handlePageChange(page - 1)
      }
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete property'
      )
    }
  }

  const handleBack = () => {
    setView('list')
    setSelectedProperty(null)
  }

  if (view === 'create')
    return <CreateProperty onBack={handleBack} onSuccess={handleBack} />

  if (view === 'edit' && selectedProperty)
    return (
      <EditProperty
        property={selectedProperty}
        onBack={handleBack}
        onSuccess={handleBack}
      />
    )

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-2 flex-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Properties
          </h1>
          <p className="text-muted-foreground">
            Manage your property listings (showing all properties including
            private)
          </p>
        </div>

        <Button onClick={() => setView('create')} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-destructive font-medium">
            Error loading properties. Please try again.
          </p>
        </div>
      ) : properties.length > 0 ? (
        <>
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="grid grid-cols-12 gap-4 items-center p-4 bg-muted/50 border-b border-border font-medium text-sm text-muted-foreground">
              <div className="col-span-2">Image</div>
              <div className="col-span-2">Address</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-1">External ID</div>
              <div className="col-span-1">Area</div>
              <div className="col-span-1">Price</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {properties.map(property => (
              <AdminPropertyCard
                key={property.id}
                property={property}
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
            No properties found
          </p>
        </div>
      )}
    </div>
  )
}
