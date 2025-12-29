import { cn } from '@/lib/utils/cn'
import * as React from 'react'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[120px] w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 ring-offset-background transition-all duration-200 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-600 hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-stone-50 resize-none md:text-sm',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
