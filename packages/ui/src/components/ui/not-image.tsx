import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { ImageOff } from 'lucide-react'
import { cn } from '../../lib/utils'

const notImageVariants = cva(
  'flex shrink-0 items-center justify-center rounded-lg border border-hairline bg-surface-container-high text-ink-muted-soft',
  {
    variants: {
      size: {
        sm: 'size-16 [&_svg]:size-6',
        md: 'size-20 [&_svg]:size-8',
        lg: 'size-32 [&_svg]:size-10',
        full: 'size-full min-h-24 [&_svg]:size-10',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface NotImageProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof notImageVariants> {
  label?: string
}

function NotImage({ className, size, label = 'Sin imagen', ...props }: NotImageProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(notImageVariants({ size }), className)}
      {...props}
    >
      <ImageOff aria-hidden="true" />
    </div>
  )
}

export { NotImage, notImageVariants }
