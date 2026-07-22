import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@afterdark/ui'

type TicketAuthoringShellProps = {
  title: string
  description: string
  backLabel: string
  onBack: () => void
  children: ReactNode
}

export function TicketAuthoringShell({
  title,
  description,
  backLabel,
  onBack,
  children,
}: TicketAuthoringShellProps) {
  return (
    <main className="bg-background px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-4">
          <Button
            type="button"
            variant="link"
            size="sm"
            className="w-fit gap-2 px-0 text-ink-muted hover:text-ink"
            onClick={onBack}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {backLabel}
          </Button>
          <div className="max-w-2xl">
            <h1 className="text-balance font-heading text-2xl font-bold text-ink sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-pretty text-base text-ink-muted">{description}</p>
          </div>
        </header>

        {children}
      </div>
    </main>
  )
}
