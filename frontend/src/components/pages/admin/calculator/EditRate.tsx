import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { useUpdateMortgageRate } from '@/lib/hooks/useCalculator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MortgageRate } from '@/lib/types/calculator'

interface EditRateProps {
  rate: MortgageRate
  onBack: () => void
  onSuccess: () => void
}

export function EditRate({ rate, onBack, onSuccess }: EditRateProps) {
  const [formData, setFormData] = useState({
    yearFrom: rate.yearFrom,
    yearTo: rate.yearTo,
    interestRate: rate.interestRate,
  })

  const updateRate = useUpdateMortgageRate()

  const handleSubmit = async () => {
    try {
      await updateRate.mutateAsync({ id: rate.id, data: formData })
      onSuccess()
    } catch (error) {
      console.error('Error updating rate:', error)
    }
  }

  return (
    <div className="bg-background rounded-lg border border-border shadow-sm p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Edit Mortgage Rate
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {rate.yearFrom}-{rate.yearTo} years at {rate.interestRate}%
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-10 w-10"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="yearFrom"
              className="text-sm font-medium text-foreground"
            >
              Year From
            </Label>
            <Input
              id="yearFrom"
              type="number"
              min="1"
              value={formData.yearFrom}
              onChange={e =>
                setFormData({
                  ...formData,
                  yearFrom: parseInt(e.target.value) || 1,
                })
              }
              className="bg-background border border-border"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="yearTo"
              className="text-sm font-medium text-foreground"
            >
              Year To
            </Label>
            <Input
              id="yearTo"
              type="number"
              min="1"
              value={formData.yearTo}
              onChange={e =>
                setFormData({
                  ...formData,
                  yearTo: parseInt(e.target.value) || 1,
                })
              }
              className="bg-background border border-border"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="interestRate"
            className="text-sm font-medium text-foreground"
          >
            Interest Rate (%)
          </Label>
          <Input
            id="interestRate"
            type="number"
            step="0.01"
            min="0"
            value={formData.interestRate}
            onChange={e =>
              setFormData({
                ...formData,
                interestRate: parseFloat(e.target.value) || 0,
              })
            }
            className="bg-background border border-border"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={updateRate.isPending}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateRate.isPending ? 'Updating...' : 'Update Rate'}
          </Button>
          <Button
            variant="outline"
            onClick={onBack}
            className="px-6 bg-transparent"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
