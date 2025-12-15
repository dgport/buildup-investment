import { Edit, Trash2, ImageIcon, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Property } from '@/lib/types/properties'

interface PropertyCardProps {
  property: Property
  onEdit: (property: Property) => void
  onDelete: (id: string) => void
}

export function AdminPropertyCard({
  property,
  onEdit,
  onDelete,
}: PropertyCardProps) {
  const firstImage = property.galleryImages?.[0]?.imageUrl
  const imageUrl = firstImage
    ? `${import.meta.env.VITE_API_IMAGE_URL}/${firstImage}`
    : null

  const formatPropertyType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="grid grid-cols-12 gap-4 items-center p-4 border-b border-border hover:bg-muted/30 transition">
      {/* Image */}
      <div className="col-span-2">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={property.propertyType}
            className="h-16 w-full object-cover rounded-md bg-muted"
          />
        ) : (
          <div className="h-16 w-full flex items-center justify-center rounded-md bg-muted">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Address */}
      <div className="col-span-2">
        <p className="font-medium text-foreground line-clamp-2">
          {property.translation?.title || property.address}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{property.address}</p>
      </div>

      {/* Type */}
      <div className="col-span-2">
        <Badge variant="secondary" className="font-normal">
          {formatPropertyType(property.propertyType)}
        </Badge>
      </div>

      {/* External ID */}
      <div className="col-span-1">
        <p className="text-sm text-foreground">
          {property.externalId || 'N/A'}
        </p>
      </div>

      {/* Area */}
      <div className="col-span-1">
        <p className="text-sm text-foreground">
          {property.totalArea ? `${property.totalArea} m²` : 'N/A'}
        </p>
      </div>

      {/* Price */}
      <div className="col-span-1">
        <p className="text-sm font-medium text-foreground">
          {formatPrice(property.price)}
        </p>
      </div>

      {/* Status (Public/Private) */}
      <div className="col-span-1">
        {property.public ? (
          <Badge variant="default" className="text-xs gap-1">
            <Eye className="w-3 h-3" />
            Public
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs gap-1">
            <EyeOff className="w-3 h-3" />
            Private
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-2 flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(property)}
          className="h-8 w-8 p-0"
        >
          <Edit className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(property.id)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
