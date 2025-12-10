import type React from 'react'
import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { useCreateMortgageRate } from '@/lib/hooks/useCalculator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'

interface CreateRateProps {
  onBack: () => void
  onSuccess: () => void
}

export function CreateRate({ onBack, onSuccess }: CreateRateProps) {
  const [formData, setFormData] = useState({
    yearFrom: 1,
    yearTo: 5,
    interestRate: 5.0,
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createRate = useCreateMortgageRate()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.yearFrom < 1) {
      newErrors.yearFrom = 'Year from must be at least 1'
    }
    if (formData.yearTo < formData.yearFrom) {
      newErrors.yearTo = 'Year to must be greater than or equal to year from'
    }
    if (formData.interestRate <= 0) {
      newErrors.interestRate = 'Interest rate must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      await createRate.mutateAsync(formData)
      onSuccess()
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create rate' })
    }
  }

  return (
    <div className="bg-background rounded-lg border border-border shadow-sm p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Create Mortgage Rate
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add a new interest rate for mortgage calculations
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
              Year From <span className="text-red-500">*</span>
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
              className={`bg-background border ${errors.yearFrom ? 'border-red-500' : 'border-border'}`}
            />
            {errors.yearFrom && (
              <p className="text-red-500 text-sm font-medium">
                {errors.yearFrom}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="yearTo"
              className="text-sm font-medium text-foreground"
            >
              Year To <span className="text-red-500">*</span>
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
              className={`bg-background border ${errors.yearTo ? 'border-red-500' : 'border-border'}`}
            />
            {errors.yearTo && (
              <p className="text-red-500 text-sm font-medium">
                {errors.yearTo}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="interestRate"
            className="text-sm font-medium text-foreground"
          >
            Interest Rate (%) <span className="text-red-500">*</span>
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
            placeholder="e.g., 5.5"
            className={`bg-background border ${errors.interestRate ? 'border-red-500' : 'border-border'}`}
          />
          {errors.interestRate && (
            <p className="text-red-500 text-sm font-medium">
              {errors.interestRate}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="description"
            className="text-sm font-medium text-foreground"
          >
            Description (Optional)
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="e.g., Standard rate for 1-5 year loans"
            className="bg-background border border-border"
            rows={3}
          />
        </div>

        {errors.submit && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {errors.submit}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={createRate.isPending}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {createRate.isPending ? 'Creating...' : 'Create Rate'}
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
