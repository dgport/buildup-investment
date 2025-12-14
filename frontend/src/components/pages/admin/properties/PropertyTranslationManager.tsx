import { useState } from 'react'
import { Edit, Save } from 'lucide-react'
import {
  usePropertyTranslations,
  useUpsertPropertyTranslation,
} from '@/lib/hooks/useProperties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { LANGUAGE_OPTIONS } from '@/constants/languages'
import type { UpsertPropertyTranslationDto } from '@/lib/types/properties'

interface PropertyTranslationsManagerProps {
  propertyId: string
}

interface Translation {
  id: number
  language: string
  title: string
  address: string | null
  description: string | null
  propertyId: string
}

export function PropertyTranslationsManager({
  propertyId,
}: PropertyTranslationsManagerProps) {
  const [editingTranslation, setEditingTranslation] =
    useState<UpsertPropertyTranslationDto | null>(null)

  const { data: translations = [], isLoading } =
    usePropertyTranslations(propertyId)
  const upsertTranslation = useUpsertPropertyTranslation()

  const handleSaveTranslation = async () => {
    if (!editingTranslation?.title?.trim()) {
      return
    }

    try {
      await upsertTranslation.mutateAsync({
        id: propertyId,
        data: editingTranslation,
      })
      setEditingTranslation(null)
    } catch (error) {
      console.error('Error saving translation:', error)
    }
  }

  const startEditing = (translation: Translation) => {
    setEditingTranslation({
      language: translation.language,
      title: translation.title,
      address: translation.address || undefined,
      description: translation.description || undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading translations...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground">Property Translations</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Manage title, address and description in different languages
        </p>
      </div>

      <div className="space-y-3">
        {translations.length === 0 ? (
          <Card className="border-dashed border-border bg-muted/20">
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-sm text-muted-foreground">
                No translations available.
              </p>
            </CardContent>
          </Card>
        ) : (
          translations.map((translation: Translation) => (
            <Card key={translation.language} className="border-border">
              <CardContent className="pt-6">
                {editingTranslation?.language === translation.language ? (
                  <EditingMode
                    editingTranslation={editingTranslation}
                    setEditingTranslation={setEditingTranslation}
                    onSave={handleSaveTranslation}
                    onCancel={() => setEditingTranslation(null)}
                    isPending={upsertTranslation.isPending}
                  />
                ) : (
                  <ViewMode
                    translation={translation}
                    onEdit={() => startEditing(translation)}
                  />
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

// Editing Mode Component
function EditingMode({
  editingTranslation,
  setEditingTranslation,
  onSave,
  onCancel,
  isPending,
}: {
  editingTranslation: UpsertPropertyTranslationDto
  setEditingTranslation: (data: UpsertPropertyTranslationDto) => void
  onSave: () => void
  onCancel: () => void
  isPending: boolean
}) {
  const updateField = (
    field: keyof UpsertPropertyTranslationDto,
    value: string
  ) => {
    setEditingTranslation({
      ...editingTranslation,
      [field]: value || undefined,
    })
  }

  const languageLabel =
    LANGUAGE_OPTIONS.find(l => l.value === editingTranslation.language)
      ?.label || editingTranslation.language

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Language</Label>
        <Input
          type="text"
          value={languageLabel}
          disabled
          className="bg-muted border-border text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          value={editingTranslation.title}
          onChange={e => updateField('title', e.target.value)}
          placeholder="Property title in this language"
          className="bg-background border-border"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Address</Label>
        <Input
          type="text"
          value={editingTranslation.address || ''}
          onChange={e => updateField('address', e.target.value)}
          placeholder="Property address in this language"
          className="bg-background border-border"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Description</Label>
        <Textarea
          value={editingTranslation.description || ''}
          onChange={e => updateField('description', e.target.value)}
          placeholder="Property description in this language..."
          className="bg-background border-border"
          rows={4}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={isPending || !editingTranslation.title?.trim()}
        >
          <Save className="w-4 h-4 mr-2" />
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

// View Mode Component
function ViewMode({
  translation,
  onEdit,
}: {
  translation: Translation
  onEdit: () => void
}) {
  const languageLabel = LANGUAGE_OPTIONS.find(
    l => l.value === translation.language
  )?.label

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <p className="font-medium">{languageLabel}</p>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {translation.title}
          </p>
          {translation.address && (
            <p className="text-xs text-muted-foreground">
              📍 {translation.address}
            </p>
          )}
          {translation.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {translation.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 ml-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="text-foreground/60 hover:text-foreground"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
