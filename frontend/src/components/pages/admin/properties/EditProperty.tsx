import { useState, useEffect } from 'react'
import { X, Save, Home, ImageIcon } from 'lucide-react'
import { useUpdateProperty } from '@/lib/hooks/useProperties'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Property, CreatePropertyDto } from '@/lib/types/properties'
import {
  PropertyType,
  PropertyStatus,
  DealType,
  PropertyCondition,
  HeatingType,
  ParkingType,
  HotWaterType,
  Occupancy,
  City,
} from '@/lib/types/properties'
import { PropertyImagesManager } from './PropertyImagesManager'
import { PropertyTranslationsManager } from './PropertyTranslationManager'

interface EditPropertyProps {
  property: Property
  onBack: () => void
  onSuccess: () => void
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

const propertyToFormData = (
  property: Property
): Partial<CreatePropertyDto> => ({
  propertyType: property.propertyType,
  city: property.city || undefined,
  address: property.address || undefined,
  location: property.location || undefined,
  status: property.status || undefined,
  dealType: property.dealType || undefined,
  hotSale: property.hotSale,
  public: property.public,
  price: property.price || undefined,
  totalArea: property.totalArea || undefined,
  rooms: property.rooms || undefined,
  bedrooms: property.bedrooms || undefined,
  bathrooms: property.bathrooms || undefined,
  floors: property.floors || undefined,
  floorsTotal: property.floorsTotal || undefined,
  ceilingHeight: property.ceilingHeight || undefined,
  condition: property.condition || undefined,
  isNonStandard: property.isNonStandard,
  occupancy: property.occupancy || undefined,
  heating: property.heating || undefined,
  hotWater: property.hotWater || undefined,
  parking: property.parking || undefined,
  balconyArea: property.balconyArea || undefined,
  hasConditioner: property.hasConditioner,
  hasFurniture: property.hasFurniture,
  hasBed: property.hasBed,
  hasSofa: property.hasSofa,
  hasTable: property.hasTable,
  hasChairs: property.hasChairs,
  hasStove: property.hasStove,
  hasRefrigerator: property.hasRefrigerator,
  hasOven: property.hasOven,
  hasWashingMachine: property.hasWashingMachine,
  hasKitchenAppliances: property.hasKitchenAppliances,
  hasBalcony: property.hasBalcony,
  hasNaturalGas: property.hasNaturalGas,
  hasInternet: property.hasInternet,
  hasTV: property.hasTV,
  hasSewerage: property.hasSewerage,
  isFenced: property.isFenced,
  hasYardLighting: property.hasYardLighting,
  hasGrill: property.hasGrill,
  hasAlarm: property.hasAlarm,
  hasVentilation: property.hasVentilation,
  hasWater: property.hasWater,
  hasElectricity: property.hasElectricity,
  hasGate: property.hasGate,
})

export function EditProperty({
  property,
  onBack,
  onSuccess,
}: EditPropertyProps) {
  const [activeSection, setActiveSection] = useState<
    'details' | 'images' | 'translations'
  >('details')
  const [formData, setFormData] = useState<Partial<CreatePropertyDto>>(
    propertyToFormData(property)
  )
  const [hasChanges, setHasChanges] = useState(false)

  const updateProperty = useUpdateProperty()

  useEffect(() => {
    setFormData(propertyToFormData(property))
    setHasChanges(false)
  }, [property])

  const updateField = <K extends keyof CreatePropertyDto>(
    field: K,
    value: CreatePropertyDto[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSubmit = async () => {
    try {
      await updateProperty.mutateAsync({
        id: property.id,
        data: formData,
      })
      setHasChanges(false)
      onSuccess()
    } catch (error) {
      console.error('Error updating property:', error)
    }
  }

  return (
    <div className="bg-background rounded-lg border border-border shadow-sm p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Edit Property
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {property.translation?.title ||
              property.address ||
              'Untitled Property'}
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

      <TabNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="space-y-6">
        {activeSection === 'details' && (
          <DetailsSection
            formData={formData}
            updateField={updateField}
            hasChanges={hasChanges}
            isPending={updateProperty.isPending}
            onSubmit={handleSubmit}
            onCancel={onBack}
          />
        )}

        {activeSection === 'images' && (
          <PropertyImagesManager propertyId={property.id} />
        )}

        {activeSection === 'translations' && (
          <PropertyTranslationsManager propertyId={property.id} />
        )}
      </div>
    </div>
  )
}

// Tab Navigation Component
function TabNavigation({
  activeSection,
  onSectionChange,
}: {
  activeSection: string
  onSectionChange: (section: 'details' | 'images' | 'translations') => void
}) {
  const tabs = [
    { id: 'details', label: 'Details', icon: Home },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'translations', label: '🌐 Translations', icon: null },
  ]

  return (
    <div className="flex gap-2 mb-8 border-b border-border pb-0 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onSectionChange(tab.id as any)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeSection === tab.id
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.icon && <tab.icon className="w-4 h-4 inline mr-2" />}
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// Details Section Component
function DetailsSection({
  formData,
  updateField,
  hasChanges,
  isPending,
  onSubmit,
  onCancel,
}: {
  formData: Partial<CreatePropertyDto>
  updateField: <K extends keyof CreatePropertyDto>(
    field: K,
    value: CreatePropertyDto[K]
  ) => void
  hasChanges: boolean
  isPending: boolean
  onSubmit: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Property Type"
            value={formData.propertyType || ''}
            onValueChange={value =>
              updateField('propertyType', value as PropertyType)
            }
            options={PROPERTY_TYPES}
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
          />
        </div>

        <InputField
          label="Address"
          value={formData.address || ''}
          onChange={e => updateField('address', e.target.value || undefined)}
          placeholder="e.g., 123 Main Street, Batumi"
        />

        <InputField
          label="Location"
          value={formData.location || ''}
          onChange={e => updateField('location', e.target.value || undefined)}
          placeholder="e.g., 41.6168° N, 41.6367° E"
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
              updateField('occupancy', value ? (value as Occupancy) : undefined)
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
              updateField('heating', value ? (value as HeatingType) : undefined)
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
              updateField('parking', value ? (value as ParkingType) : undefined)
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

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={onSubmit}
          disabled={isPending || !hasChanges}
          className="flex-1"
        >
          <Save className="w-4 h-4 mr-2" />
          {isPending ? 'Updating...' : 'Update Property'}
        </Button>
        <Button variant="outline" onClick={onCancel} className="px-6">
          Cancel
        </Button>
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
  ...props
}: {
  label: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>{label}</Label>
      <Input {...props} />
    </div>
  )
}

function SelectField({
  label,
  options,
  placeholder,
  value,
  onValueChange,
}: {
  label: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
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
