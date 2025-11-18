import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md',
        secondary:
          'bg-blue-100 text-blue-900 hover:bg-blue-200 active:bg-blue-300 dark:bg-blue-950 dark:text-blue-100 dark:hover:bg-blue-900',
        outline:
          'border-2 border-blue-300 text-blue-700 hover:bg-blue-50 active:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950 dark:active:bg-blue-900',
        ghost:
          'text-blue-600 hover:bg-blue-100 active:bg-blue-200 dark:text-blue-400 dark:hover:bg-blue-950 dark:active:bg-blue-900',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
        link: 'text-blue-600 underline-offset-4 hover:underline dark:text-blue-400',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-12 px-6 rounded-lg',
        icon: 'h-10 w-10',
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
