import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
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
import { PropertyType, DealType } from '@/lib/types/properties'
import { useProperties } from '@/lib/hooks/useProperties'

interface PropertyFiltersProps {
  onFilterChange?: () => void
}

export function PropertyFilters({ onFilterChange }: PropertyFiltersProps) {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  // Fetch all properties to get unique regions
  const { data: allPropertiesResponse } = useProperties({
    lang: i18n.language,
    limit: 1000,
  })

  const uniqueRegions = useMemo(() => {
    if (!allPropertiesResponse?.data) return []

    const regionsMap = new Map<string, string>()

    allPropertiesResponse.data.forEach(property => {
      if (property.region && property.regionName) {
        regionsMap.set(property.region, property.regionName)
      }
    })

    return Array.from(regionsMap.entries())
      .map(([region, regionName]) => ({ region, regionName }))
      .sort((a, b) => a.regionName.localeCompare(b.regionName))
  }, [allPropertiesResponse])

  const [filters, setFilters] = useState({
    propertyType: searchParams.get('propertyType') || 'all',
    dealType: searchParams.get('dealType') || 'all',
    region: searchParams.get('region') || 'all',
    externalId: searchParams.get('externalId') || '',
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
  })

  const MAX_PRICE = 1000000
  const PRICE_STEP = 10000
  const MAX_AREA = 500
  const AREA_STEP = 10

  const applyFilters = () => {
    const params = new URLSearchParams()
    params.set('page', '1')

    // Main filters
    if (filters.propertyType && filters.propertyType !== 'all')
      params.set('propertyType', filters.propertyType)
    if (filters.dealType && filters.dealType !== 'all')
      params.set('dealType', filters.dealType)
    if (filters.region && filters.region !== 'all')
      params.set('region', filters.region)
    if (filters.externalId && filters.externalId.trim())
      params.set('externalId', filters.externalId.trim())

    // Price range
    if (filters.priceFrom > 0)
      params.set('priceFrom', filters.priceFrom.toString())
    if (filters.priceTo < MAX_PRICE)
      params.set('priceTo', filters.priceTo.toString())

    // Area range
    if (filters.areaFrom > 0)
      params.set('areaFrom', filters.areaFrom.toString())
    if (filters.areaTo < MAX_AREA)
      params.set('areaTo', filters.areaTo.toString())

    // Room counts
    if (filters.rooms && filters.rooms !== 'all')
      params.set('rooms', filters.rooms)
    if (filters.bedrooms && filters.bedrooms !== 'all')
      params.set('bedrooms', filters.bedrooms)

    setSearchParams(params)
    onFilterChange?.()
    setIsOpen(false)
  }

  const clearFilters = () => {
    setFilters({
      propertyType: 'all',
      dealType: 'all',
      region: 'all',
      externalId: '',
      priceFrom: 0,
      priceTo: MAX_PRICE,
      areaFrom: 0,
      areaTo: MAX_AREA,
      rooms: 'all',
      bedrooms: 'all',
    })
    setSearchParams({ page: '1' })
    onFilterChange?.()
  }

  const hasActiveFilters =
    (filters.propertyType && filters.propertyType !== 'all') ||
    (filters.dealType && filters.dealType !== 'all') ||
    (filters.region && filters.region !== 'all') ||
    (filters.externalId && filters.externalId.trim()) ||
    filters.priceFrom > 0 ||
    filters.priceTo < MAX_PRICE ||
    filters.areaFrom > 0 ||
    filters.areaTo < MAX_AREA ||
    (filters.rooms && filters.rooms !== 'all') ||
    (filters.bedrooms && filters.bedrooms !== 'all')

  const formatEnumValue = (value: string): string => {
    return value
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  return (
    <div className="mb-6">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2 border-2 hover:border-blue-400 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-semibold">
              {t('filters.title', { defaultValue: 'Filters' })}
            </span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {t('filters.active', { defaultValue: 'Active' })}
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
              {t('filters.propertyFilters', {
                defaultValue: 'Property Filters',
              })}
            </SheetTitle>
            <SheetDescription>
              {t('filters.description', {
                defaultValue:
                  'Customize your property search with these filters',
              })}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-8 space-y-6">
            {/* Property ID Search */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                <div className="w-1 h-5 bg-orange-500 rounded-full" />
                {t('filters.propertyId', { defaultValue: 'Property ID' })}
              </Label>
              <Input
                type="text"
                placeholder={t('filters.enterPropertyId', {
                  defaultValue: 'Enter property ID...',
                })}
                value={filters.externalId}
                onChange={e =>
                  setFilters({ ...filters, externalId: e.target.value })
                }
                className="h-12 border-2 focus:border-orange-500"
              />
            </div>

            {/* Property Type */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-500 rounded-full" />
                {t('filters.propertyType', { defaultValue: 'Property Type' })}
              </Label>
              <Select
                value={filters.propertyType}
                onValueChange={value =>
                  setFilters({ ...filters, propertyType: value })
                }
              >
                <SelectTrigger className="h-12 border-2 focus:border-blue-500">
                  <SelectValue
                    placeholder={t('filters.allTypes', {
                      defaultValue: 'All Types',
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-medium">
                    {t('filters.allTypes', { defaultValue: 'All Types' })}
                  </SelectItem>
                  {Object.values(PropertyType).map(type => (
                    <SelectItem key={type} value={type}>
                      {formatEnumValue(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deal Type */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-400 rounded-full" />
                {t('filters.dealType', { defaultValue: 'Deal Type' })}
              </Label>
              <Select
                value={filters.dealType}
                onValueChange={value =>
                  setFilters({ ...filters, dealType: value })
                }
              >
                <SelectTrigger className="h-12 border-2 focus:border-blue-400">
                  <SelectValue
                    placeholder={t('filters.allDeals', {
                      defaultValue: 'All Deals',
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-medium">
                    {t('filters.allDeals', { defaultValue: 'All Deals' })}
                  </SelectItem>
                  {Object.values(DealType).map(type => (
                    <SelectItem key={type} value={type}>
                      {formatEnumValue(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                <div className="w-1 h-5 bg-teal-500 rounded-full" />
                {t('filters.region', { defaultValue: 'Region' })}
              </Label>
              <Select
                value={filters.region}
                onValueChange={value =>
                  setFilters({ ...filters, region: value })
                }
              >
                <SelectTrigger className="h-12 border-2 focus:border-teal-500">
                  <SelectValue
                    placeholder={t('filters.allRegions', {
                      defaultValue: 'All Regions',
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-medium">
                    {t('filters.allRegions', { defaultValue: 'All Regions' })}
                  </SelectItem>
                  {uniqueRegions.map(({ region, regionName }) => (
                    <SelectItem key={region} value={region}>
                      {regionName}
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
                  {t('filters.priceRange', { defaultValue: 'Price Range' })}
                </Label>
                <span className="text-lg font-bold text-blue-600">
                  {filters.priceFrom > 0 || filters.priceTo < MAX_PRICE
                    ? `$${filters.priceFrom.toLocaleString()} - $${filters.priceTo.toLocaleString()}`
                    : t('filters.any', { defaultValue: 'Any' })}
                </span>
              </div>

              <div className="relative pt-2 pb-4">
                <Slider
                  min={0}
                  max={MAX_PRICE}
                  step={PRICE_STEP}
                  value={[filters.priceFrom, filters.priceTo]}
                  onValueChange={([from, to]) =>
                    setFilters({ ...filters, priceFrom: from, priceTo: to })
                  }
                  className="w-full [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-blue-500/30 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&>.bg-primary]:bg-blue-500 [&>.bg-primary]:h-2"
                />
              </div>

              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span className="bg-muted px-3 py-1 rounded-full">$0</span>
                <span className="bg-muted px-3 py-1 rounded-full">
                  ${MAX_PRICE.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Area Range */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                  <div className="w-1 h-5 bg-purple-500 rounded-full" />
                  {t('filters.area', { defaultValue: 'Area (m²)' })}
                </Label>
                <span className="text-lg font-bold text-purple-600">
                  {filters.areaFrom > 0 || filters.areaTo < MAX_AREA
                    ? `${filters.areaFrom} - ${filters.areaTo} m²`
                    : t('filters.any', { defaultValue: 'Any' })}
                </span>
              </div>

              <div className="relative pt-2 pb-4">
                <Slider
                  min={0}
                  max={MAX_AREA}
                  step={AREA_STEP}
                  value={[filters.areaFrom, filters.areaTo]}
                  onValueChange={([from, to]) =>
                    setFilters({ ...filters, areaFrom: from, areaTo: to })
                  }
                  className="w-full [&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/30 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&>.bg-primary]:bg-purple-500 [&>.bg-primary]:h-2"
                />
              </div>

              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span className="bg-muted px-3 py-1 rounded-full">0 m²</span>
                <span className="bg-muted px-3 py-1 rounded-full">
                  {MAX_AREA} m²
                </span>
              </div>
            </div>

            {/* Rooms and Bedrooms */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {t('filters.rooms', { defaultValue: 'Rooms' })}
                </Label>
                <Select
                  value={filters.rooms}
                  onValueChange={value =>
                    setFilters({ ...filters, rooms: value })
                  }
                >
                  <SelectTrigger className="h-12 border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t('filters.any', { defaultValue: 'Any' })}
                    </SelectItem>
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
                  {t('filters.bedrooms', { defaultValue: 'Bedrooms' })}
                </Label>
                <Select
                  value={filters.bedrooms}
                  onValueChange={value =>
                    setFilters({ ...filters, bedrooms: value })
                  }
                >
                  <SelectTrigger className="h-12 border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t('filters.any', { defaultValue: 'Any' })}
                    </SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
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
                {t('filters.apply', { defaultValue: 'Apply Filters' })}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full h-12 border-2 text-base font-semibold hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                  size="lg"
                >
                  <X className="w-5 h-5 mr-2" />
                  {t('filters.clear', { defaultValue: 'Clear All Filters' })}
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
