'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { X, Save, Home, ImageIcon, MapPin } from 'lucide-react'
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
import type { Property, UpdatePropertyDto } from '@/lib/types/properties'
import {
  PropertyType,
  DealType,
  HeatingType,
  ParkingType,
  HotWaterType,
  Occupancy,
  type Region,
  REGION_NAMES,
} from '@/lib/types/properties'
import { PropertyImagesManager } from './PropertyImagesManager'
import { PropertyTranslationsManager } from './PropertyTranslationManager'
import { ProjectLocationMapPicker } from '@/components/shared/map/MapPin'

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

const DEAL_TYPES = [
  { value: DealType.SALE, label: 'Sale' },
  { value: DealType.RENT, label: 'Rent' },
  { value: DealType.DAILY_RENT, label: 'Daily Rent' },
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

const propertyToFormData = (property: Property): UpdatePropertyDto => ({
  propertyType: property.propertyType,
  region: property.region || undefined,
  address: property.address || undefined,
  location: property.location || undefined,
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
  const [formData, setFormData] = useState<UpdatePropertyDto>(
    propertyToFormData(property)
  )
  const [hasChanges, setHasChanges] = useState(false)
  const [showMap, setShowMap] = useState(false)

  const updateProperty = useUpdateProperty()

  useEffect(() => {
    setFormData(propertyToFormData(property))
    setHasChanges(false)
  }, [property])

  const updateField = <K extends keyof UpdatePropertyDto>(
    field: K,
    value: UpdatePropertyDto[K]
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

  const getCoordinatesDisplay = () => {
    if (!formData.location) return null
    const [lat, lng] = formData.location.split(',').map(Number)
    if (isNaN(lat) || isNaN(lng)) return null
    return { lat, lng }
  }

  const handleLocationSelect = (location: {
    coordinates: [number, number]
    address: string
  }) => {
    const coordsString = `${location.coordinates[1]},${location.coordinates[0]}`
    updateField('location', coordsString)
    updateField('address', location.address)
    setShowMap(false)
  }

  const clearLocation = () => {
    updateField('location', undefined)
    updateField('address', undefined)
  }

  const coords = getCoordinatesDisplay()

  return (
    <>
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
              coords={coords}
              onShowMap={() => setShowMap(true)}
              onClearLocation={clearLocation}
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

      {showMap && (
        <ProjectLocationMapPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowMap(false)}
          initialLocation={coords ? { lng: coords.lng, lat: coords.lat } : null}
        />
      )}
    </>
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
    { id: 'translations', label: 'Translations', icon: null },
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

function DetailsSection({
  formData,
  updateField,
  hasChanges,
  isPending,
  onSubmit,
  onCancel,
  coords,
  onShowMap,
  onClearLocation,
}: {
  formData: UpdatePropertyDto
  updateField: <K extends keyof UpdatePropertyDto>(
    field: K,
    value: UpdatePropertyDto[K]
  ) => void
  hasChanges: boolean
  isPending: boolean
  onSubmit: () => void
  onCancel: () => void
  coords: { lat: number; lng: number } | null
  onShowMap: () => void
  onClearLocation: () => void
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
            label="Deal Type"
            value={formData.dealType || ''}
            onValueChange={value => updateField('dealType', value as DealType)}
            options={DEAL_TYPES}
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

        <div className="grid grid-cols-2 gap-4">
          <CheckboxField
            id="hotSale"
            label="Mark as Hot Sale"
            checked={formData.hotSale || false}
            onCheckedChange={checked =>
              updateField('hotSale', checked as boolean)
            }
          />
          <CheckboxField
            id="public"
            label="Make Public"
            checked={formData.public ?? true}
            onCheckedChange={checked =>
              updateField('public', checked as boolean)
            }
          />
        </div>
      </Section>

      {/* Location Details */}
      <div className="border border-border rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Location Details
        </h3>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Region</Label>
          <Select
            value={formData.region || ''}
            onValueChange={value => updateField('region', value as Region)}
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select a region" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(REGION_NAMES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Street Address & Coordinates
          </Label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={formData.address || ''}
              readOnly
              placeholder="Select location from map"
              className="bg-background border-border"
            />
            <Button
              type="button"
              variant="outline"
              onClick={onShowMap}
              className="shrink-0 bg-transparent"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Pick Location
            </Button>
          </div>
          {coords && (
            <div className="bg-muted/50 rounded-md p-3 border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Coordinates saved:
                  </p>
                  <p className="text-xs font-mono text-foreground">
                    Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClearLocation}
                  className="h-6 px-2 text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

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

        <SelectField
          label="Occupancy"
          value={formData.occupancy || ''}
          onValueChange={value => {
            if (
              value &&
              Object.values(Occupancy).includes(value as Occupancy)
            ) {
              updateField('occupancy', value as Occupancy)
            }
          }}
          options={OCCUPANCY_OPTIONS}
          placeholder="Select occupancy"
        />
      </Section>

      {/* Utilities */}
      <Section title="Utilities">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField
            label="Heating"
            value={formData.heating || ''}
            onValueChange={value => {
              if (
                value &&
                Object.values(HeatingType).includes(value as HeatingType)
              ) {
                updateField('heating', value as HeatingType)
              }
            }}
            options={HEATING_TYPES}
            placeholder="Select heating"
          />
          <SelectField
            label="Hot Water"
            value={formData.hotWater || ''}
            onValueChange={value => {
              if (
                value &&
                Object.values(HotWaterType).includes(value as HotWaterType)
              ) {
                updateField('hotWater', value as HotWaterType)
              }
            }}
            options={HOT_WATER_TYPES}
            placeholder="Select hot water"
          />
          <SelectField
            label="Parking"
            value={formData.parking || ''}
            onValueChange={value => {
              if (
                value &&
                Object.values(ParkingType).includes(value as ParkingType)
              ) {
                updateField('parking', value as ParkingType)
              }
            }}
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
                updateField(key as keyof UpdatePropertyDto, checked as any)
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
        <Button
          variant="outline"
          onClick={onCancel}
          className="px-6 bg-transparent"
        >
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
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || 'Select an option'} />
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
