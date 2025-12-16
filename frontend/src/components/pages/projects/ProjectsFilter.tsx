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

  const uniqueRegions = useMemo(() => {
    if (!allProjectsResponse?.data) return []

    const regionsMap = new Map<string, string>()

    allProjectsResponse.data.forEach(project => {
      if (project.region && project.regionName) {
        regionsMap.set(project.region, project.regionName)
      }
    })

    return Array.from(regionsMap.entries())
      .map(([region, regionName]) => ({ region, regionName }))
      .sort((a, b) => a.regionName.localeCompare(b.regionName))
  }, [allProjectsResponse])

  const [filters, setFilters] = useState({
    region: searchParams.get('region') || 'all',
    priceFrom: searchParams.get('priceFrom')
      ? parseInt(searchParams.get('priceFrom')!, 10)
      : 0,
    partnerId: searchParams.get('partnerId') || 'all',
  })

  const applyFilters = () => {
    const params = new URLSearchParams()
    params.set('page', '1')

    if (filters.region !== 'all') {
      params.set('region', filters.region)
    }

    if (filters.priceFrom > 0) {
      params.set('priceFrom', filters.priceFrom.toString())
    }

    if (filters.partnerId !== 'all') {
      params.set('partnerId', filters.partnerId)
    }

    setSearchParams(params)
    onFilterChange?.()
    setIsOpen(false)
  }

  const clearFilters = () => {
    setFilters({
      region: 'all',
      priceFrom: 0,
      partnerId: 'all',
    })
    setSearchParams({ page: '1' })
    onFilterChange?.()
  }

  const hasActiveFilters =
    filters.region !== 'all' ||
    filters.priceFrom > 0 ||
    filters.partnerId !== 'all'

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
              {t('filters.title', { defaultValue: 'Filters' })}
            </SheetTitle>
            <SheetDescription>
              {t('filters.description', {
                defaultValue:
                  'Customize your project search with these filters',
              })}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-8 space-y-8">
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-500 rounded-full" />
                {t('filters.region', { defaultValue: 'Region' })}
              </Label>
              <Select
                value={filters.region}
                onValueChange={value =>
                  setFilters({ ...filters, region: value })
                }
              >
                <SelectTrigger className="h-12 border-2 focus:border-blue-500">
                  <SelectValue
                    placeholder={t('filters.allRegions', {
                      defaultValue: 'All Regions',
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('filters.allRegions', {
                      defaultValue: 'All Regions',
                    })}
                  </SelectItem>
                  {uniqueRegions.map(({ region, regionName }) => (
                    <SelectItem key={region} value={region}>
                      {regionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <div className="w-1 h-5 bg-purple-500 rounded-full" />
                {t('filters.partner', { defaultValue: 'Developer' })}
              </Label>
              <Select
                value={filters.partnerId}
                onValueChange={value =>
                  setFilters({ ...filters, partnerId: value })
                }
              >
                <SelectTrigger className="h-12 border-2 focus:border-purple-500">
                  <SelectValue
                    placeholder={t('filters.allPartners', {
                      defaultValue: 'All Developers',
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('filters.allPartners', {
                      defaultValue: 'All Developers',
                    })}
                  </SelectItem>
                  {partners.map(partner => (
                    <SelectItem key={partner.id} value={partner.id.toString()}>
                      {partner.translation?.companyName || partner.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <div className="w-1 h-5 bg-orange-500 rounded-full" />
                  {t('filters.priceFrom', { defaultValue: 'Min Price' })}
                </Label>
                <span className="text-lg font-bold text-orange-600">
                  {filters.priceFrom > 0
                    ? `$${filters.priceFrom.toLocaleString()}`
                    : t('filters.any', { defaultValue: 'Any' })}
                </span>
              </div>

              <Slider
                min={0}
                max={10000}
                step={500}
                value={[filters.priceFrom]}
                onValueChange={value =>
                  setFilters({ ...filters, priceFrom: value[0] })
                }
              />
            </div>

            <div className="pt-6 space-y-3 border-t">
              <Button
                onClick={applyFilters}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600"
              >
                <Search className="w-5 h-5 mr-2" />
                {t('filters.apply', { defaultValue: 'Apply Filters' })}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full h-12"
                >
                  <X className="w-5 h-5 mr-2" />
                  {t('filters.clear', {
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
