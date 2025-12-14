import { Trash2, ImageIcon, Upload, CheckCircle, XCircle } from 'lucide-react'
import {
  useProperty,
  useDeletePropertyImage,
  useUpdateProperty,
} from '@/lib/hooks/useProperties'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState, useRef } from 'react'

interface PropertyImagesManagerProps {
  propertyId: string
}

export function PropertyImagesManager({
  propertyId,
}: PropertyImagesManagerProps) {
  const { data: property, isLoading, refetch } = useProperty(propertyId)
  const deleteImage = useDeletePropertyImage()
  const updateProperty = useUpdateProperty()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<
    { file: File; preview: string }[]
  >([])
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return

    try {
      await deleteImage.mutateAsync({ propertyId, imageId })
      setMessage({ type: 'success', text: 'Image deleted successfully' })
      setTimeout(() => setMessage(null), 5000)
      refetch()
    } catch (error) {
      console.error('Error deleting image:', error)
      setMessage({
        type: 'error',
        text: 'Failed to delete image. Please try again.',
      })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const handleSelectImages = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const filesWithPreview = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }))
      setSelectedFiles(filesWithPreview)
    }
  }

  const handleCancelSelection = () => {
    selectedFiles.forEach(f => URL.revokeObjectURL(f.preview))
    setSelectedFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setMessage(null)

    try {
      // Use the new API: data object + images array
      await updateProperty.mutateAsync({
        id: propertyId,
        data: {}, // Empty data object - we're only uploading images
        images: selectedFiles.map(f => f.file), // Pass images array
      })

      // Clean up previews
      selectedFiles.forEach(f => URL.revokeObjectURL(f.preview))

      setMessage({
        type: 'success',
        text: `${selectedFiles.length} image(s) uploaded successfully`,
      })
      setTimeout(() => setMessage(null), 5000)

      // Reset state
      setSelectedFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ''

      // Refresh property data
      await refetch()
    } catch (error) {
      console.error('Error uploading images:', error)
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to upload images. Please try again.',
      })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading images...</p>
      </div>
    )
  }

  const images = property?.galleryImages || []

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Property Images</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Manage property gallery images
          </p>
        </div>
        <div className="flex gap-2">
          {selectedFiles.length > 0 ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancelSelection}
                disabled={updateProperty.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={updateProperty.isPending}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {updateProperty.isPending
                  ? 'Uploading...'
                  : `Upload ${selectedFiles.length} image(s)`}
              </Button>
            </>
          ) : (
            <Button onClick={handleSelectImages} className="gap-2">
              <Upload className="w-4 h-4" />
              Select Images
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {selectedFiles.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              {selectedFiles.length} file(s) selected
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {selectedFiles.map((f, index) => (
                <div key={index} className="relative">
                  <img
                    src={f.preview}
                    alt={f.file.name}
                    className="w-full h-24 object-cover rounded"
                  />
                  <p className="text-xs text-center mt-1 truncate text-blue-900 dark:text-blue-100">
                    {f.file.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {images.length === 0 ? (
        <Card className="border-dashed border-border bg-muted/20">
          <CardContent className="pt-12 pb-12 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No images uploaded yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Click "Select Images" button above to upload
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(image => (
            <Card
              key={image.id}
              className="border-border overflow-hidden group"
            >
              <div className="relative aspect-video">
                <img
                  src={`${import.meta.env.VITE_API_IMAGE_URL}/${image.imageUrl}`}
                  alt={`Property image ${image.order + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteImage(image.id)}
                    disabled={deleteImage.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-2">
                <p className="text-xs text-muted-foreground text-center">
                  Order: {image.order + 1}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
