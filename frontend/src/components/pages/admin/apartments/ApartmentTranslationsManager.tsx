import { useState } from 'react'
import { Edit, Save, X, Loader2 } from 'lucide-react'
import {
  useApartmentTranslations,
  useUpsertApartmentTranslation,
} from '@/lib/hooks/useApartments'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface ApartmentTranslationsManagerProps {
  apartmentId: number
}

export function ApartmentTranslationsManager({
  apartmentId,
}: ApartmentTranslationsManagerProps) {
  const [editingTranslation, setEditingTranslation] = useState<{
    language: string
    description: string
  } | null>(null)

  const { data: translations = [], isLoading } =
    useApartmentTranslations(apartmentId)

  const upsertTranslation = useUpsertApartmentTranslation()

  const handleSaveTranslation = async () => {
    if (!editingTranslation || !editingTranslation.description.trim()) return

    await upsertTranslation.mutateAsync({
      id: apartmentId,
      data: editingTranslation,
    })

    setEditingTranslation(null)
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
      <h4 className="font-semibold text-lg text-foreground border-b pb-4">
        Manage Translations
      </h4>

      {translations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg bg-muted/30">
          No translations found.
        </div>
      ) : (
        <div className="space-y-4">
          {translations.map(translation => (
            <Card key={translation.language} className="overflow-hidden group">
              <CardContent className="p-6">
                {editingTranslation?.language === translation.language ? (
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
                        onClick={handleSaveTranslation}
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
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
