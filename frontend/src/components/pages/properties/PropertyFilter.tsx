import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'

interface PropertyFiltersProps {
  onFilterChange?: () => void
}

export function PropertyFilters({ onFilterChange }: PropertyFiltersProps) {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const [filters, setFilters] = useState({
    propertyType: searchParams.get('propertyType') || 'all',
    status: searchParams.get('status') || 'all',
    priceFrom: searchParams.get('priceFrom')
      ? parseInt(searchParams.get('priceFrom')!)
      : 0,
    priceTo: searchParams.get('priceTo')
      ? parseInt(searchParams.get('priceTo')!)
      : 1000000,
    areaFrom: searchParams.get('areaFrom')
      ? parseInt(searchParams.get('areaFrom')!)
      : 0,
    areaTo: searchParams.get('areaTo')
      ? parseInt(searchParams.get('areaTo')!)
      : 500,
    rooms: searchParams.get('rooms') || 'all',
    bedrooms: searchParams.get('bedrooms') || 'all',
    bathrooms: searchParams.get('bathrooms') || 'all',
    floors: searchParams.get('floors') || 'all',
    condition: searchParams.get('condition') || 'all',
    heating: searchParams.get('heating') || 'all',
    parking: searchParams.get('parking') || 'all',
    hasConditioner: searchParams.get('hasConditioner') === 'true',
    hasFurniture: searchParams.get('hasFurniture') === 'true',
    hasBalcony: searchParams.get('hasBalcony') === 'true',
    hasInternet: searchParams.get('hasInternet') === 'true',
    hasNaturalGas: searchParams.get('hasNaturalGas') === 'true',
  })

  const MAX_PRICE = 1000000
  const PRICE_STEP = 10000
  const MAX_AREA = 500
  const AREA_STEP = 10

  // Enum values stay as-is (for backend), labels are translated
  const propertyTypes = [
    { value: 'APARTMENT', label: t('properties.types.apartment') },
    { value: 'HOUSE', label: t('properties.types.house') },
    { value: 'LAND', label: t('properties.types.land') },
    { value: 'COMMERCIAL', label: t('properties.types.commercial') },
    { value: 'OFFICE', label: t('properties.types.office') },
  ]

  const statuses = [
    { value: 'FOR_SALE', label: t('properties.status.forSale') },
    { value: 'FOR_RENT', label: t('properties.status.forRent') },
    { value: 'SOLD', label: t('properties.status.sold') },
    { value: 'RENTED', label: t('properties.status.rented') },
  ]

  const conditions = [
    { value: 'NEW_BUILDING', label: t('properties.conditions.newBuilding') },
    { value: 'GOOD', label: t('properties.conditions.good') },
    {
      value: 'NEEDS_RENOVATION',
      label: t('properties.conditions.needsRenovation'),
    },
    {
      value: 'UNDER_CONSTRUCTION',
      label: t('properties.conditions.underConstruction'),
    },
  ]

  const heatingTypes = [
    { value: 'CENTRAL', label: t('properties.heating.central') },
    { value: 'GAS', label: t('properties.heating.gas') },
    { value: 'ELECTRIC', label: t('properties.heating.electric') },
    { value: 'NONE', label: t('properties.heating.none') },
  ]

  const parkingTypes = [
    { value: 'GARAGE', label: t('properties.parking.garage') },
    { value: 'PARKING_SPACE', label: t('properties.parking.parkingSpace') },
    { value: 'STREET', label: t('properties.parking.street') },
    { value: 'NONE', label: t('properties.parking.none') },
  ]

  const applyFilters = () => {
    const params = new URLSearchParams()
    params.set('page', '1')

    if (filters.propertyType && filters.propertyType !== 'all')
      params.set('propertyType', filters.propertyType)

    if (filters.status && filters.status !== 'all')
      params.set('status', filters.status)

    if (filters.priceFrom > 0)
      params.set('priceFrom', filters.priceFrom.toString())

    if (filters.priceTo < MAX_PRICE)
      params.set('priceTo', filters.priceTo.toString())

    if (filters.areaFrom > 0)
      params.set('areaFrom', filters.areaFrom.toString())

    if (filters.areaTo < MAX_AREA)
      params.set('areaTo', filters.areaTo.toString())

    if (filters.rooms && filters.rooms !== 'all')
      params.set('rooms', filters.rooms)

    if (filters.bedrooms && filters.bedrooms !== 'all')
      params.set('bedrooms', filters.bedrooms)

    if (filters.bathrooms && filters.bathrooms !== 'all')
      params.set('bathrooms', filters.bathrooms)

    if (filters.floors && filters.floors !== 'all')
      params.set('floors', filters.floors)

    if (filters.condition && filters.condition !== 'all')
      params.set('condition', filters.condition)

    if (filters.heating && filters.heating !== 'all')
      params.set('heating', filters.heating)

    if (filters.parking && filters.parking !== 'all')
      params.set('parking', filters.parking)

    if (filters.hasConditioner) params.set('hasConditioner', 'true')
    if (filters.hasFurniture) params.set('hasFurniture', 'true')
    if (filters.hasBalcony) params.set('hasBalcony', 'true')
    if (filters.hasInternet) params.set('hasInternet', 'true')
    if (filters.hasNaturalGas) params.set('hasNaturalGas', 'true')

    setSearchParams(params)
    onFilterChange?.()
    setIsOpen(false)
  }

  const clearFilters = () => {
    setFilters({
      propertyType: 'all',
      status: 'all',
      priceFrom: 0,
      priceTo: MAX_PRICE,
      areaFrom: 0,
      areaTo: MAX_AREA,
      rooms: 'all',
      bedrooms: 'all',
      bathrooms: 'all',
      floors: 'all',
      condition: 'all',
      heating: 'all',
      parking: 'all',
      hasConditioner: false,
      hasFurniture: false,
      hasBalcony: false,
      hasInternet: false,
      hasNaturalGas: false,
    })
    setSearchParams({ page: '1' })
    onFilterChange?.()
  }

  const hasActiveFilters =
    (filters.propertyType && filters.propertyType !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    filters.priceFrom > 0 ||
    filters.priceTo < MAX_PRICE ||
    filters.areaFrom > 0 ||
    filters.areaTo < MAX_AREA ||
    (filters.rooms && filters.rooms !== 'all') ||
    (filters.bedrooms && filters.bedrooms !== 'all') ||
    (filters.bathrooms && filters.bathrooms !== 'all') ||
    (filters.floors && filters.floors !== 'all') ||
    (filters.condition && filters.condition !== 'all') ||
    (filters.heating && filters.heating !== 'all') ||
    (filters.parking && filters.parking !== 'all') ||
    filters.hasConditioner ||
    filters.hasFurniture ||
    filters.hasBalcony ||
    filters.hasInternet ||
    filters.hasNaturalGas

  return (
    <div className="mb-6">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto gap-2 border-2 hover:border-blue-400 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-semibold">{t('filters.title')}</span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {t('filters.active')}
              </span>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-full sm:w-[440px] overflow-y-auto z-50"
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-2xl">
              <div className="p-2 bg-blue-500 rounded-lg">
                <SlidersHorizontal className="w-6 h-6 text-white" />
              </div>
              {t('filters.title')}
            </SheetTitle>
            <SheetDescription>{t('filters.description')}</SheetDescription>
          </SheetHeader>

          <div className="mt-8 space-y-6">
            {/* Property Type */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-500 rounded-full" />
                {t('filters.propertyType')}
              </Label>
              <Select
                value={filters.propertyType}
                onValueChange={value =>
                  setFilters({ ...filters, propertyType: value })
                }
              >
                <SelectTrigger className="h-12 border-2 focus:border-blue-500">
                  <SelectValue placeholder={t('filters.allTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                  {propertyTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                <div className="w-1 h-5 bg-green-500 rounded-full" />
                {t('filters.status')}
              </Label>
              <Select
                value={filters.status}
                onValueChange={value =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger className="h-12 border-2 focus:border-green-500">
                  <SelectValue placeholder={t('filters.allStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allStatus')}</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-500 rounded-full" />
                  {t('filters.priceRange')}
                </Label>
                <span className="text-sm font-bold text-blue-600">
                  ${filters.priceFrom.toLocaleString()} - $
                  {filters.priceTo.toLocaleString()}
                </span>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    {t('filters.from')}: ${filters.priceFrom.toLocaleString()}
                  </Label>
                  <Slider
                    min={0}
                    max={MAX_PRICE}
                    step={PRICE_STEP}
                    value={[filters.priceFrom]}
                    onValueChange={value =>
                      setFilters({ ...filters, priceFrom: value[0] })
                    }
                    className="[&_[role=slider]]:bg-blue-500 [&>.bg-primary]:bg-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    {t('filters.to')}: ${filters.priceTo.toLocaleString()}
                  </Label>
                  <Slider
                    min={0}
                    max={MAX_PRICE}
                    step={PRICE_STEP}
                    value={[filters.priceTo]}
                    onValueChange={value =>
                      setFilters({ ...filters, priceTo: value[0] })
                    }
                    className="[&_[role=slider]]:bg-blue-500 [&>.bg-primary]:bg-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Area Range */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                  <div className="w-1 h-5 bg-purple-500 rounded-full" />
                  {t('filters.area')}
                </Label>
                <span className="text-sm font-bold text-purple-600">
                  {filters.areaFrom} - {filters.areaTo} m²
                </span>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    {t('filters.from')}: {filters.areaFrom} m²
                  </Label>
                  <Slider
                    min={0}
                    max={MAX_AREA}
                    step={AREA_STEP}
                    value={[filters.areaFrom]}
                    onValueChange={value =>
                      setFilters({ ...filters, areaFrom: value[0] })
                    }
                    className="[&_[role=slider]]:bg-purple-500 [&>.bg-primary]:bg-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    {t('filters.to')}: {filters.areaTo} m²
                  </Label>
                  <Slider
                    min={0}
                    max={MAX_AREA}
                    step={AREA_STEP}
                    value={[filters.areaTo]}
                    onValueChange={value =>
                      setFilters({ ...filters, areaTo: value[0] })
                    }
                    className="[&_[role=slider]]:bg-purple-500 [&>.bg-primary]:bg-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Rooms, Bedrooms, Bathrooms */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {t('filters.rooms')}
                </Label>
                <Select
                  value={filters.rooms}
                  onValueChange={value =>
                    setFilters({ ...filters, rooms: value })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.any')}</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {t('filters.bedrooms')}
                </Label>
                <Select
                  value={filters.bedrooms}
                  onValueChange={value =>
                    setFilters({ ...filters, bedrooms: value })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.any')}</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {t('filters.bathrooms')}
                </Label>
                <Select
                  value={filters.bathrooms}
                  onValueChange={value =>
                    setFilters({ ...filters, bathrooms: value })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.any')}</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Condition */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                {t('filters.condition')}
              </Label>
              <Select
                value={filters.condition}
                onValueChange={value =>
                  setFilters({ ...filters, condition: value })
                }
              >
                <SelectTrigger className="h-12 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('filters.allConditions')}
                  </SelectItem>
                  {conditions.map(cond => (
                    <SelectItem key={cond.value} value={cond.value}>
                      {cond.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Heating & Parking */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {t('filters.heating')}
                </Label>
                <Select
                  value={filters.heating}
                  onValueChange={value =>
                    setFilters({ ...filters, heating: value })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.any')}</SelectItem>
                    {heatingTypes.map(heat => (
                      <SelectItem key={heat.value} value={heat.value}>
                        {heat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {t('filters.parking')}
                </Label>
                <Select
                  value={filters.parking}
                  onValueChange={value =>
                    setFilters({ ...filters, parking: value })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.any')}</SelectItem>
                    {parkingTypes.map(park => (
                      <SelectItem key={park.value} value={park.value}>
                        {park.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amenities Checkboxes */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <div className="w-1 h-5 bg-orange-500 rounded-full" />
                {t('filters.amenities')}
              </Label>
              <div className="space-y-3 pl-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="conditioner"
                    checked={filters.hasConditioner}
                    onCheckedChange={checked =>
                      setFilters({
                        ...filters,
                        hasConditioner: checked as boolean,
                      })
                    }
                  />
                  <label
                    htmlFor="conditioner"
                    className="text-sm font-medium cursor-pointer"
                  >
                    {t('properties.amenities.conditioner')}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="furniture"
                    checked={filters.hasFurniture}
                    onCheckedChange={checked =>
                      setFilters({
                        ...filters,
                        hasFurniture: checked as boolean,
                      })
                    }
                  />
                  <label
                    htmlFor="furniture"
                    className="text-sm font-medium cursor-pointer"
                  >
                    {t('properties.amenities.furniture')}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="balcony"
                    checked={filters.hasBalcony}
                    onCheckedChange={checked =>
                      setFilters({ ...filters, hasBalcony: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="balcony"
                    className="text-sm font-medium cursor-pointer"
                  >
                    {t('properties.amenities.balcony')}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="internet"
                    checked={filters.hasInternet}
                    onCheckedChange={checked =>
                      setFilters({
                        ...filters,
                        hasInternet: checked as boolean,
                      })
                    }
                  />
                  <label
                    htmlFor="internet"
                    className="text-sm font-medium cursor-pointer"
                  >
                    {t('properties.amenities.internet')}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gas"
                    checked={filters.hasNaturalGas}
                    onCheckedChange={checked =>
                      setFilters({
                        ...filters,
                        hasNaturalGas: checked as boolean,
                      })
                    }
                  />
                  <label
                    htmlFor="gas"
                    className="text-sm font-medium cursor-pointer"
                  >
                    {t('properties.amenities.naturalGas')}
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 space-y-3 border-t">
              <Button
                onClick={applyFilters}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-base font-semibold shadow-lg"
                size="lg"
              >
                <Search className="w-5 h-5 mr-2" />
                {t('filters.apply')}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full h-12 border-2 text-base font-semibold hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                  size="lg"
                >
                  <X className="w-5 h-5 mr-2" />
                  {t('filters.clear')}
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
