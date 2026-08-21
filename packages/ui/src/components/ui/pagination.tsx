import * as React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button, type ButtonProps } from './button.tsx'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
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
      className={cn('flex flex-wrap items-center justify-center gap-1.5', className)}
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
      variant={variant ?? 'ghost'}
      size={size}
      className={cn(
        'min-h-11 min-w-11 text-ink-muted hover:bg-surface-strong hover:text-ink',
        isActive &&
          'bg-primary-container font-semibold text-on-primary-container hover:bg-primary-container/85 hover:text-on-primary-container',
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
  text = 'Previous',
  ...props
}: PaginationButtonProps & { text?: string }) {
  return (
    <PaginationButton
      aria-label={text}
      size="sm"
      className={cn('gap-1 px-3 sm:min-w-0', className)}
      iconLeft={<ChevronLeft aria-hidden="true" />}
      {...props}
    >
      <span className="hidden sm:inline">{text}</span>
    </PaginationButton>
  )
}

function PaginationNext({
  className,
  text = 'Next',
  ...props
}: PaginationButtonProps & { text?: string }) {
  return (
    <PaginationButton
      aria-label={text}
      size="sm"
      className={cn('gap-1 px-3 sm:min-w-0', className)}
      iconRight={<ChevronRight aria-hidden="true" />}
      {...props}
    >
      <span className="hidden sm:inline">{text}</span>
    </PaginationButton>
  )
}

function PaginationEllipsis({
  className,
  label = 'More pages',
  ...props
}: React.ComponentProps<'span'> & { label?: string }) {
  return (
    <span
      role="separator"
      aria-label={label}
      data-slot="pagination-ellipsis"
      className={cn(
        'flex size-11 items-center justify-center text-ink-muted [&_svg]:size-4',
        className
      )}
      {...props}
    >
      <MoreHorizontal aria-hidden="true" />
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
