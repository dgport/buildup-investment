import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MortgageRate } from '@/lib/types/calculator'
import {
  useDeleteMortgageRate,
  useMortgageRates,
} from '@/lib/hooks/useCalculator'

import { EditRate } from './EditRate'
import { CreateRate } from './CreateRate'
import { AdminRateCard } from './AdminRateCard'

export default function CalculatorPanel() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedRate, setSelectedRate] = useState<MortgageRate | null>(null)

  const { data: rates, isLoading, error } = useMortgageRates()
  const deleteRate = useDeleteMortgageRate()

  const handleEdit = (rate: MortgageRate) => {
    setSelectedRate(rate)
    setView('edit')
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this rate?')) return

    try {
      await deleteRate.mutateAsync(id)
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete rate'
      )
    }
  }

  const handleBack = () => {
    setView('list')
    setSelectedRate(null)
  }

  if (view === 'create') {
    return <CreateRate onBack={handleBack} onSuccess={handleBack} />
  }

  if (view === 'edit' && selectedRate) {
    return (
      <EditRate
        rate={selectedRate}
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
            Mortgage Calculator Rates
          </h1>
          <p className="text-muted-foreground">
            Manage interest rates for mortgage calculations
          </p>
        </div>

        <Button onClick={() => setView('create')} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Rate
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-destructive font-medium">
            Error loading rates. Please try again.
          </p>
        </div>
      ) : rates && rates.length > 0 ? (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <div className="grid grid-cols-12 gap-4 items-center p-4 bg-muted/50 border-b border-border font-medium text-sm text-muted-foreground">
            <div className="col-span-3">Year Range</div>
            <div className="col-span-3">Interest Rate</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {rates.map(rate => (
            <AdminRateCard
              key={rate.id}
              rate={rate}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="col-span-full rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground font-medium">No rates found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Create your first rate to get started
          </p>
        </div>
      )}
    </div>
  )
}
