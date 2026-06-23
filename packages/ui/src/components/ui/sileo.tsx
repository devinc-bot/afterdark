import type { ComponentProps } from 'react'
import { Toaster as SileoToaster, type SileoOptions } from 'sileo'

const defaultToastOptions = {
  fill: 'var(--color-surface-container-high)',
  roundness: 16,
  styles: {
    title: 'font-label text-sm font-medium !text-white text-ink',
    description: 'text-sm text-ink-muted text-white',
  },
} satisfies Partial<SileoOptions>

type ToasterProps = ComponentProps<typeof SileoToaster>

function Toaster({ options, theme = 'dark', ...props }: ToasterProps) {
  return <SileoToaster theme={theme} options={{ ...defaultToastOptions, ...options }} {...props} />
}

export { Toaster, defaultToastOptions }
