import { useState, type MouseEvent } from 'react'
import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import {
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  AppLogo,
  cn,
} from '@repo/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { handleSectionNavClick } from '../utils/scroll-to-section.utils'

const LANDING_NAV = [
  { hash: '#features', labelKey: 'header.features' },
  { hash: '#how', labelKey: 'header.how' },
  { hash: '#audiences', labelKey: 'header.audiences' },
  { hash: '#faq', labelKey: 'header.faq' },
] as const

const NAV_LINK =
  'inline-flex min-h-10 items-center rounded-full px-3 font-label text-sm text-on-surface-variant transition-colors duration-(--duration-instant) ease-emphasized hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25'
const MOBILE_LINK =
  'flex min-h-12 w-full items-center rounded-xl px-3 font-label text-base text-on-surface transition-colors duration-(--duration-instant) ease-emphasized hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25'

export function LandingHeader() {
  const { t } = useTranslation('dashboardLanding')
  const [menuOpen, setMenuOpen] = useState(false)

  const onMobileNavClick = (event: MouseEvent<HTMLAnchorElement>, hash: string) => {
    handleSectionNavClick(event, hash)
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-hairline/60 bg-background/80 backdrop-blur-md">
      <nav
        aria-label={t('header.navAria')}
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-margin-mobile md:px-margin-desktop"
      >
        <Link to={DASHBOARD_ROUTES.home()} className="flex shrink-0 items-center gap-2">
          <AppLogo size="lg" />
          <span className="font-display text-lg font-bold tracking-tight text-on-surface">
            {t('header.brand')}
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          {LANDING_NAV.map((item) => (
            <a
              key={item.hash}
              href={item.hash}
              onClick={(event) => handleSectionNavClick(event, item.hash)}
              className={cn(NAV_LINK)}
            >
              {t(item.labelKey)}
            </a>
          ))}
        </div>

        <div className="hidden shrink-0 items-center gap-2 md:flex lg:gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to={DASHBOARD_ROUTES.login()}>{t('header.login')}</Link>
          </Button>
          <Button asChild size="sm">
            <Link to={DASHBOARD_ROUTES.register()}>{t('header.register')}</Link>
          </Button>
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 md:hidden"
              aria-label={t('header.openMenu')}
            >
              <Menu className="size-5" aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="flex h-full w-[min(100%,20rem)] flex-col border-hairline/60 bg-background p-0 text-on-surface"
          >
            <SheetHeader className="border-b border-hairline/60 px-5 py-5 text-left">
              <SheetTitle className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
                <AppLogo size="lg" />
                {t('header.brand')}
              </SheetTitle>
            </SheetHeader>

            <nav aria-label={t('header.mobileAriaLabel')} className="flex flex-col gap-1 px-3 py-4">
              {LANDING_NAV.map((item) => (
                <a
                  key={item.hash}
                  href={item.hash}
                  onClick={(event) => onMobileNavClick(event, item.hash)}
                  className={MOBILE_LINK}
                >
                  {t(item.labelKey)}
                </a>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-2 border-t border-hairline/60 px-5 py-5">
              <SheetClose asChild>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link to={DASHBOARD_ROUTES.login()}>{t('header.login')}</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild size="lg" className="w-full">
                  <Link to={DASHBOARD_ROUTES.register()}>{t('header.register')}</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
