import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils/cn'

interface LoadingOverlayProps {
  isLoading: boolean
  blur?: boolean
}

export const LoadingOverlay = ({
  isLoading,
  blur = true,
}: LoadingOverlayProps) => {
  return (
    <div className="relative">
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 z-50 flex flex-col items-center justify-center gap-4',
            'bg-background/80',
            blur && 'backdrop-blur-sm'
          )}
        >
          <Spinner />
        </div>
      )}
    </div>
  )
}
