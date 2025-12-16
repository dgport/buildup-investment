import type React from 'react'
import { useState } from 'react'
import { X, Upload, Save, MapPin } from 'lucide-react'
import { useCreateProject } from '@/lib/hooks/useProjects'
import { usePartners } from '@/lib/hooks/usePartners'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ProjectLocationMapPicker } from '@/components/shared/map/MapPin'
import { REGION_NAMES } from '@/lib/types/projects'

interface CreateProjectProps {
  onBack: () => void
  onSuccess: () => void
}

interface FormData {
  projectName: string
  location: string
  street: string
  region: string
  partnerId: string
  priceFrom: string
  deliveryDate: string
  numFloors: string
  numApartments: string
  hotSale: boolean
  public: boolean
}

export function CreateProject({ onBack, onSuccess }: CreateProjectProps) {
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    location: '',
    street: '',
    region: '',
    partnerId: '',
    priceFrom: '',
    deliveryDate: '',
    numFloors: '',
    numApartments: '',
    hotSale: false,
    public: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showMap, setShowMap] = useState(false)

  const createProject = useCreateProject()
  const { data: partnersResponse } = usePartners()

  const partners = partnersResponse?.data || []

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setGalleryFiles(prev => [...prev, ...files])

      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setGalleryPreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index))
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required'
    }
    if (!formData.partnerId) {
      newErrors.partnerId = 'Partner selection is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const data = new FormData()
    data.append('projectName', formData.projectName)
    data.append('partnerId', formData.partnerId)
    data.append('hotSale', formData.hotSale.toString())
    data.append('public', formData.public.toString())

    if (formData.location) {
      data.append('location', formData.location)
    }
    if (formData.street) {
      data.append('street', formData.street)
    }
    if (formData.region) {
      data.append('region', formData.region)
    }
    if (formData.priceFrom) {
      data.append('priceFrom', formData.priceFrom)
    }
    if (formData.deliveryDate) {
      data.append('deliveryDate', formData.deliveryDate)
    }
    if (formData.numFloors) {
      data.append('numFloors', formData.numFloors)
    }
    if (formData.numApartments) {
      data.append('numApartments', formData.numApartments)
    }

    if (imageFile) {
      data.append('image', imageFile)
    }

    galleryFiles.forEach(file => {
      data.append('gallery', file)
    })

    try {
      await createProject.mutateAsync(data)
      onSuccess()
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create project' })
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
    setFormData({
      ...formData,
      location: coordsString,
      street: location.address,
    })
    setShowMap(false)
  }

  const clearLocation = () => {
    setFormData({ ...formData, location: '', street: '' })
  }

  const coords = getCoordinatesDisplay()

  return (
    <>
      <div className="bg-background rounded-lg border border-border shadow-sm p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Create Project
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add a new project to your portfolio
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

        <div className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="projectName"
              className="text-sm font-medium text-foreground"
            >
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="projectName"
              type="text"
              value={formData.projectName}
              onChange={e =>
                setFormData({ ...formData, projectName: e.target.value })
              }
              placeholder="e.g., Modern Office Building"
              className={`bg-background border ${errors.projectName ? 'border-red-500' : 'border-border'}`}
            />
            {errors.projectName && (
              <p className="text-red-500 text-sm font-medium">
                {errors.projectName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="partnerId"
              className="text-sm font-medium text-foreground"
            >
              Partner <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.partnerId}
              onValueChange={value =>
                setFormData({ ...formData, partnerId: value })
              }
            >
              <SelectTrigger
                className={`bg-background border ${errors.partnerId ? 'border-red-500' : 'border-border'}`}
              >
                <SelectValue placeholder="Select a partner" />
              </SelectTrigger>
              <SelectContent>
                {partners.map(partner => (
                  <SelectItem key={partner.id} value={partner.id.toString()}>
                    {partner.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.partnerId && (
              <p className="text-red-500 text-sm font-medium">
                {errors.partnerId}
              </p>
            )}
          </div>

          <div className="border border-border rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location Details (Optional)
            </h3>

            <div className="space-y-2">
              <Label
                htmlFor="region"
                className="text-sm font-medium text-foreground"
              >
                Region
              </Label>
              <Select
                value={formData.region}
                onValueChange={value =>
                  setFormData({ ...formData, region: value })
                }
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
                  value={formData.street}
                  readOnly
                  placeholder="Select location from map"
                  className="bg-background border-border"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMap(true)}
                  className="shrink-0"
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
                        📍 Coordinates saved:
                      </p>
                      <p className="text-xs font-mono text-foreground">
                        Lat: {coords.lat.toFixed(6)}, Lng:{' '}
                        {coords.lng.toFixed(6)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearLocation}
                      className="h-6 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="priceFrom"
                className="text-sm font-medium text-foreground"
              >
                Price From ($)
              </Label>
              <Input
                id="priceFrom"
                type="number"
                value={formData.priceFrom}
                onChange={e =>
                  setFormData({ ...formData, priceFrom: e.target.value })
                }
                placeholder="e.g., 50000"
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="deliveryDate"
                className="text-sm font-medium text-foreground"
              >
                Delivery Date
              </Label>
              <Input
                id="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={e =>
                  setFormData({ ...formData, deliveryDate: e.target.value })
                }
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="numFloors"
                className="text-sm font-medium text-foreground"
              >
                Number of Floors
              </Label>
              <Input
                id="numFloors"
                type="number"
                value={formData.numFloors}
                onChange={e =>
                  setFormData({ ...formData, numFloors: e.target.value })
                }
                placeholder="e.g., 10"
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="numApartments"
                className="text-sm font-medium text-foreground"
              >
                Number of Apartments
              </Label>
              <Input
                id="numApartments"
                type="number"
                value={formData.numApartments}
                onChange={e =>
                  setFormData({ ...formData, numApartments: e.target.value })
                }
                placeholder="e.g., 50"
                className="bg-background border-border"
              />
            </div>
          </div>

          <div className="border border-border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label
                  htmlFor="hotSale"
                  className="text-sm font-medium text-foreground"
                >
                  🔥 Mark as Hot Sale
                </Label>
                <p className="text-xs text-muted-foreground">
                  Hot sale projects will be displayed prominently
                </p>
              </div>
              <Switch
                id="hotSale"
                checked={formData.hotSale}
                onCheckedChange={checked =>
                  setFormData({ ...formData, hotSale: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label
                  htmlFor="public"
                  className="text-sm font-medium text-foreground"
                >
                  👁️ Make Publicly Visible
                </Label>
                <p className="text-xs text-muted-foreground">
                  Public projects are visible to all users
                </p>
              </div>
              <Switch
                id="public"
                checked={formData.public}
                onCheckedChange={checked =>
                  setFormData({ ...formData, public: checked })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Main Project Image
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-foreground/40 transition-colors relative bg-muted/30">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 rounded-md border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-8 w-8"
                    onClick={removeImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="py-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Gallery Images (up to 20)
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-foreground/40 transition-colors relative bg-muted/30">
              <div className="py-2">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">
                  Click to upload multiple images
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB each
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => removeGalleryImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {errors.submit && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {errors.submit}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={createProject.isPending}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {createProject.isPending ? 'Creating...' : 'Create Project'}
            </Button>
            <Button
              variant="outline"
              onClick={onBack}
              className="px-6 bg-transparent"
            >
              Cancel
            </Button>
          </div>
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
