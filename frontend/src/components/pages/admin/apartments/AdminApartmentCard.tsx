import { Edit, Trash2, MapPin, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Apartment } from '@/lib/types/apartments'

interface ApartmentCardProps {
  apartment: Apartment
  onEdit: (apartment: Apartment) => void
  onDelete: (id: number) => void
}

export function AdminApartmentCard({
  apartment,
  onEdit,
  onDelete,
}: ApartmentCardProps) {
  // Handle image
  const firstImage =
    apartment.images && apartment.images.length > 0 ? apartment.images[0] : null
  const imageUrl = firstImage
    ? `${import.meta.env.VITE_API_IMAGE_URL}/${firstImage}`
    : null

  return (
    <div className="grid grid-cols-12 gap-4 items-center p-4 border-b border-border hover:bg-muted/30 transition-colors last:border-0">
      {/* Column 1: Image */}
      <div className="col-span-1">
        <div className="h-12 w-16 bg-muted rounded overflow-hidden border border-border relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Apt ${apartment.id}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground/50">
              <Building2 className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Column 2: ID & Project Name (3 cols) */}
      <div className="col-span-3">
        <div className="font-medium text-foreground truncate">
          {apartment.project?.projectName || (
            <span className="text-muted-foreground italic">No Project</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          ID: <span className="font-mono">{apartment.id}</span>
        </div>
      </div>

      {/* Column 3: Location (3 cols) */}
      <div className="col-span-3 flex items-center text-sm text-muted-foreground">
        {apartment.project?.projectLocation ? (
          <>
            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">
              {apartment.project.projectLocation}
            </span>
          </>
        ) : (
          <span>-</span>
        )}
      </div>

      {/* Column 4: Rooms (2 cols) */}
      <div className="col-span-2 text-sm font-medium">
        {apartment.room} Room{apartment.room > 1 ? 's' : ''}
      </div>

      {/* Column 5: Area (2 cols) */}
      <div className="col-span-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          {apartment.area} m²
        </span>
      </div>

      {/* Column 6: Actions (1 col) */}
      <div className="col-span-1 flex justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(apartment)}
          className="h-8 w-8 text-muted-foreground hover:text-blue-600"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(apartment.id)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
