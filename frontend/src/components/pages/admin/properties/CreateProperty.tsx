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
  PropertyStatus,
  PropertyCondition,
  HeatingType,
  ParkingType,
  HotWaterType,
  Occupancy,
} from '@/lib/types/properties'

interface CreatePropertyProps {
  onBack: () => void
  onSuccess: () => void
}

export function CreateProperty({ onBack, onSuccess }: CreatePropertyProps) {
  const [formData, setFormData] = useState({
    propertyType: PropertyType.APARTMENT,
    status: PropertyStatus.NEW_BUILDING,
    address: '',
    price: '',
    title: '',
    description: '',
    totalArea: '',
    rooms: '',
    bedrooms: '',
    bathrooms: '',
    floors: '',
    floorsTotal: '',
    ceilingHeight: '',
    condition: '' as PropertyCondition | '',
    isNonStandard: false,
    occupancy: '' as Occupancy | '',
    heating: '' as HeatingType | '',
    hotWater: '' as HotWaterType | '',
    parking: '' as ParkingType | '',
    // Amenities
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
    balconyArea: '',
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
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const data = new FormData()

    // Required fields
    data.append('propertyType', formData.propertyType)
    data.append('status', formData.status)
    data.append('address', formData.address)

    // Optional fields - only append if they have values
    if (formData.price) data.append('price', formData.price)
    if (formData.title) data.append('title', formData.title)
    if (formData.description) data.append('description', formData.description)
    if (formData.totalArea) data.append('totalArea', formData.totalArea)
    if (formData.rooms) data.append('rooms', formData.rooms)
    if (formData.bedrooms) data.append('bedrooms', formData.bedrooms)
    if (formData.bathrooms) data.append('bathrooms', formData.bathrooms)
    if (formData.floors) data.append('floors', formData.floors)
    if (formData.floorsTotal) data.append('floorsTotal', formData.floorsTotal)
    if (formData.ceilingHeight)
      data.append('ceilingHeight', formData.ceilingHeight)
    if (formData.condition) data.append('condition', formData.condition)
    if (formData.occupancy) data.append('occupancy', formData.occupancy)
    if (formData.heating) data.append('heating', formData.heating)
    if (formData.hotWater) data.append('hotWater', formData.hotWater)
    if (formData.parking) data.append('parking', formData.parking)
    if (formData.balconyArea) data.append('balconyArea', formData.balconyArea)

    // Boolean fields
    data.append('isNonStandard', formData.isNonStandard.toString())
    data.append('hasConditioner', formData.hasConditioner.toString())
    data.append('hasFurniture', formData.hasFurniture.toString())
    data.append('hasBed', formData.hasBed.toString())
    data.append('hasSofa', formData.hasSofa.toString())
    data.append('hasTable', formData.hasTable.toString())
    data.append('hasChairs', formData.hasChairs.toString())
    data.append('hasStove', formData.hasStove.toString())
    data.append('hasRefrigerator', formData.hasRefrigerator.toString())
    data.append('hasOven', formData.hasOven.toString())
    data.append('hasWashingMachine', formData.hasWashingMachine.toString())
    data.append(
      'hasKitchenAppliances',
      formData.hasKitchenAppliances.toString()
    )
    data.append('hasBalcony', formData.hasBalcony.toString())
    data.append('hasNaturalGas', formData.hasNaturalGas.toString())
    data.append('hasInternet', formData.hasInternet.toString())
    data.append('hasTV', formData.hasTV.toString())
    data.append('hasSewerage', formData.hasSewerage.toString())
    data.append('isFenced', formData.isFenced.toString())
    data.append('hasYardLighting', formData.hasYardLighting.toString())
    data.append('hasGrill', formData.hasGrill.toString())
    data.append('hasAlarm', formData.hasAlarm.toString())
    data.append('hasVentilation', formData.hasVentilation.toString())
    data.append('hasWater', formData.hasWater.toString())
    data.append('hasElectricity', formData.hasElectricity.toString())
    data.append('hasGate', formData.hasGate.toString())

    // Images
    imageFiles.forEach(file => {
      data.append('images', file)
    })

    try {
      await createProperty.mutateAsync(data)
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
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={value =>
                  setFormData({ ...formData, status: value as PropertyStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (English)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Luxury Apartment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={e =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="e.g., 150000"
              />
            </div>
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
                value={formData.totalArea}
                onChange={e =>
                  setFormData({ ...formData, totalArea: e.target.value })
                }
                placeholder="120"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rooms">Rooms</Label>
              <Input
                id="rooms"
                type="number"
                value={formData.rooms}
                onChange={e =>
                  setFormData({ ...formData, rooms: e.target.value })
                }
                placeholder="3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={e =>
                  setFormData({ ...formData, bedrooms: e.target.value })
                }
                placeholder="2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={e =>
                  setFormData({ ...formData, bathrooms: e.target.value })
                }
                placeholder="2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floors">Floor</Label>
              <Input
                id="floors"
                type="number"
                value={formData.floors}
                onChange={e =>
                  setFormData({ ...formData, floors: e.target.value })
                }
                placeholder="5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floorsTotal">Total Floors</Label>
              <Input
                id="floorsTotal"
                type="number"
                value={formData.floorsTotal}
                onChange={e =>
                  setFormData({ ...formData, floorsTotal: e.target.value })
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
                value={formData.ceilingHeight}
                onChange={e =>
                  setFormData({ ...formData, ceilingHeight: e.target.value })
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
                value={formData.balconyArea}
                onChange={e =>
                  setFormData({ ...formData, balconyArea: e.target.value })
                }
                placeholder="10.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    condition: value as PropertyCondition,
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
                value={formData.occupancy}
                onValueChange={value =>
                  setFormData({ ...formData, occupancy: value as Occupancy })
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
                value={formData.heating}
                onValueChange={value =>
                  setFormData({ ...formData, heating: value as HeatingType })
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
                value={formData.hotWater}
                onValueChange={value =>
                  setFormData({ ...formData, hotWater: value as HotWaterType })
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
                value={formData.parking}
                onValueChange={value =>
                  setFormData({ ...formData, parking: value as ParkingType })
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

        {/* Images */}
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
