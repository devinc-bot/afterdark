import * as React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button, type ButtonProps } from './button.tsx'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn('flex w-full items-center justify-center', className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-wrap items-center justify-center gap-1', className)}
      {...props}
    />
  )
}

function PaginationItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" className={cn('list-none', className)} {...props} />
}

type PaginationButtonProps = ButtonProps & {
  isActive?: boolean
}

function PaginationButton({
  className,
  isActive = false,
  size = 'icon',
  variant,
  ...props
}: PaginationButtonProps) {
  return (
    <Button
      type="button"
      variant={variant ?? (isActive ? 'outline' : 'ghost')}
      size={size}
      className={cn(
        'min-w-10 text-ink-muted hover:text-ink',
        isActive &&
          'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
        className
      )}
      aria-current={isActive ? 'page' : undefined}
      data-active={isActive}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  text = 'Anterior',
  ...props
}: PaginationButtonProps & { text?: string }) {
  return (
    <PaginationButton
      aria-label="Ir a la página anterior"
      size="sm"
      className={cn('gap-1 px-3', className)}
      iconLeft={<ChevronLeft aria-hidden="true" />}
      {...props}
    >
      <span className="hidden sm:inline">{text}</span>
    </PaginationButton>
  )
}

function PaginationNext({
  className,
  text = 'Siguiente',
  ...props
}: PaginationButtonProps & { text?: string }) {
  return (
    <PaginationButton
      aria-label="Ir a la página siguiente"
      size="sm"
      className={cn('gap-1 px-3', className)}
      iconRight={<ChevronRight aria-hidden="true" />}
      {...props}
    >
      <span className="hidden sm:inline">{text}</span>
    </PaginationButton>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        'flex size-10 items-center justify-center text-ink-muted [&_svg]:size-4',
        className
      )}
      {...props}
    >
      <MoreHorizontal aria-hidden="true" />
      <span className="sr-only">Más páginas</span>
    </span>
  )
}

export {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
}
