import { useState, useEffect } from 'react' // 👈 Added useEffect
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
import type { Property } from '@/lib/types/properties'
import {
  PropertyCondition,
  HeatingType,
  ParkingType,
  HotWaterType,
  Occupancy,
} from '@/lib/types/properties'
import { PropertyImagesManager } from './PropertyImagesManager'
import { PropertyTranslationsManager } from './PropertyTranslationManager'

interface EditPropertyProps {
  property: Property
  onBack: () => void
  onSuccess: () => void
}

export function EditProperty({
  property,
  onBack,
  onSuccess,
}: EditPropertyProps) {
  const [activeSection, setActiveSection] = useState<
    'details' | 'images' | 'translations'
  >('details')

  // Helper to safely parse values to string (handling 0 properly)
  const safeString = (val: number | null | undefined) =>
    val === null || val === undefined ? '' : val.toString()

  const [formData, setFormData] = useState({
    address: property.address,
    price: safeString(property.price),
    totalArea: safeString(property.totalArea),
    rooms: safeString(property.rooms),
    bedrooms: safeString(property.bedrooms),
    bathrooms: safeString(property.bathrooms),
    floors: safeString(property.floors),
    floorsTotal: safeString(property.floorsTotal),
    ceilingHeight: safeString(property.ceilingHeight),
    condition: property.condition || '',
    isNonStandard: property.isNonStandard ?? false,
    occupancy: property.occupancy || '',
    heating: property.heating || '',
    hotWater: property.hotWater || '',
    parking: property.parking || '',
    balconyArea: safeString(property.balconyArea),

    // Amenities
    hasConditioner: property.hasConditioner ?? false,
    hasFurniture: property.hasFurniture ?? false,
    hasBed: property.hasBed ?? false,
    hasSofa: property.hasSofa ?? false,
    hasTable: property.hasTable ?? false,
    hasChairs: property.hasChairs ?? false,
    hasStove: property.hasStove ?? false,
    hasRefrigerator: property.hasRefrigerator ?? false,
    hasOven: property.hasOven ?? false,
    hasWashingMachine: property.hasWashingMachine ?? false,
    hasKitchenAppliances: property.hasKitchenAppliances ?? false,
    hasBalcony: property.hasBalcony ?? false,
    hasNaturalGas: property.hasNaturalGas ?? false,
    hasInternet: property.hasInternet ?? false,
    hasTV: property.hasTV ?? false,
    hasSewerage: property.hasSewerage ?? false,
    isFenced: property.isFenced ?? false,
    hasYardLighting: property.hasYardLighting ?? false,
    hasGrill: property.hasGrill ?? false,
    hasAlarm: property.hasAlarm ?? false,
    hasVentilation: property.hasVentilation ?? false,
    hasWater: property.hasWater ?? false,
    hasElectricity: property.hasElectricity ?? false,
    hasGate: property.hasGate ?? false,
  })

  // 👇 THIS IS THE FIX
  // This forces the form to update if the 'property' prop changes (e.g. finishes loading)
  useEffect(() => {
    setFormData({
      address: property.address,
      price: safeString(property.price),
      totalArea: safeString(property.totalArea),
      rooms: safeString(property.rooms),
      bedrooms: safeString(property.bedrooms),
      bathrooms: safeString(property.bathrooms),
      floors: safeString(property.floors),
      floorsTotal: safeString(property.floorsTotal),
      ceilingHeight: safeString(property.ceilingHeight),
      condition: property.condition || '',
      isNonStandard: property.isNonStandard ?? false,
      occupancy: property.occupancy || '',
      heating: property.heating || '',
      hotWater: property.hotWater || '',
      parking: property.parking || '',
      balconyArea: safeString(property.balconyArea),

      // Amenities
      hasConditioner: property.hasConditioner ?? false,
      hasFurniture: property.hasFurniture ?? false,
      hasBed: property.hasBed ?? false,
      hasSofa: property.hasSofa ?? false,
      hasTable: property.hasTable ?? false,
      hasChairs: property.hasChairs ?? false,
      hasStove: property.hasStove ?? false,
      hasRefrigerator: property.hasRefrigerator ?? false,
      hasOven: property.hasOven ?? false,
      hasWashingMachine: property.hasWashingMachine ?? false,
      hasKitchenAppliances: property.hasKitchenAppliances ?? false,
      hasBalcony: property.hasBalcony ?? false,
      hasNaturalGas: property.hasNaturalGas ?? false,
      hasInternet: property.hasInternet ?? false,
      hasTV: property.hasTV ?? false,
      hasSewerage: property.hasSewerage ?? false,
      isFenced: property.isFenced ?? false,
      hasYardLighting: property.hasYardLighting ?? false,
      hasGrill: property.hasGrill ?? false,
      hasAlarm: property.hasAlarm ?? false,
      hasVentilation: property.hasVentilation ?? false,
      hasWater: property.hasWater ?? false,
      hasElectricity: property.hasElectricity ?? false,
      hasGate: property.hasGate ?? false,
    })
  }, [property]) // Dependency array: Run this whenever 'property' changes

  const [hasChanges, setHasChanges] = useState(false)
  const updateProperty = useUpdateProperty()

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSubmit = async () => {
    const data = new FormData()

    // Only append changed fields
    if (formData.address !== property.address)
      data.append('address', formData.address)
    if (formData.price) data.append('price', formData.price)
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

    // Boolean fields - Ensure string conversion
    data.append('isNonStandard', String(formData.isNonStandard))
    data.append('hasConditioner', String(formData.hasConditioner))
    data.append('hasFurniture', String(formData.hasFurniture))
    data.append('hasBed', String(formData.hasBed))
    data.append('hasSofa', String(formData.hasSofa))
    data.append('hasTable', String(formData.hasTable))
    data.append('hasChairs', String(formData.hasChairs))
    data.append('hasStove', String(formData.hasStove))
    data.append('hasRefrigerator', String(formData.hasRefrigerator))
    data.append('hasOven', String(formData.hasOven))
    data.append('hasWashingMachine', String(formData.hasWashingMachine))
    data.append('hasKitchenAppliances', String(formData.hasKitchenAppliances))
    data.append('hasBalcony', String(formData.hasBalcony))
    data.append('hasNaturalGas', String(formData.hasNaturalGas))
    data.append('hasInternet', String(formData.hasInternet))
    data.append('hasTV', String(formData.hasTV))
    data.append('hasSewerage', String(formData.hasSewerage))
    data.append('isFenced', String(formData.isFenced))
    data.append('hasYardLighting', String(formData.hasYardLighting))
    data.append('hasGrill', String(formData.hasGrill))
    data.append('hasAlarm', String(formData.hasAlarm))
    data.append('hasVentilation', String(formData.hasVentilation))
    data.append('hasWater', String(formData.hasWater))
    data.append('hasElectricity', String(formData.hasElectricity))
    data.append('hasGate', String(formData.hasGate))

    try {
      await updateProperty.mutateAsync({ id: property.id, data })
      setHasChanges(false)
      onSuccess()
    } catch (error) {
      console.error('Error updating property:', error)
    }
  }

  return (
    <div className="bg-background rounded-lg border border-border shadow-sm p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Edit Property
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {property.translation?.title || property.address}
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

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-border pb-0 overflow-x-auto">
        <button
          onClick={() => setActiveSection('details')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeSection === 'details'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="w-4 h-4 inline mr-2" />
          Details
        </button>
        <button
          onClick={() => setActiveSection('images')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeSection === 'images'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ImageIcon className="w-4 h-4 inline mr-2" />
          Images
        </button>
        <button
          onClick={() => setActiveSection('translations')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeSection === 'translations'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          🌐 Translations
        </button>
      </div>

      <div className="space-y-6">
        {activeSection === 'details' && (
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Basic Information
              </h3>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={e => handleFormChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={e => handleFormChange('price', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalArea">Total Area (m²)</Label>
                  <Input
                    id="totalArea"
                    type="number"
                    value={formData.totalArea}
                    onChange={e =>
                      handleFormChange('totalArea', e.target.value)
                    }
                  />
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
                  <Label htmlFor="rooms">Rooms</Label>
                  <Input
                    id="rooms"
                    type="number"
                    value={formData.rooms}
                    onChange={e => handleFormChange('rooms', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={e => handleFormChange('bedrooms', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={e =>
                      handleFormChange('bathrooms', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floors">Floor</Label>
                  <Input
                    id="floors"
                    type="number"
                    value={formData.floors}
                    onChange={e => handleFormChange('floors', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floorsTotal">Total Floors</Label>
                  <Input
                    id="floorsTotal"
                    type="number"
                    value={formData.floorsTotal}
                    onChange={e =>
                      handleFormChange('floorsTotal', e.target.value)
                    }
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
                      handleFormChange('ceilingHeight', e.target.value)
                    }
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
                      handleFormChange('balconyArea', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={value =>
                      handleFormChange('condition', value)
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
                      handleFormChange('occupancy', value)
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
                      <SelectItem value={Occupancy.TEN_PLUS}>
                        10+ People
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Utilities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Utilities
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Heating</Label>
                  <Select
                    value={formData.heating}
                    onValueChange={value => handleFormChange('heating', value)}
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
                      <SelectItem value={HeatingType.ELECTRIC}>
                        Electric
                      </SelectItem>
                      <SelectItem value={HeatingType.NONE}>None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hot Water</Label>
                  <Select
                    value={formData.hotWater}
                    onValueChange={value => handleFormChange('hotWater', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hot water" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={HotWaterType.CENTRAL_HEATING}>
                        Central Heating
                      </SelectItem>
                      <SelectItem value={HotWaterType.BOILER}>
                        Boiler
                      </SelectItem>
                      <SelectItem value={HotWaterType.SOLAR}>Solar</SelectItem>
                      <SelectItem value={HotWaterType.NONE}>None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Parking</Label>
                  <Select
                    value={formData.parking}
                    onValueChange={value => handleFormChange('parking', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parking" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ParkingType.PARKING_SPACE}>
                        Parking Space
                      </SelectItem>
                      <SelectItem value={ParkingType.GARAGE}>Garage</SelectItem>
                      <SelectItem value={ParkingType.OPEN_LOT}>
                        Open Lot
                      </SelectItem>
                      <SelectItem value={ParkingType.NONE}>None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Amenities
              </h3>

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
                      checked={
                        formData[key as keyof typeof formData] as boolean
                      }
                      onCheckedChange={checked =>
                        handleFormChange(key, checked === true)
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

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={updateProperty.isPending || !hasChanges}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateProperty.isPending ? 'Updating...' : 'Update Property'}
              </Button>
              <Button variant="outline" onClick={onBack} className="px-6">
                Cancel
              </Button>
            </div>
          </div>
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
