import { Edit, Trash2, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MortgageRate } from '@/lib/types/calculator'

interface AdminRateCardProps {
  rate: MortgageRate
  onEdit: (rate: MortgageRate) => void
  onDelete: (id: number) => void
}

export function AdminRateCard({ rate, onEdit, onDelete }: AdminRateCardProps) {
  return (
    <div className="grid grid-cols-12 gap-4 items-center p-4 border-b border-border hover:bg-muted/30 transition">
      <div className="col-span-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-foreground">
            {rate.yearFrom} - {rate.yearTo} years
          </span>
        </div>
      </div>

      <div className="col-span-3">
        <span className="text-lg font-bold text-blue-600">
          {rate.interestRate}%
        </span>
      </div>

      <div className="col-span-4">
        <p className="text-sm text-muted-foreground">
          {rate.description || 'No description'}
        </p>
      </div>

      <div className="col-span-2 flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(rate)}
          className="h-8 w-8 p-0"
        >
          <Edit className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(rate.id)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
