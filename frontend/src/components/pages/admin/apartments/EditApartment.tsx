import type React from 'react'
import { useState } from 'react'
import {
  X,
  Upload,
  Save,
  Trash2,
  LayoutTemplate,
  Languages,
} from 'lucide-react'
import {
  useUpdateApartment,
  useDeleteApartmentImage,
  useApartment,
} from '@/lib/hooks/useApartments'
import { useProjects } from '@/lib/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { ApartmentTranslationsManager } from './ApartmentTranslationsManager'
import type { Apartment } from '@/lib/types/apartments'

interface EditApartmentProps {
  apartment: Apartment
  onBack: () => void
  onSuccess: () => void
}

export function EditApartment({
  apartment: initialData,
  onBack,
  onSuccess,
}: EditApartmentProps) {
  const { data: freshData } = useApartment(initialData.id)
  const apartment = freshData || initialData

  const [formData, setFormData] = useState({
    projectId: apartment.project?.id.toString() || '',
    room: apartment.room.toString(),
    area: apartment.area.toString(),
    description: apartment.description || '',
  })

  const [images, setImages] = useState({
    newFiles: [] as File[],
    previews: [] as string[],
  })

  const [activeSection, setActiveSection] = useState<
    'details' | 'images' | 'translations'
  >('details')

  const updateApartment = useUpdateApartment()
  const deleteImage = useDeleteApartmentImage()
  const { data: projectsResponse } = useProjects()
  const projects = projectsResponse?.data || []

  const updateFormField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setImages(prev => ({ ...prev, newFiles: [...prev.newFiles, ...files] }))
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages(prev => ({
          ...prev,
          previews: [...prev.previews, reader.result as string],
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeNewImage = (index: number) => {
    setImages(prev => ({
      newFiles: prev.newFiles.filter((_, i) => i !== index),
      previews: prev.previews.filter((_, i) => i !== index),
    }))
  }

  const handleDeleteExistingImage = async (index: number) => {
    if (!window.confirm('Delete this image permanently?')) return
    try {
      await deleteImage.mutateAsync({ id: apartment.id, imageIndex: index })
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async () => {
    const data = new FormData()
    let hasUpdates = false

    if (formData.room !== apartment.room.toString()) {
      data.append('room', formData.room)
      hasUpdates = true
    }
    if (formData.area !== apartment.area.toString()) {
      data.append('area', formData.area)
      hasUpdates = true
    }
    if (formData.description !== (apartment.description || '')) {
      data.append('description', formData.description)
      hasUpdates = true
    }
    if (
      formData.projectId &&
      formData.projectId !== (apartment.project?.id.toString() || '')
    ) {
      data.append('projectId', formData.projectId)
      hasUpdates = true
    }

    if (images.newFiles.length > 0) {
      images.newFiles.forEach(file => data.append('images', file))
      hasUpdates = true
    }

    if (!hasUpdates) {
      onSuccess()
      return
    }

    try {
      await updateApartment.mutateAsync({ id: apartment.id, data })
      onSuccess()
    } catch (err) {
      console.error(err)
    }
  }

  const hasChanges =
    formData.room !== apartment.room.toString() ||
    formData.area !== apartment.area.toString() ||
    formData.description !== (apartment.description || '') ||
    (formData.projectId &&
      formData.projectId !== (apartment.project?.id.toString() || '')) ||
    images.newFiles.length > 0

  return (
    <div className="bg-background rounded-lg border border-border shadow-sm p-8  mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
            Edit Apartment{' '}
            <span className="text-muted-foreground text-lg font-normal">
              #{apartment.id}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {apartment.project?.projectName} • {apartment.room} Rooms •{' '}
            {apartment.area}m²
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onBack}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-border w-full overflow-x-auto">
        <button
          onClick={() => setActiveSection('details')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeSection === 'details'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutTemplate className="w-4 h-4 inline mr-2" />
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
          Images ({apartment.images?.length || 0})
        </button>
        <button
          onClick={() => setActiveSection('translations')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeSection === 'translations'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Languages className="w-4 h-4 inline mr-2" />
          Translations
        </button>
      </div>

      {hasChanges && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            You have unsaved changes. Click "Save Changes" to apply them.
          </p>
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {activeSection === 'details' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="projectId"
                className="text-sm font-medium text-foreground"
              >
                Project Assignment
              </Label>
              <Select
                value={formData.projectId}
                onValueChange={value => updateFormField('projectId', value)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room">Number of Rooms</Label>
                <Input
                  id="room"
                  type="number"
                  min="1"
                  value={formData.room}
                  onChange={e => updateFormField('room', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area (m²)</Label>
                <Input
                  id="area"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.area}
                  onChange={e => updateFormField('area', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Primary Description (English)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => updateFormField('description', e.target.value)}
                className="min-h-[120px] resize-y bg-background"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={updateApartment.isPending || !hasChanges}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateApartment.isPending ? 'Saving...' : 'Save Changes'}
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
                Existing Images
              </Label>
              {apartment.images && apartment.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {apartment.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={`${import.meta.env.VITE_API_IMAGE_URL}/${img}`}
                        alt={`Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteExistingImage(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                  No images yet
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Add New Images
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-foreground/40 transition-colors relative bg-muted/30">
                <div className="py-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground">
                    Click to upload new images
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              {images.previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {images.previews.map((preview, i) => (
                    <div key={i} className="relative">
                      <img
                        src={preview}
                        alt={`New ${i + 1}`}
                        className="w-full h-32 object-cover rounded-md border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => removeNewImage(i)}
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
                disabled={updateApartment.isPending || !hasChanges}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateApartment.isPending ? 'Saving...' : 'Save Changes'}
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

        {activeSection === 'translations' && (
          <ApartmentTranslationsManager apartmentId={apartment.id} />
        )}
      </div>
    </div>
  )
}
