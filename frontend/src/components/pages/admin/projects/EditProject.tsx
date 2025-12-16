import type React from 'react'
import { useState } from 'react'
import { X, Upload, Save, Trash2, ImageIcon, MapPin } from 'lucide-react'
import {
  useUpdateProject,
  useDeleteProjectGalleryImage,
} from '@/lib/hooks/useProjects'
import { usePartners } from '@/lib/hooks/usePartners'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ProjectLocationMapPicker } from '@/components/shared/map/MapPin'

import { REGION_NAMES, type Project } from '@/lib/types/projects'
import { ProjectTranslationsManager } from './ProjectTranslationsManager'

interface EditProjectProps {
  project: Project
  onBack: () => void
  onSuccess: () => void
}

export function EditProject({ project, onBack, onSuccess }: EditProjectProps) {
  const [formData, setFormData] = useState({
    partnerId: project.partner?.id?.toString() || '',
    location: project.location || '', // "lat,lng"
    street: project.street || '',
    region: project.region || '',
    priceFrom: project.priceFrom?.toString() || '',
    deliveryDate: project.deliveryDate
      ? project.deliveryDate.split('T')[0]
      : '',
    numFloors: project.numFloors?.toString() || '',
    numApartments: project.numApartments?.toString() || '',
    hotSale: Boolean(project.hotSale),
    public: project.public ?? true,
  })

  const [images, setImages] = useState({
    mainFile: null as File | null,
    mainPreview: project.image
      ? `${import.meta.env.VITE_API_IMAGE_URL}/${project.image}`
      : null,
    galleryFiles: [] as File[],
    galleryPreviews: [] as string[],
    deletedGalleryIndices: [] as number[],
  })

  const [showMap, setShowMap] = useState(false)

  const [activeSection, setActiveSection] = useState<
    'details' | 'images' | 'gallery' | 'translations'
  >('details')

  const updateProject = useUpdateProject()
  const deleteGalleryImage = useDeleteProjectGalleryImage()
  const { data: partnersResponse } = usePartners()
  const partners = partnersResponse?.data || []

  const updateFormField = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages(prev => ({
          ...prev,
          mainFile: file,
          mainPreview: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const newPreviews: string[] = []
      let loadedCount = 0

      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          loadedCount++

          if (loadedCount === files.length) {
            setImages(prev => ({
              ...prev,
              galleryFiles: [...prev.galleryFiles, ...files],
              galleryPreviews: [...prev.galleryPreviews, ...newPreviews],
            }))
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeNewGalleryImage = (index: number) => {
    setImages(prev => ({
      ...prev,
      galleryFiles: prev.galleryFiles.filter((_, i) => i !== index),
      galleryPreviews: prev.galleryPreviews.filter((_, i) => i !== index),
    }))
  }

  const markExistingGalleryImageForDeletion = (index: number) => {
    setImages(prev => ({
      ...prev,
      deletedGalleryIndices: [...prev.deletedGalleryIndices, index],
    }))
  }

  const undoDeleteExistingGalleryImage = (index: number) => {
    setImages(prev => ({
      ...prev,
      deletedGalleryIndices: prev.deletedGalleryIndices.filter(
        i => i !== index
      ),
    }))
  }

  const resetMainImage = () => {
    setImages(prev => ({
      ...prev,
      mainFile: null,
      mainPreview: project.image
        ? `${import.meta.env.VITE_API_IMAGE_URL}/${project.image}`
        : null,
    }))
  }

  const getCoordinatesDisplay = () => {
    if (!formData.location) return null
    const [lat, lng] = formData.location.split(',').map(Number)
    if (isNaN(lat) || isNaN(lng)) return null
    return { lat, lng }
  }

  const handleSubmit = async () => {
    try {
      if (images.deletedGalleryIndices.length > 0) {
        for (const index of images.deletedGalleryIndices) {
          await deleteGalleryImage.mutateAsync({
            id: project.id,
            imageIndex: index,
          })
        }
      }

      const data = new FormData()

      if (images.mainFile) {
        data.append('image', images.mainFile)
      }

      const originalPartnerId = project.partner?.id?.toString() || ''
      if (formData.partnerId && formData.partnerId !== originalPartnerId) {
        data.append('partnerId', formData.partnerId)
      }

      // Location fields
      const originalLocation = project.location || ''
      if (formData.location !== originalLocation) {
        data.append('location', formData.location)
      }

      const originalStreet = project.street || ''
      if (formData.street !== originalStreet) {
        data.append('street', formData.street)
      }

      const originalRegion = project.region || ''
      if (formData.region !== originalRegion) {
        data.append('region', formData.region)
      }

      const originalPrice = project.priceFrom?.toString() || ''
      if (formData.priceFrom !== originalPrice) {
        data.append('priceFrom', formData.priceFrom || '0')
      }

      const originalDeliveryDate = project.deliveryDate
        ? project.deliveryDate.split('T')[0]
        : ''
      if (formData.deliveryDate !== originalDeliveryDate) {
        data.append('deliveryDate', formData.deliveryDate)
      }

      const originalFloors = project.numFloors?.toString() || ''
      if (formData.numFloors !== originalFloors) {
        data.append('numFloors', formData.numFloors || '0')
      }

      const originalApartments = project.numApartments?.toString() || ''
      if (formData.numApartments !== originalApartments) {
        data.append('numApartments', formData.numApartments || '0')
      }

      const originalHotSale = Boolean(project.hotSale)
      if (formData.hotSale !== originalHotSale) {
        data.append('hotSale', String(formData.hotSale))
      }

      const originalPublic = project.public ?? true
      if (formData.public !== originalPublic) {
        data.append('public', String(formData.public))
      }

      images.galleryFiles.forEach(file => {
        data.append('gallery', file)
      })

      const hasChanges =
        images.mainFile ||
        images.galleryFiles.length > 0 ||
        images.deletedGalleryIndices.length > 0 ||
        formData.partnerId !== originalPartnerId ||
        formData.location !== originalLocation ||
        formData.street !== originalStreet ||
        formData.region !== originalRegion ||
        formData.priceFrom !== originalPrice ||
        formData.deliveryDate !== originalDeliveryDate ||
        formData.numFloors !== originalFloors ||
        formData.numApartments !== originalApartments ||
        formData.hotSale !== originalHotSale ||
        formData.public !== originalPublic

      if (hasChanges) {
        await updateProject.mutateAsync({ id: project.id, data })
      }

      onSuccess()
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project. Please try again.')
    }
  }

  const originalPartnerId = project.partner?.id?.toString() || ''
  const originalLocation = project.location || ''
  const originalStreet = project.street || ''
  const originalRegion = project.region || ''
  const originalPrice = project.priceFrom?.toString() || ''
  const originalDeliveryDate = project.deliveryDate
    ? project.deliveryDate.split('T')[0]
    : ''
  const originalFloors = project.numFloors?.toString() || ''
  const originalApartments = project.numApartments?.toString() || ''
  const originalHotSale = Boolean(project.hotSale)
  const originalPublic = project.public ?? true

  const hasChanges =
    images.mainFile ||
    images.galleryFiles.length > 0 ||
    images.deletedGalleryIndices.length > 0 ||
    formData.partnerId !== originalPartnerId ||
    formData.location !== originalLocation ||
    formData.street !== originalStreet ||
    formData.region !== originalRegion ||
    formData.priceFrom !== originalPrice ||
    formData.deliveryDate !== originalDeliveryDate ||
    formData.numFloors !== originalFloors ||
    formData.numApartments !== originalApartments ||
    formData.hotSale !== originalHotSale ||
    formData.public !== originalPublic

  const displayGallery =
    project.gallery?.filter(
      (_, index) => !images.deletedGalleryIndices.includes(index)
    ) || []

  const coords = getCoordinatesDisplay()

  return (
    <>
      <div className="bg-background rounded-lg border border-border shadow-sm p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Edit Project
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {project.projectName}
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
            <Upload className="w-4 h-4 inline mr-2" />
            Main Image
          </button>
          <button
            onClick={() => setActiveSection('gallery')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'gallery'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ImageIcon className="w-4 h-4 inline mr-2" />
            Gallery ({displayGallery.length + images.galleryFiles.length})
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

        {hasChanges && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              You have unsaved changes. Click "Save Changes" to apply them.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {activeSection === 'details' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="partnerId"
                  className="text-sm font-medium text-foreground"
                >
                  Partner
                </Label>
                <Select
                  value={formData.partnerId}
                  onValueChange={value => updateFormField('partnerId', value)}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {partners?.map(partner => (
                      <SelectItem
                        key={partner.id}
                        value={partner.id.toString()}
                      >
                        {partner.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border border-border rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location Details
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
                    onValueChange={value => updateFormField('region', value)}
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
                    Location from Map
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
                      Pick from Map
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
                          onClick={() => {
                            setFormData({
                              ...formData,
                              location: '',
                              street: '',
                            })
                          }}
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
                    onChange={e => updateFormField('priceFrom', e.target.value)}
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
                      updateFormField('deliveryDate', e.target.value)
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
                    onChange={e => updateFormField('numFloors', e.target.value)}
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
                      updateFormField('numApartments', e.target.value)
                    }
                    placeholder="e.g., 50"
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Switch
                    id="hotSale"
                    checked={formData.hotSale}
                    onCheckedChange={checked =>
                      updateFormField('hotSale', checked)
                    }
                  />
                  <Label
                    htmlFor="hotSale"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    🔥 Hot Sale
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="public"
                    checked={formData.public}
                    onCheckedChange={checked =>
                      updateFormField('public', checked)
                    }
                  />
                  <Label
                    htmlFor="public"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    👁️ Public
                  </Label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={updateProject.isPending || !hasChanges}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProject.isPending ? 'Saving...' : 'Save Changes'}
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
          )}

          {activeSection === 'images' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Main Project Image
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-foreground/40 transition-colors relative bg-muted/30">
                  {images.mainPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={images.mainPreview}
                        alt="Preview"
                        className="max-h-48 rounded-md border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-8 w-8"
                        onClick={resetMainImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="py-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm font-medium text-foreground">
                        Click to upload new image
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

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={updateProject.isPending || !hasChanges}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProject.isPending ? 'Saving...' : 'Save Changes'}
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
          )}

          {activeSection === 'gallery' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Existing Gallery Images
                </Label>
                {project.gallery && project.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {project.gallery.map((img, index) => {
                      const isMarkedForDeletion =
                        images.deletedGalleryIndices.includes(index)
                      return (
                        <div key={index} className="relative group">
                          <div
                            className={`relative ${isMarkedForDeletion ? 'opacity-40' : ''}`}
                          >
                            <img
                              src={`${import.meta.env.VITE_API_IMAGE_URL}/${img}`}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-32 object-cover rounded-md border border-border"
                            />
                            {isMarkedForDeletion && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                                <span className="text-white text-xs font-medium">
                                  Marked for deletion
                                </span>
                              </div>
                            )}
                          </div>
                          {isMarkedForDeletion ? (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="absolute top-2 right-2 h-8 text-xs"
                              onClick={() =>
                                undoDeleteExistingGalleryImage(index)
                              }
                            >
                              Undo
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() =>
                                markExistingGalleryImageForDeletion(index)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                    No gallery images yet
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Add New Gallery Images
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
                {images.galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {images.galleryPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md border border-border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => removeNewGalleryImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={updateProject.isPending || !hasChanges}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProject.isPending ? 'Saving...' : 'Save Changes'}
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
          )}
          {showMap && (
            <ProjectLocationMapPicker
              onLocationSelect={location => {
                const coordsString = `${location.coordinates[1]},${location.coordinates[0]}`
                setFormData({
                  ...formData,
                  location: coordsString,
                  street: location.address,
                })
                setShowMap(false)
              }}
              onClose={() => setShowMap(false)}
              initialLocation={
                coords ? { lng: coords.lng, lat: coords.lat } : null
              }
            />
          )}

          {activeSection === 'translations' && (
            <ProjectTranslationsManager projectId={project.id} />
          )}
        </div>
      </div>
    </>
  )
}
