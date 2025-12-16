import { useState } from 'react'
import { Edit, Save } from 'lucide-react'
import {
  useProjectTranslations,
  useUpsertProjectTranslation,
} from '@/lib/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import type { UpsertProjectTranslationDto } from '@/lib/types/projects'

interface ProjectTranslationsManagerProps {
  projectId: number
}

export function ProjectTranslationsManager({
  projectId,
}: ProjectTranslationsManagerProps) {
  const [editingTranslation, setEditingTranslation] =
    useState<UpsertProjectTranslationDto | null>(null)
  const { data: translations = [], isLoading } =
    useProjectTranslations(projectId)
  const upsertTranslation = useUpsertProjectTranslation()

  const handleSaveTranslation = async () => {
    if (!editingTranslation?.projectName?.trim()) {
      return
    }

    try {
      await upsertTranslation.mutateAsync({
        id: projectId,
        data: editingTranslation,
      })
      setEditingTranslation(null)
    } catch (error) {
      console.error('Error saving translation:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading translations...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-lg text-foreground">
        Existing Translations
      </h4>

      <div className="space-y-3">
        {translations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
            No translations yet
          </div>
        ) : (
          translations.map(translation => {
            const projectName = translation.projectName ?? ''
            const street = translation.street ?? ''

            return (
              <Card key={translation.language} className="overflow-hidden">
                <CardContent className="p-6">
                  {editingTranslation?.language === translation.language ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Language</Label>
                        <Input
                          type="text"
                          value={editingTranslation.language}
                          disabled
                          className="bg-muted text-muted-foreground mt-2"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">
                            Project Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="text"
                            value={editingTranslation.projectName}
                            onChange={e =>
                              setEditingTranslation({
                                ...editingTranslation,
                                projectName: e.target.value,
                              })
                            }
                            placeholder="Enter project name"
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium">
                            Street Address
                          </Label>
                          <Input
                            type="text"
                            value={editingTranslation.street ?? ''}
                            onChange={e =>
                              setEditingTranslation({
                                ...editingTranslation,
                                street: e.target.value || undefined,
                              })
                            }
                            placeholder="Enter street address (optional)"
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={handleSaveTranslation}
                          disabled={
                            upsertTranslation.isPending ||
                            !editingTranslation.projectName?.trim()
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" /> Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingTranslation(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="font-semibold text-blue-600">
                          {translation.language.toUpperCase()}
                        </div>

                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-muted-foreground">Name:</span>{' '}
                            <span className="text-foreground font-medium">
                              {projectName || '(Empty)'}
                            </span>
                          </div>

                          <div>
                            <span className="text-muted-foreground">
                              Street:
                            </span>{' '}
                            <span className="text-foreground font-medium">
                              {street || '(Not set)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setEditingTranslation({
                            language: translation.language,
                            projectName,
                            street: street || undefined,
                          })
                        }
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
