import { Edit, Trash2, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Project } from '@/lib/types/projects'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (id: number) => void
}

export function AdminProjectCard({
  project,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const imageUrl = project.image
    ? `${import.meta.env.VITE_API_IMAGE_URL}/${project.image}`
    : null

  return (
    <div className="grid grid-cols-12 gap-4 items-center p-4 border-b border-border hover:bg-muted/30 transition">
      <div className="col-span-1">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={project.projectName}
            className="h-12 w-12 object-cover rounded-md bg-muted"
          />
        ) : (
          <div className="h-12 w-12 flex items-center justify-center rounded-md bg-muted">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="col-span-3">
        <p className="font-medium text-foreground">{project.projectName}</p>
      </div>

      <div className="col-span-2">
        <p className="text-sm text-muted-foreground">
          {project.partner ? project.partner.companyName : '—'}
        </p>
      </div>

      <div className="col-span-2">
        <p className="text-sm text-foreground font-medium">
          {project.priceFrom ? `$${project.priceFrom.toLocaleString()}` : '—'}
        </p>
      </div>

      <div className="col-span-1">
        {project.hotSale ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            🔥 Hot
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      <div className="col-span-1 flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(project)}
          className="h-8 w-8 p-0"
        >
          <Edit className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(project.id)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
