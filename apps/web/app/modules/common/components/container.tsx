import { createElement, type ElementType, type ReactNode } from 'react'
import { cn } from '@repo/ui'

type ContainerProps = {
  children: ReactNode
  className?: string
  as?: ElementType
} & Record<string, unknown>

/** Shared max-width + horizontal padding for public app pages. */
export function Container({ children, className, as = 'div', ...rest }: ContainerProps) {
  return createElement(
    as,
    {
      ...rest,
      className: cn('mx-auto max-w-7xl px-margin-mobile sm:px-8 lg:px-margin-desktop', className),
    },
    children
  )
}
