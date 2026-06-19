import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

const FORM_LAYOUT_SPAN = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
} as const

export type FormLayoutSpanSize = keyof typeof FORM_LAYOUT_SPAN

export interface FormLayoutProps {
  children: ReactNode
  className?: string
}

export interface FormLayoutSpanProps {
  children: ReactNode
  span?: FormLayoutSpanSize
  className?: string
}

function FormLayoutRoot({ children, className }: FormLayoutProps) {
  return <div className={cn('grid grid-cols-12', className)}>{children}</div>
}

function FormLayoutSpan({ children, span = 12, className }: FormLayoutSpanProps) {
  return <div className={cn(FORM_LAYOUT_SPAN[span], className)}>{children}</div>
}

export const FormLayout = Object.assign(FormLayoutRoot, {
  Span: FormLayoutSpan,
})
