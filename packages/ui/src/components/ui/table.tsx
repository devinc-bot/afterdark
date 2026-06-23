import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const tableVariants = cva('w-full caption-bottom text-ink', {
  variants: {
    variant: {
      default: 'text-base',
      compact: 'text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type TableVariant = NonNullable<VariantProps<typeof tableVariants>['variant']>

const TableVariantContext = React.createContext<TableVariant>('default')

function useTableVariant() {
  return React.useContext(TableVariantContext)
}

interface TableProps extends React.ComponentProps<'table'>, VariantProps<typeof tableVariants> {}

function Table({ className, variant = 'default', ...props }: TableProps) {
  return (
    <TableVariantContext.Provider value={variant ?? 'default'}>
      <div data-slot="table-container" className="relative w-full overflow-x-auto">
        <table
          data-slot="table"
          data-variant={variant}
          className={cn(tableVariants({ variant }), className)}
          {...props}
        />
      </div>
    </TableVariantContext.Provider>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        '[&_tr]:border-b [&_tr]:border-hairline [&_tr]:hover:bg-transparent',
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-hairline', className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'border-t border-hairline bg-surface-container-low font-medium text-ink [&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'transition-colors hover:bg-surface-container-low/40 has-aria-expanded:bg-surface-container-low data-[state=selected]:bg-surface-container-low',
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  const variant = useTableVariant()

  return (
    <th
      data-slot="table-head"
      className={cn(
        'text-left align-middle font-label font-semibold uppercase tracking-label-xs text-ink-muted whitespace-nowrap [&:has([role=checkbox])]:pr-0',
        variant === 'compact' ? 'h-9 px-3 py-2 text-[10px]' : 'h-auto px-4 py-3 text-xs',
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  const variant = useTableVariant()

  return (
    <td
      data-slot="table-cell"
      className={cn(
        'align-middle whitespace-nowrap text-ink [&:has([role=checkbox])]:pr-0',
        variant === 'compact' ? 'px-3 py-3' : 'px-4 py-4',
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-sm text-ink-muted', className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  tableVariants,
}
