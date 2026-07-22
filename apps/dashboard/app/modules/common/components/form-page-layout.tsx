import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button, cn, useSidebar } from '@afterdark/ui'

type FormPageLayoutProps = {
  title: string
  description: string
  backLabel: string
  onBack: () => void
  footer?: ReactNode
  footerBanner?: ReactNode
  children: ReactNode
}

export function FormPageLayout({
  title,
  description,
  backLabel,
  onBack,
  footer,
  footerBanner,
  children,
}: FormPageLayoutProps) {
  const { state, isMobile } = useSidebar()
  const sidebarExpanded = !isMobile && state === 'expanded'
  const hasFooter = Boolean(footer) || Boolean(footerBanner)

  return (
    <>
      <div
        className={cn(
          'mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-8',
          hasFooter && 'pb-24 sm:pb-28'
        )}
      >
        <header className="mb-8 flex flex-col gap-4">
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

      {hasFooter ? (
        <footer
          className={cn(
            'fixed bottom-0 left-0 right-0 z-20 border-t border-hairline bg-background',
            sidebarExpanded && 'md:left-[var(--sidebar-width)]'
          )}
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-8">
            {footerBanner ? <div className="mb-3">{footerBanner}</div> : null}
            {footer}
          </div>
        </footer>
      ) : null}
    </>
  )
}
