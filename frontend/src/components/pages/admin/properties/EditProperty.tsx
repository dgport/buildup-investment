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

  const [formData, setFormData] = useState<Partial<CreatePropertyDto>>({
    propertyType: property.propertyType,
    address: property.address,
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

  useEffect(() => {
    setFormData({
      propertyType: property.propertyType,
      address: property.address,
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
  }, [property])

  const [hasChanges, setHasChanges] = useState(false)
  const updateProperty = useUpdateProperty()

  const handleFormChange = (field: string, value: any) => {
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={value =>
                      handleFormChange('propertyType', value as PropertyType)
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
                  <Label htmlFor="dealType">Deal Type</Label>
                  <Select
                    value={formData.dealType || ''}
                    onValueChange={value =>
                      handleFormChange(
                        'dealType',
                        value ? (value as DealType) : undefined
                      )
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
                      handleFormChange(
                        'status',
                        value ? (value as PropertyStatus) : undefined
                      )
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
                      handleFormChange(
                        'price',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={e => handleFormChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hotSale"
                    checked={formData.hotSale}
                    onCheckedChange={checked =>
                      handleFormChange('hotSale', checked === true)
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
                      handleFormChange('public', checked === true)
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
                      handleFormChange(
                        'totalArea',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rooms">Rooms</Label>
                  <Input
                    id="rooms"
                    type="number"
                    value={formData.rooms || ''}
                    onChange={e =>
                      handleFormChange(
                        'rooms',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms || ''}
                    onChange={e =>
                      handleFormChange(
                        'bedrooms',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms || ''}
                    onChange={e =>
                      handleFormChange(
                        'bathrooms',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floors">Floor</Label>
                  <Input
                    id="floors"
                    type="number"
                    value={formData.floors || ''}
                    onChange={e =>
                      handleFormChange(
                        'floors',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floorsTotal">Total Floors</Label>
                  <Input
                    id="floorsTotal"
                    type="number"
                    value={formData.floorsTotal || ''}
                    onChange={e =>
                      handleFormChange(
                        'floorsTotal',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
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
                      handleFormChange(
                        'ceilingHeight',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
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
                      handleFormChange(
                        'balconyArea',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select
                    value={formData.condition || ''}
                    onValueChange={value =>
                      handleFormChange(
                        'condition',
                        value ? (value as PropertyCondition) : undefined
                      )
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
                      handleFormChange(
                        'occupancy',
                        value ? (value as Occupancy) : undefined
                      )
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

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Utilities
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Heating</Label>
                  <Select
                    value={formData.heating || ''}
                    onValueChange={value =>
                      handleFormChange(
                        'heating',
                        value ? (value as HeatingType) : undefined
                      )
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
                    value={formData.hotWater || ''}
                    onValueChange={value =>
                      handleFormChange(
                        'hotWater',
                        value ? (value as HotWaterType) : undefined
                      )
                    }
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
                    value={formData.parking || ''}
                    onValueChange={value =>
                      handleFormChange(
                        'parking',
                        value ? (value as ParkingType) : undefined
                      )
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
                      <SelectItem value={ParkingType.OPEN_LOT}>
                        Open Lot
                      </SelectItem>
                      <SelectItem value={ParkingType.NONE}>None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

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
