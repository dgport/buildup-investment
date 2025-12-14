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
  City,
  type CreatePropertyDto,
} from '@/lib/types/properties'

interface CreatePropertyProps {
  onBack: () => void
  onSuccess: () => void
}

const INITIAL_FORM_STATE: CreatePropertyDto = {
  propertyType: PropertyType.APARTMENT,
  title: '',
  hotSale: false,
  public: true,
  isNonStandard: false,
}

const PROPERTY_TYPES = [
  { value: PropertyType.APARTMENT, label: 'Apartment' },
  { value: PropertyType.VILLA, label: 'Villa' },
  { value: PropertyType.COMMERCIAL, label: 'Commercial' },
  { value: PropertyType.LAND, label: 'Land' },
  { value: PropertyType.HOTEL, label: 'Hotel' },
]

const CITIES = [
  { value: City.BATUMI, label: 'Batumi' },
  { value: City.TBILISI, label: 'Tbilisi' },
]

const DEAL_TYPES = [
  { value: DealType.SALE, label: 'Sale' },
  { value: DealType.RENT, label: 'Rent' },
  { value: DealType.DAILY_RENT, label: 'Daily Rent' },
]

const PROPERTY_STATUSES = [
  { value: PropertyStatus.OLD_BUILDING, label: 'Old Building' },
  { value: PropertyStatus.NEW_BUILDING, label: 'New Building' },
  { value: PropertyStatus.UNDER_CONSTRUCTION, label: 'Under Construction' },
]

const PROPERTY_CONDITIONS = [
  { value: PropertyCondition.NEWLY_RENOVATED, label: 'Newly Renovated' },
  { value: PropertyCondition.OLD_RENOVATED, label: 'Old Renovated' },
  { value: PropertyCondition.REPAIRING, label: 'Repairing' },
]

const HEATING_TYPES = [
  { value: HeatingType.CENTRAL_HEATING, label: 'Central Heating' },
  { value: HeatingType.INDIVIDUAL, label: 'Individual' },
  { value: HeatingType.GAS, label: 'Gas' },
  { value: HeatingType.ELECTRIC, label: 'Electric' },
  { value: HeatingType.NONE, label: 'None' },
]

const HOT_WATER_TYPES = [
  { value: HotWaterType.CENTRAL_HEATING, label: 'Central Heating' },
  { value: HotWaterType.BOILER, label: 'Boiler' },
  { value: HotWaterType.SOLAR, label: 'Solar' },
  { value: HotWaterType.NONE, label: 'None' },
]

const PARKING_TYPES = [
  { value: ParkingType.PARKING_SPACE, label: 'Parking Space' },
  { value: ParkingType.GARAGE, label: 'Garage' },
  { value: ParkingType.OPEN_LOT, label: 'Open Lot' },
  { value: ParkingType.NONE, label: 'None' },
]

const OCCUPANCY_OPTIONS = [
  { value: Occupancy.ONE, label: '1 Person' },
  { value: Occupancy.TWO, label: '2 People' },
  { value: Occupancy.THREE, label: '3 People' },
  { value: Occupancy.FOUR, label: '4 People' },
  { value: Occupancy.FIVE, label: '5 People' },
  { value: Occupancy.SIX, label: '6 People' },
  { value: Occupancy.TEN_PLUS, label: '10+ People' },
]

const AMENITIES = [
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
]

export function CreateProperty({ onBack, onSuccess }: CreatePropertyProps) {
  const [formData, setFormData] =
    useState<CreatePropertyDto>(INITIAL_FORM_STATE)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createProperty = useCreateProperty()

  const updateField = <K extends keyof CreatePropertyDto>(
    field: K,
    value: CreatePropertyDto[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setImageFiles(prev => [...prev, ...files])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.propertyType)
      newErrors.propertyType = 'Property type is required'
    if (!formData.title?.trim()) newErrors.title = 'Title is required'
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
        <Section title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Property Type"
              required
              value={formData.propertyType}
              onValueChange={value =>
                updateField('propertyType', value as PropertyType)
              }
              options={PROPERTY_TYPES}
              error={errors.propertyType}
            />

            <SelectField
              label="City"
              value={formData.city || ''}
              onValueChange={value =>
                updateField('city', value ? (value as City) : undefined)
              }
              options={CITIES}
              placeholder="Select city"
            />

            <SelectField
              label="Deal Type"
              value={formData.dealType || ''}
              onValueChange={value =>
                updateField('dealType', value ? (value as DealType) : undefined)
              }
              options={DEAL_TYPES}
              placeholder="Select deal type"
            />

            <SelectField
              label="Property Status"
              value={formData.status || ''}
              onValueChange={value =>
                updateField(
                  'status',
                  value ? (value as PropertyStatus) : undefined
                )
              }
              options={PROPERTY_STATUSES}
              placeholder="Select status"
            />

            <InputField
              label="Price ($)"
              type="number"
              value={formData.price || ''}
              onChange={e =>
                updateField(
                  'price',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="e.g., 150000"
            />
          </div>

          <InputField
            label="Address"
            value={formData.address || ''}
            onChange={e => updateField('address', e.target.value || undefined)}
            placeholder="e.g., 123 Main Street, Batumi"
            error={errors.address}
          />

          <InputField
            label="Location"
            value={formData.location || ''}
            onChange={e => updateField('location', e.target.value || undefined)}
            placeholder="e.g., 41.6168° N, 41.6367° E"
          />

          <InputField
            label="Title (English)"
            required
            value={formData.title}
            onChange={e => updateField('title', e.target.value)}
            placeholder="e.g., Luxury Apartment in Old Batumi"
            error={errors.title}
          />

          <TextareaField
            label="Description (English)"
            value={formData.description || ''}
            onChange={e =>
              updateField('description', e.target.value || undefined)
            }
            placeholder="Property description..."
            rows={4}
          />

          <div className="grid grid-cols-2 gap-4">
            <CheckboxField
              id="hotSale"
              label="🔥 Mark as Hot Sale"
              checked={formData.hotSale || false}
              onCheckedChange={checked =>
                updateField('hotSale', checked as boolean)
              }
            />
            <CheckboxField
              id="public"
              label="👁️ Make Public"
              checked={formData.public ?? true}
              onCheckedChange={checked =>
                updateField('public', checked as boolean)
              }
            />
          </div>
        </Section>

        {/* Property Details */}
        <Section title="Property Details">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InputField
              label="Total Area (m²)"
              type="number"
              value={formData.totalArea || ''}
              onChange={e =>
                updateField(
                  'totalArea',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="120"
            />
            <InputField
              label="Rooms"
              type="number"
              value={formData.rooms || ''}
              onChange={e =>
                updateField(
                  'rooms',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="3"
            />
            <InputField
              label="Bedrooms"
              type="number"
              value={formData.bedrooms || ''}
              onChange={e =>
                updateField(
                  'bedrooms',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="2"
            />
            <InputField
              label="Bathrooms"
              type="number"
              value={formData.bathrooms || ''}
              onChange={e =>
                updateField(
                  'bathrooms',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="2"
            />
            <InputField
              label="Floor"
              type="number"
              value={formData.floors || ''}
              onChange={e =>
                updateField(
                  'floors',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="5"
            />
            <InputField
              label="Total Floors"
              type="number"
              value={formData.floorsTotal || ''}
              onChange={e =>
                updateField(
                  'floorsTotal',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="10"
            />
            <InputField
              label="Ceiling Height (m)"
              type="number"
              step="0.1"
              value={formData.ceilingHeight || ''}
              onChange={e =>
                updateField(
                  'ceilingHeight',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="3.0"
            />
            <InputField
              label="Balcony Area (m²)"
              type="number"
              step="0.1"
              value={formData.balconyArea || ''}
              onChange={e =>
                updateField(
                  'balconyArea',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="10.5"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Condition"
              value={formData.condition || ''}
              onValueChange={value =>
                updateField(
                  'condition',
                  value ? (value as PropertyCondition) : undefined
                )
              }
              options={PROPERTY_CONDITIONS}
              placeholder="Select condition"
            />
            <SelectField
              label="Occupancy"
              value={formData.occupancy || ''}
              onValueChange={value =>
                updateField(
                  'occupancy',
                  value ? (value as Occupancy) : undefined
                )
              }
              options={OCCUPANCY_OPTIONS}
              placeholder="Select occupancy"
            />
          </div>
        </Section>

        {/* Utilities */}
        <Section title="Utilities">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="Heating"
              value={formData.heating || ''}
              onValueChange={value =>
                updateField(
                  'heating',
                  value ? (value as HeatingType) : undefined
                )
              }
              options={HEATING_TYPES}
              placeholder="Select heating"
            />
            <SelectField
              label="Hot Water"
              value={formData.hotWater || ''}
              onValueChange={value =>
                updateField(
                  'hotWater',
                  value ? (value as HotWaterType) : undefined
                )
              }
              options={HOT_WATER_TYPES}
              placeholder="Select hot water"
            />
            <SelectField
              label="Parking"
              value={formData.parking || ''}
              onValueChange={value =>
                updateField(
                  'parking',
                  value ? (value as ParkingType) : undefined
                )
              }
              options={PARKING_TYPES}
              placeholder="Select parking"
            />
          </div>
        </Section>

        {/* Amenities */}
        <Section title="Amenities">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AMENITIES.map(({ key, label }) => (
              <CheckboxField
                key={key}
                id={key}
                label={label}
                checked={
                  (formData[key as keyof typeof formData] as boolean) || false
                }
                onCheckedChange={checked =>
                  updateField(key as keyof CreatePropertyDto, checked as any)
                }
              />
            ))}
          </div>
        </Section>

        {/* Property Images */}
        <Section title="Property Images">
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
        </Section>

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

// Reusable Components
function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  )
}

function InputField({
  label,
  required,
  error,
  ...props
}: {
  label: string
  required?: boolean
  error?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input {...props} className={error ? 'border-red-500' : ''} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

function TextareaField({
  label,
  required,
  error,
  ...props
}: {
  label: string
  required?: boolean
  error?: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Textarea {...props} className={error ? 'border-red-500' : ''} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

function SelectField({
  label,
  required,
  error,
  options,
  placeholder,
  value,
  onValueChange,
}: {
  label: string
  required?: boolean
  error?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

function CheckboxField({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id} className="text-sm font-normal cursor-pointer">
        {label}
      </Label>
    </div>
  )
}
