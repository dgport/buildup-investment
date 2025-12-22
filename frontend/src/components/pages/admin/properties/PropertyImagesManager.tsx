import { Trash2, ImageIcon, Upload, CheckCircle, XCircle } from 'lucide-react'
import {
  useProperty,
  useDeletePropertyImage,
  useUpdateProperty,
} from '@/lib/hooks/useProperties'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState, useRef, useEffect } from 'react'

interface PropertyImagesManagerProps {
  propertyId: string
}

type MessageType = 'success' | 'error'

interface Message {
  type: MessageType
  text: string
}

interface FileWithPreview {
  file: File
  preview: string
}

export function PropertyImagesManager({
  propertyId,
}: PropertyImagesManagerProps) {
  const { data: property, isLoading, refetch } = useProperty(propertyId)
  const deleteImage = useDeletePropertyImage()
  const updateProperty = useUpdateProperty()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [message, setMessage] = useState<Message | null>(null)

  useEffect(() => {
    return () => {
      selectedFiles.forEach(f => URL.revokeObjectURL(f.preview))
    }
  }, [selectedFiles])

  const showMessage = (type: MessageType, text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return

    try {
      await deleteImage.mutateAsync({ propertyId, imageId })
      showMessage('success', 'Image deleted successfully')
      await refetch()
    } catch (error) {
      console.error('Error deleting image:', error)
      showMessage('error', 'Failed to delete image. Please try again.')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const filesWithPreview = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setSelectedFiles(filesWithPreview)
  }

  const clearSelection = () => {
    selectedFiles.forEach(f => URL.revokeObjectURL(f.preview))
    setSelectedFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setMessage(null)

    try {
      await updateProperty.mutateAsync({
        id: propertyId,
        data: {},
        images: selectedFiles.map(f => f.file),
      })

      showMessage(
        'success',
        `${selectedFiles.length} image(s) uploaded successfully`
      )
      clearSelection()
      await refetch()
    } catch (error) {
      console.error('Error uploading images:', error)
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Failed to upload images. Please try again.'
      showMessage('error', errorMsg)
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
      {message && <MessageAlert type={message.type} text={message.text} />}

      <Header
        hasSelection={selectedFiles.length > 0}
        selectionCount={selectedFiles.length}
        onSelect={() => fileInputRef.current?.click()}
        onCancel={clearSelection}
        onUpload={handleUpload}
        isUploading={updateProperty.isPending}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {selectedFiles.length > 0 && (
        <SelectedFilesPreview files={selectedFiles} />
      )}

      {images.length === 0 ? (
        <EmptyState />
      ) : (
        <ImageGallery
          images={images}
          onDelete={handleDeleteImage}
          isDeleting={deleteImage.isPending}
        />
      )}
    </div>
  )
}

// Message Alert Component
function MessageAlert({ type, text }: Message) {
  return (
    <Alert variant={type === 'error' ? 'destructive' : 'default'}>
      {type === 'success' ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <XCircle className="h-4 w-4" />
      )}
      <AlertDescription>{text}</AlertDescription>
    </Alert>
  )
}

// Header Component
function Header({
  hasSelection,
  selectionCount,
  onSelect,
  onCancel,
  onUpload,
  isUploading,
}: {
  hasSelection: boolean
  selectionCount: number
  onSelect: () => void
  onCancel: () => void
  onUpload: () => void
  isUploading: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-foreground">Property Images</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Manage property gallery images
        </p>
      </div>
      <div className="flex gap-2">
        {hasSelection ? (
          <>
            <Button variant="outline" onClick={onCancel} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={onUpload} disabled={isUploading} className="gap-2">
              <Upload className="w-4 h-4" />
              {isUploading
                ? 'Uploading...'
                : `Upload ${selectionCount} image(s)`}
            </Button>
          </>
        ) : (
          <Button onClick={onSelect} className="gap-2">
            <Upload className="w-4 h-4" />
            Select Images
          </Button>
        )}
      </div>
    </div>
  )
}

// Selected Files Preview Component
function SelectedFilesPreview({ files }: { files: FileWithPreview[] }) {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
      <CardContent className="pt-4">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          {files.length} file(s) selected
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {files.map((f, index) => (
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
  )
}

// Empty State Component
function EmptyState() {
  return (
    <Card className="border-dashed border-border bg-muted/20">
      <CardContent className="pt-12 pb-12 text-center">
        <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Click "Select Images" button above to upload
        </p>
      </CardContent>
    </Card>
  )
}

function ImageGallery({
  images,
  onDelete,
  isDeleting,
}: {
  images: Array<{ id: number; imageUrl: string; order: number }>
  onDelete: (id: number) => void
  isDeleting: boolean
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map(image => (
        <ImageCard
          key={image.id}
          image={image}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  )
}

function ImageCard({
  image,
  onDelete,
  isDeleting,
}: {
  image: { id: number; imageUrl: string; order: number }
  onDelete: (id: number) => void
  isDeleting: boolean
}) {
  return (
    <Card className="border-border overflow-hidden group">
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
            onClick={() => onDelete(image.id)}
            disabled={isDeleting}
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
  )
}
