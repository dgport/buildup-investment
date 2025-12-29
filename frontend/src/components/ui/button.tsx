import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:saturate-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-teal-700 to-teal-800 text-amber-50 hover:from-teal-800 hover:to-teal-900 active:from-teal-900 active:to-teal-950 shadow-md hover:shadow-lg active:shadow-sm',
        secondary:
          'bg-amber-400 text-teal-950 hover:bg-amber-500 active:bg-amber-600 shadow-sm hover:shadow-md active:shadow-sm',
        outline:
          'border-2 border-teal-600 text-teal-700 hover:bg-teal-50 active:bg-teal-100 dark:border-teal-400 dark:text-teal-300 dark:hover:bg-teal-950 dark:active:bg-teal-900',
        ghost:
          'text-teal-700 hover:bg-teal-100 active:bg-teal-200 dark:text-teal-400 dark:hover:bg-teal-950 dark:active:bg-teal-900',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md active:shadow-sm',
        link: 'text-teal-700 underline-offset-4 hover:underline hover:text-teal-800 dark:text-teal-400',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 rounded-lg px-3.5 text-xs',
        lg: 'h-12 px-7 rounded-lg text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
