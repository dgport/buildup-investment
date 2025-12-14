import type React from 'react'
import { useState } from 'react'
import { X, Upload, Save, Trash2 } from 'lucide-react'
import { useCreateProperty } from '@/lib/hooks/useProperties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  PropertyType,
  DealType,
  PropertyStatus,
  PropertyCondition,
  HeatingType,
  ParkingType,
  HotWaterType,
  Occupancy,
  type CreatePropertyDto,
} from '@/lib/types/properties'

interface CreatePropertyProps {
  onBack: () => void
  onSuccess: () => void
}

export function CreateProperty({ onBack, onSuccess }: CreatePropertyProps) {
  const [formData, setFormData] = useState<CreatePropertyDto>({
    // Required fields
    propertyType: PropertyType.APARTMENT,
    address: '',
    title: '',

    // Optional fields
    description: '',
    status: undefined,
    dealType: undefined,
    hotSale: false,
    public: true,
    price: undefined,
    totalArea: undefined,
    rooms: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    floors: undefined,
    floorsTotal: undefined,
    ceilingHeight: undefined,
    condition: undefined,
    isNonStandard: false,
    occupancy: undefined,
    heating: undefined,
    hotWater: undefined,
    parking: undefined,
    hasConditioner: false,
    hasFurniture: false,
    hasBed: false,
    hasSofa: false,
    hasTable: false,
    hasChairs: false,
    hasStove: false,
    hasRefrigerator: false,
    hasOven: false,
    hasWashingMachine: false,
    hasKitchenAppliances: false,
    hasBalcony: false,
    balconyArea: undefined,
    hasNaturalGas: false,
    hasInternet: false,
    hasTV: false,
    hasSewerage: false,
    isFenced: false,
    hasYardLighting: false,
    hasGrill: false,
    hasAlarm: false,
    hasVentilation: false,
    hasWater: false,
    hasElectricity: false,
    hasGate: false,
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createProperty = useCreateProperty()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files])
      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.propertyType) {
      newErrors.propertyType = 'Property type is required'
    }
    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required'
    }
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      await createProperty.mutateAsync({
        data: formData,
        images: imageFiles.length > 0 ? imageFiles : undefined,
      })
      onSuccess()
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create property' })
    }
  }

  return (
    <div className="bg-background rounded-lg border border-border shadow-sm p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Create Property
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add a new property with details and images
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

      <div className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyType">
                Property Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.propertyType}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    propertyType: value as PropertyType,
                  })
                }
              >
                <SelectTrigger
                  className={errors.propertyType ? 'border-red-500' : ''}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PropertyType.APARTMENT}>
                    Apartment
                  </SelectItem>
                  <SelectItem value={PropertyType.VILLA}>Villa</SelectItem>
                  <SelectItem value={PropertyType.COMMERCIAL}>
                    Commercial
                  </SelectItem>
                  <SelectItem value={PropertyType.LAND}>Land</SelectItem>
                  <SelectItem value={PropertyType.HOTEL}>Hotel</SelectItem>
                </SelectContent>
              </Select>
              {errors.propertyType && (
                <p className="text-red-500 text-sm">{errors.propertyType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dealType">Deal Type</Label>
              <Select
                value={formData.dealType || ''}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    dealType: value ? (value as DealType) : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select deal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DealType.SALE}>Sale</SelectItem>
                  <SelectItem value={DealType.RENT}>Rent</SelectItem>
                  <SelectItem value={DealType.DAILY_RENT}>
                    Daily Rent
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Property Status</Label>
              <Select
                value={formData.status || ''}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    status: value ? (value as PropertyStatus) : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PropertyStatus.OLD_BUILDING}>
                    Old Building
                  </SelectItem>
                  <SelectItem value={PropertyStatus.NEW_BUILDING}>
                    New Building
                  </SelectItem>
                  <SelectItem value={PropertyStatus.UNDER_CONSTRUCTION}>
                    Under Construction
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    price: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="e.g., 150000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={e =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="e.g., 123 Main Street, Batumi"
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Title (English) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Luxury Apartment in Old Batumi"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (English)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Property description..."
              rows={4}
            />
          </div>

          {/* Hot Sale and Public toggles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hotSale"
                checked={formData.hotSale}
                onCheckedChange={checked =>
                  setFormData({ ...formData, hotSale: checked as boolean })
                }
              />
              <Label
                htmlFor="hotSale"
                className="text-sm font-medium cursor-pointer"
              >
                🔥 Mark as Hot Sale
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="public"
                checked={formData.public}
                onCheckedChange={checked =>
                  setFormData({ ...formData, public: checked as boolean })
                }
              />
              <Label
                htmlFor="public"
                className="text-sm font-medium cursor-pointer"
              >
                👁️ Make Public
              </Label>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Property Details
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalArea">Total Area (m²)</Label>
              <Input
                id="totalArea"
                type="number"
                value={formData.totalArea || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    totalArea: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="120"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rooms">Rooms</Label>
              <Input
                id="rooms"
                type="number"
                value={formData.rooms || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    rooms: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    bedrooms: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    bathrooms: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floors">Floor</Label>
              <Input
                id="floors"
                type="number"
                value={formData.floors || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    floors: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floorsTotal">Total Floors</Label>
              <Input
                id="floorsTotal"
                type="number"
                value={formData.floorsTotal || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    floorsTotal: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ceilingHeight">Ceiling Height (m)</Label>
              <Input
                id="ceilingHeight"
                type="number"
                step="0.1"
                value={formData.ceilingHeight || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    ceilingHeight: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="3.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="balconyArea">Balcony Area (m²)</Label>
              <Input
                id="balconyArea"
                type="number"
                step="0.1"
                value={formData.balconyArea || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    balconyArea: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="10.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Condition</Label>
              <Select
                value={formData.condition || ''}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    condition: value ? (value as PropertyCondition) : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PropertyCondition.NEWLY_RENOVATED}>
                    Newly Renovated
                  </SelectItem>
                  <SelectItem value={PropertyCondition.OLD_RENOVATED}>
                    Old Renovated
                  </SelectItem>
                  <SelectItem value={PropertyCondition.REPAIRING}>
                    Repairing
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Occupancy</Label>
              <Select
                value={formData.occupancy || ''}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    occupancy: value ? (value as Occupancy) : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select occupancy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Occupancy.ONE}>1 Person</SelectItem>
                  <SelectItem value={Occupancy.TWO}>2 People</SelectItem>
                  <SelectItem value={Occupancy.THREE}>3 People</SelectItem>
                  <SelectItem value={Occupancy.FOUR}>4 People</SelectItem>
                  <SelectItem value={Occupancy.FIVE}>5 People</SelectItem>
                  <SelectItem value={Occupancy.SIX}>6 People</SelectItem>
                  <SelectItem value={Occupancy.TEN_PLUS}>10+ People</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Utilities */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Utilities</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Heating</Label>
              <Select
                value={formData.heating || ''}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    heating: value ? (value as HeatingType) : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select heating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={HeatingType.CENTRAL_HEATING}>
                    Central Heating
                  </SelectItem>
                  <SelectItem value={HeatingType.INDIVIDUAL}>
                    Individual
                  </SelectItem>
                  <SelectItem value={HeatingType.GAS}>Gas</SelectItem>
                  <SelectItem value={HeatingType.ELECTRIC}>Electric</SelectItem>
                  <SelectItem value={HeatingType.NONE}>None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hot Water</Label>
              <Select
                value={formData.hotWater || ''}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    hotWater: value ? (value as HotWaterType) : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hot water" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={HotWaterType.CENTRAL_HEATING}>
                    Central Heating
                  </SelectItem>
                  <SelectItem value={HotWaterType.BOILER}>Boiler</SelectItem>
                  <SelectItem value={HotWaterType.SOLAR}>Solar</SelectItem>
                  <SelectItem value={HotWaterType.NONE}>None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Parking</Label>
              <Select
                value={formData.parking || ''}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    parking: value ? (value as ParkingType) : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parking" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ParkingType.PARKING_SPACE}>
                    Parking Space
                  </SelectItem>
                  <SelectItem value={ParkingType.GARAGE}>Garage</SelectItem>
                  <SelectItem value={ParkingType.OPEN_LOT}>Open Lot</SelectItem>
                  <SelectItem value={ParkingType.NONE}>None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Amenities</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'hasConditioner', label: 'Air Conditioner' },
              { key: 'hasFurniture', label: 'Furniture' },
              { key: 'hasBed', label: 'Bed' },
              { key: 'hasSofa', label: 'Sofa' },
              { key: 'hasTable', label: 'Table' },
              { key: 'hasChairs', label: 'Chairs' },
              { key: 'hasStove', label: 'Stove' },
              { key: 'hasRefrigerator', label: 'Refrigerator' },
              { key: 'hasOven', label: 'Oven' },
              { key: 'hasWashingMachine', label: 'Washing Machine' },
              { key: 'hasKitchenAppliances', label: 'Kitchen Appliances' },
              { key: 'hasBalcony', label: 'Balcony' },
              { key: 'hasNaturalGas', label: 'Natural Gas' },
              { key: 'hasInternet', label: 'Internet' },
              { key: 'hasTV', label: 'TV' },
              { key: 'hasSewerage', label: 'Sewerage' },
              { key: 'isFenced', label: 'Fenced' },
              { key: 'hasYardLighting', label: 'Yard Lighting' },
              { key: 'hasGrill', label: 'Grill' },
              { key: 'hasAlarm', label: 'Alarm' },
              { key: 'hasVentilation', label: 'Ventilation' },
              { key: 'hasWater', label: 'Water' },
              { key: 'hasElectricity', label: 'Electricity' },
              { key: 'hasGate', label: 'Gate' },
              { key: 'isNonStandard', label: 'Non-Standard Layout' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={formData[key as keyof typeof formData] as boolean}
                  onCheckedChange={checked =>
                    setFormData({ ...formData, [key]: checked })
                  }
                />
                <Label
                  htmlFor={key}
                  className="text-sm font-normal cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Property Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Property Images
          </h3>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-foreground/40 transition-colors relative bg-muted/30">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG up to 5MB (multiple files allowed)
            </p>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {errors.submit && (
          <Alert variant="destructive">
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={createProperty.isPending}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {createProperty.isPending ? 'Creating...' : 'Create Property'}
          </Button>
          <Button variant="outline" onClick={onBack} className="px-6">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
