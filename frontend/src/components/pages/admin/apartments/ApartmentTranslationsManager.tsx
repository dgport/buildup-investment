 
import { useState } from 'react'
import { Plus, Edit, Trash2, Save, X, Loader2 } from 'lucide-react'
import {
  useApartmentTranslations,
  useUpsertApartmentTranslation,
  useDeleteApartmentTranslation,
} from '@/lib/hooks/useApartments'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { UpsertTranslationDto } from '@/lib/types/apartments'

interface ApartmentTranslationsManagerProps {
  apartmentId: number
}

// Options based on your supported languages
const languageOptions = [
  { value: 'ka', label: 'Georgian (ka)' },
  { value: 'ru', label: 'Russian (ru)' },
  { value: 'en', label: 'English (en)' },
]

export function ApartmentTranslationsManager({
  apartmentId,
}: ApartmentTranslationsManagerProps) {
  // State for editing an existing translation
  const [editingTranslation, setEditingTranslation] = useState<{
    language: string
    description: string
  } | null>(null)

  // State for adding a new translation
  const [newTranslation, setNewTranslation] = useState<UpsertTranslationDto>({
    language: 'ka',
    description: '',
  })

  const [isAdding, setIsAdding] = useState(false)

  // Hooks
  const { data: translations = [], isLoading } =
    useApartmentTranslations(apartmentId)
  const upsertTranslation = useUpsertApartmentTranslation()
  const deleteTranslation = useDeleteApartmentTranslation()

  // Handle Save (Create or Update)
  const handleSaveTranslation = async (isEdit = false) => {
    const data = isEdit ? editingTranslation : newTranslation

    if (!data || !data.description.trim()) {
      alert('Description cannot be empty')
      return
    }

    try {
      await upsertTranslation.mutateAsync({
        id: apartmentId,
        data: {
          language: data.language,
          description: data.description,
        },
      })

      if (isEdit) {
        setEditingTranslation(null)
      } else {
        setNewTranslation({
          language: 'ka',
          description: '',
        })
        setIsAdding(false)
      }
    } catch (error) {
      console.error('Error saving translation:', error)
    }
  }

  // Handle Delete
  const handleDeleteTranslation = async (language: string) => {
    if (!window.confirm(`Delete ${language} translation?`)) return

    try {
      await deleteTranslation.mutateAsync({ id: apartmentId, language })
    } catch (error) {
      console.error('Error deleting translation:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8 text-muted-foreground">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading translations...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h4 className="font-semibold text-lg text-foreground">
          Manage Translations
        </h4>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          size="sm"
          className={
            isAdding
              ? 'bg-gray-500 hover:bg-gray-600'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        >
          {isAdding ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Translation
            </>
          )}
        </Button>
      </div>

      {/* Add New Translation Form */}
      {isAdding && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-base font-medium">Language</Label>
                <Select
                  value={newTranslation.language}
                  onValueChange={value =>
                    setNewTranslation({ ...newTranslation, language: value })
                  }
                >
                  <SelectTrigger className="mt-2 bg-white">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Description</Label>
              <Textarea
                value={newTranslation.description}
                onChange={e =>
                  setNewTranslation({
                    ...newTranslation,
                    description: e.target.value,
                  })
                }
                placeholder="Enter translated description..."
                className="mt-2 min-h-[120px] bg-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => handleSaveTranslation(false)}
                disabled={upsertTranslation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {upsertTranslation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Translation
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List Existing Translations */}
      <div className="space-y-4">
        {translations.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg bg-muted/30">
            No translations found. Add one above.
          </div>
        ) : (
          translations.map(translation => (
            <Card key={translation.language} className="overflow-hidden group">
              <CardContent className="p-6">
                {editingTranslation?.language === translation.language ? (
                  // EDIT MODE
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm uppercase">
                        {translation.language}
                      </span>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <Textarea
                        value={editingTranslation.description}
                        onChange={e =>
                          setEditingTranslation({
                            ...editingTranslation,
                            description: e.target.value,
                          })
                        }
                        className="mt-2 min-h-[120px]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSaveTranslation(true)}
                        disabled={upsertTranslation.isPending}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {upsertTranslation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingTranslation(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // VIEW MODE
                  <div className="flex items-start gap-4">
                    <div className="min-w-[40px]">
                      <span className="font-bold bg-slate-100 text-slate-700 border px-2 py-1 rounded text-sm uppercase block text-center">
                        {translation.language}
                      </span>
                    </div>

                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {translation.description || (
                          <span className="text-muted-foreground italic">
                            No description provided.
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setEditingTranslation({
                            language: translation.language,
                            description: translation.description || '',
                          })
                        }
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDeleteTranslation(translation.language)
                        }
                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                        title="Delete"
                      >
                        {deleteTranslation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
