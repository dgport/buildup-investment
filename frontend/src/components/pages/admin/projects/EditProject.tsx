import type React from 'react'

import { useState } from 'react'
import { X, Upload, Save, Trash2, Image as ImageIcon } from 'lucide-react'
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

import type { Project } from '@/lib/types/projects'
import { ProjectTranslationsManager } from './ProjectTranslationsManager'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface EditProjectProps {
  project: Project
  onBack: () => void
  onSuccess: () => void
}

export function EditProject({ project, onBack, onSuccess }: EditProjectProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    project.image ? `${API_URL}/${project.image}` : null
  )
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [partnerId, setPartnerId] = useState(
    project.partnerId ? project.partnerId.toString() : ''
  )
  const [projectLocation, setProjectLocation] = useState(
    project.projectLocation || ''
  )
  const [priceFrom, setPriceFrom] = useState(
    project.priceFrom?.toString() || ''
  )
  const [deliveryDate, setDeliveryDate] = useState(
    project.deliveryDate ? project.deliveryDate.split('T')[0] : ''
  )
  const [numFloors, setNumFloors] = useState(
    project.numFloors?.toString() || ''
  )
  const [numApartments, setNumApartments] = useState(
    project.numApartments?.toString() || ''
  )
  const [activeSection, setActiveSection] = useState<
    'details' | 'images' | 'gallery' | 'translations'
  >('details')

  const updateProject = useUpdateProject()
  const deleteGalleryImage = useDeleteProjectGalleryImage()
  const { data: partners } = usePartners('en')

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

  const removeNewGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index))
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleDeleteExistingGalleryImage = async (index: number) => {
    if (!window.confirm('Are you sure you want to delete this gallery image?'))
      return

    try {
      await deleteGalleryImage.mutateAsync({
        id: project.id,
        imageIndex: index,
      })
      onSuccess()
    } catch (error) {
      console.error('Error deleting gallery image:', error)
    }
  }

  const handleSubmit = async () => {
    const data = new FormData()

    if (imageFile) {
      data.append('image', imageFile)
    }
    if (partnerId && partnerId !== project.partnerId?.toString()) {
      data.append('partnerId', partnerId)
    }
    if (projectLocation !== project.projectLocation) {
      data.append('projectLocation', projectLocation)
    }
    if (priceFrom !== (project.priceFrom?.toString() || '')) {
      data.append('priceFrom', priceFrom)
    }
    if (
      deliveryDate !==
      (project.deliveryDate ? project.deliveryDate.split('T')[0] : '')
    ) {
      data.append('deliveryDate', deliveryDate)
    }
    if (numFloors !== (project.numFloors?.toString() || '')) {
      data.append('numFloors', numFloors)
    }
    if (numApartments !== (project.numApartments?.toString() || '')) {
      data.append('numApartments', numApartments)
    }

    galleryFiles.forEach(file => {
      data.append('gallery', file)
    })

    // Check if there are any changes
    const hasChanges =
      imageFile ||
      galleryFiles.length > 0 ||
      (partnerId && partnerId !== project.partnerId?.toString()) ||
      projectLocation !== project.projectLocation ||
      priceFrom !== (project.priceFrom?.toString() || '') ||
      deliveryDate !==
        (project.deliveryDate ? project.deliveryDate.split('T')[0] : '') ||
      numFloors !== (project.numFloors?.toString() || '') ||
      numApartments !== (project.numApartments?.toString() || '')

    if (hasChanges) {
      try {
        await updateProject.mutateAsync({ id: project.id, data })
        onSuccess()
      } catch (error) {
        console.error('Error updating project:', error)
      }
    }
  }

  const hasChanges =
    imageFile ||
    galleryFiles.length > 0 ||
    (partnerId && partnerId !== project.partnerId?.toString()) ||
    projectLocation !== project.projectLocation ||
    priceFrom !== (project.priceFrom?.toString() || '') ||
    deliveryDate !==
      (project.deliveryDate ? project.deliveryDate.split('T')[0] : '') ||
    numFloors !== (project.numFloors?.toString() || '') ||
    numApartments !== (project.numApartments?.toString() || '')

  return (
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
          Gallery ({project.gallery?.length || 0})
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="projectLocation"
                className="text-sm font-medium text-foreground"
              >
                Project Location
              </Label>
              <Input
                id="projectLocation"
                type="text"
                value={projectLocation}
                onChange={e => setProjectLocation(e.target.value)}
                placeholder="e.g., Downtown District"
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="partnerId"
                className="text-sm font-medium text-foreground"
              >
                Partner
              </Label>
              <Select value={partnerId} onValueChange={setPartnerId}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select partner" />
                </SelectTrigger>
                <SelectContent>
                  {partners?.map(partner => (
                    <SelectItem key={partner.id} value={partner.id.toString()}>
                      {partner.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="priceFrom"
                  className="text-sm font-medium text-foreground"
                >
                  Price From (₾)
                </Label>
                <Input
                  id="priceFrom"
                  type="number"
                  value={priceFrom}
                  onChange={e => setPriceFrom(e.target.value)}
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
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
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
                  value={numFloors}
                  onChange={e => setNumFloors(e.target.value)}
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
                  value={numApartments}
                  onChange={e => setNumApartments(e.target.value)}
                  placeholder="e.g., 50"
                  className="bg-background border-border"
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
                {updateProject.isPending ? 'Updating...' : 'Update Details'}
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
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(
                          project.image ? `${API_URL}/${project.image}` : null
                        )
                      }}
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
                disabled={updateProject.isPending || !imageFile}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateProject.isPending ? 'Updating...' : 'Update Image'}
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
                  {project.gallery.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={`${API_URL}/${img}`}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteExistingGalleryImage(index)}
                        disabled={deleteGalleryImage.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
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

              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {galleryPreviews.map((preview, index) => (
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
                disabled={updateProject.isPending || galleryFiles.length === 0}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateProject.isPending ? 'Updating...' : 'Add Gallery Images'}
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
          <ProjectTranslationsManager projectId={project.id} />
        )}
      </div>
    </div>
  )
}
