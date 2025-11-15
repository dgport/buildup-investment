import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { usePartners, useDeletePartner } from '@/lib/hooks/usePartners'
import { Button } from '@/components/ui/button'
import type { Partner } from '@/lib/types/partners'
import { CreatePartner } from './CreatePartner'
import { EditPartner } from './EditPartner'
import { AdminPartnerCard } from './AdminPartnerCard'
import Pagination from '@/components/shared/pagination/Pagination'

const PARTNERS_PER_PAGE = 5

export default function PartnersPanel() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') || '1', 10)

  const {
    data: partnersResponse,
    isLoading,
    error,
  } = usePartners({
    page,
    limit: PARTNERS_PER_PAGE,
  })
  const deletePartner = useDeletePartner()

  const partners = partnersResponse?.data || []
  const meta = partnersResponse?.meta

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner)
    setView('edit')
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this partner?')) return

    try {
      await deletePartner.mutateAsync(id)
      // If last item on page deleted, go back a page
      if (partners.length === 1 && page > 1) {
        handlePageChange(page - 1)
      }
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete partner'
      )
    }
  }

  const handleBack = () => {
    setView('list')
    setSelectedPartner(null)
  }

  // ---------------- CREATE ----------------
  if (view === 'create') {
    return <CreatePartner onBack={handleBack} onSuccess={handleBack} />
  }

  // ---------------- EDIT ----------------
  if (view === 'edit' && selectedPartner) {
    return (
      <EditPartner
        partner={selectedPartner}
        onBack={handleBack}
        onSuccess={handleBack}
      />
    )
  }

  // ---------------- LIST ----------------
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-2 flex-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Construction Partners
          </h1>
        </div>

        <Button onClick={() => setView('create')} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Partner
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-destructive font-medium">
            Error loading partners. Please try again.
          </p>
        </div>
      ) : partners.length > 0 ? (
        <>
          <div className="flex flex-col gap-4">
            {partners.map(partner => (
              <AdminPartnerCard
                key={partner.id}
                partner={partner}
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
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <div className="col-span-full rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground font-medium">No partners found</p>
        </div>
      )}
    </div>
  )
}
