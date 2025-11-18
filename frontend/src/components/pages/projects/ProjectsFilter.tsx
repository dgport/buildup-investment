import { useState, useMemo } from 'react'
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
import { usePartners } from '@/lib/hooks/usePartners'
import { useProjects } from '@/lib/hooks/useProjects'

interface ProjectFiltersProps {
  onFilterChange?: () => void
}

export function ProjectFilters({ onFilterChange }: ProjectFiltersProps) {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const { data: partnersResponse } = usePartners({
    lang: i18n.language,
  })
  const partners = partnersResponse?.data || []

  const { data: allProjectsResponse } = useProjects({
    lang: i18n.language,
    limit: 1000,
  })

  const uniqueLocations = useMemo(() => {
    if (!allProjectsResponse?.data) return []

    const locations = allProjectsResponse.data
      .map(project => {
        const location =
          project.translation?.projectLocation || project.projectLocation
        return location?.trim()
      })
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort()

    return locations
  }, [allProjectsResponse])

  const [filters, setFilters] = useState({
    location: searchParams.get('location') || 'all',
    priceFrom: searchParams.get('priceFrom')
      ? parseInt(searchParams.get('priceFrom')!)
      : 0,
    partnerId: searchParams.get('partnerId') || 'all',
  })

  // Price range config
  const MAX_PRICE = 10000
  const PRICE_STEP = 500

  const applyFilters = () => {
    const params = new URLSearchParams()
    params.set('page', '1')
    if (filters.location && filters.location !== 'all')
      params.set('location', filters.location)
    if (filters.priceFrom > 0)
      params.set('priceFrom', filters.priceFrom.toString())
    if (filters.partnerId && filters.partnerId !== 'all')
      params.set('partnerId', filters.partnerId)
    setSearchParams(params)
    onFilterChange?.()
    setIsOpen(false)
  }

  const clearFilters = () => {
    setFilters({
      location: 'all',
      priceFrom: 0,
      partnerId: 'all',
    })
    setSearchParams({ page: '1' })
    onFilterChange?.()
  }

  const hasActiveFilters =
    (filters.location && filters.location !== 'all') ||
    filters.priceFrom > 0 ||
    (filters.partnerId && filters.partnerId !== 'all')

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
            <span className="font-semibold">
              {t('projects.filters.title', { defaultValue: 'Filters' })}
            </span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {t('projects.filters.active', { defaultValue: 'Active' })}
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
              {t('projects.filters.title', { defaultValue: 'Filters' })}
            </SheetTitle>
            <SheetDescription>
              {t('projects.filters.description', {
                defaultValue:
                  'Customize your project search with these filters',
              })}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-8 space-y-8">
            <div className="space-y-3">
              <Label
                htmlFor="location"
                className="text-base font-semibold text-foreground flex items-center gap-2"
              >
                <div className="w-1 h-5 bg-blue-500 rounded-full" />
                {t('projects.filters.location', { defaultValue: 'Location' })}
              </Label>
              <Select
                value={filters.location}
                onValueChange={value =>
                  setFilters({ ...filters, location: value })
                }
              >
                <SelectTrigger
                  id="location"
                  className="h-12 border-2 focus:border-blue-500 transition-colors"
                >
                  <SelectValue
                    placeholder={t('projects.filters.allLocations', {
                      defaultValue: 'All Locations',
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-medium">
                    {t('projects.filters.allLocations', {
                      defaultValue: 'All Locations',
                    })}
                  </SelectItem>
                  {uniqueLocations.map(location => (
                    <SelectItem
                      key={location}
                      value={location}
                      className="cursor-pointer hover:bg-blue-50"
                    >
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="partner"
                className="text-base font-semibold text-foreground flex items-center gap-2"
              >
                <div className="w-1 h-5 bg-blue-400 rounded-full" />
                {t('projects.filters.partner', { defaultValue: 'Developer' })}
              </Label>
              <Select
                value={filters.partnerId}
                onValueChange={value =>
                  setFilters({ ...filters, partnerId: value })
                }
              >
                <SelectTrigger
                  id="partner"
                  className="h-12 border-2 focus:border-blue-400 transition-colors"
                >
                  <SelectValue
                    placeholder={t('projects.filters.allPartners', {
                      defaultValue: 'All Developers',
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-medium">
                    {t('projects.filters.allPartners', {
                      defaultValue: 'All Developers',
                    })}
                  </SelectItem>
                  {partners.map(partner => (
                    <SelectItem
                      key={partner.id}
                      value={partner.id.toString()}
                      className="cursor-pointer hover:bg-blue-50"
                    >
                      {partner.translation?.companyName || partner.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="priceFrom"
                  className="text-base font-semibold text-foreground flex items-center gap-2"
                >
                  <div className="w-1 h-5 bg-blue-500 rounded-full" />
                  {t('projects.filters.priceFrom', {
                    defaultValue: 'Min Price',
                  })}
                </Label>
                <span className="text-lg font-bold text-blue-600">
                  {filters.priceFrom > 0
                    ? `$${filters.priceFrom.toLocaleString()}`
                    : t('projects.filters.any', { defaultValue: 'Any' })}
                </span>
              </div>

              <div className="relative pt-2 pb-4">
                <Slider
                  id="priceFrom"
                  min={0}
                  max={MAX_PRICE}
                  step={PRICE_STEP}
                  value={[filters.priceFrom]}
                  onValueChange={value =>
                    setFilters({ ...filters, priceFrom: value[0] })
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

            <div className="pt-6 space-y-3 border-t">
              <Button
                onClick={applyFilters}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-base font-semibold shadow-lg"
                size="lg"
              >
                <Search className="w-5 h-5 mr-2" />
                {t('projects.filters.apply', { defaultValue: 'Apply Filters' })}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full h-12 border-2 text-base font-semibold hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                  size="lg"
                >
                  <X className="w-5 h-5 mr-2" />
                  {t('projects.filters.clear', {
                    defaultValue: 'Clear All Filters',
                  })}
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
