import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/shared/pagination/Pagination'
import type { Slide } from '@/lib/types/slides'
import { useDeleteSlide, useSlidesAdmin } from '@/lib/hooks/useSlides'
import { CreateSlide } from './CreateSlide'
import { EditSlide } from './EditSlide'
import { AdminSlideCard } from './AdminSlideCard'

const SLIDES_PER_PAGE = 5

export default function SlidesPanel() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') || '1', 10)

  const {
    data: slidesResponse,
    isLoading,
    error,
  } = useSlidesAdmin({
    page,
    limit: SLIDES_PER_PAGE,
  })
  const deleteSlide = useDeleteSlide()

  const slides = slidesResponse?.data || []
  const meta = slidesResponse?.meta

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEdit = (slide: Slide) => {
    setSelectedSlide(slide)
    setView('edit')
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return

    try {
      await deleteSlide.mutateAsync(id)

      if (slides.length === 1 && page > 1) {
        handlePageChange(page - 1)
      }
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete slide'
      )
    }
  }

  const handleBack = () => {
    setView('list')
    setSelectedSlide(null)
  }

  if (view === 'create') {
    return <CreateSlide onBack={handleBack} onSuccess={handleBack} />
  }

  if (view === 'edit' && selectedSlide) {
    return (
      <EditSlide
        slide={selectedSlide}
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
            Homepage Slides
          </h1>
          <p className="text-muted-foreground">
            Manage slideshow images displayed on the homepage
          </p>
        </div>

        <Button onClick={() => setView('create')} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Slide
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-destructive font-medium">
            Error loading slides. Please try again.
          </p>
        </div>
      ) : slides.length > 0 ? (
        <>
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="grid grid-cols-12 gap-4 items-center p-4 bg-muted/50 border-b border-border font-medium text-sm text-muted-foreground">
              <div className="col-span-2">Image</div>
              <div className="col-span-3">Title</div>
              <div className="col-span-2">Link</div>
              <div className="col-span-2">Order</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {slides.map(slide => (
              <AdminSlideCard
                key={slide.id}
                slide={slide}
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
          <p className="text-muted-foreground font-medium">No slides found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Create your first slide to get started
          </p>
        </div>
      )}
    </div>
  )
}
