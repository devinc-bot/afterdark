import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Button, cn, useSidebar } from '@afterdark/ui'

type ClubFormPageLayoutProps = {
  title: string
  description: string
  onBack: () => void
  footer: React.ReactNode
  children: React.ReactNode
}

export function ClubFormPageLayout({
  title,
  description,
  onBack,
  footer,
  children,
}: ClubFormPageLayoutProps) {
  const { t } = useTranslation('clubs')
  const { state, isMobile } = useSidebar()
  const sidebarExpanded = !isMobile && state === 'expanded'

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 sm:px-8 sm:py-8 sm:pb-28">
        <header className="mb-8 flex flex-col gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit gap-2 px-0 text-ink-muted hover:text-ink"
            onClick={onBack}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t('formPage.back')}
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

      <footer
        className={cn(
          'fixed bottom-0 left-0 right-0 z-20 border-t border-hairline bg-background',
          sidebarExpanded && 'md:left-[var(--sidebar-width)]'
        )}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:justify-end sm:px-8">
          {footer}
        </div>
      </footer>
    </>
  )
}
