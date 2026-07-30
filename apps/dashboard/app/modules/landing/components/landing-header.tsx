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
  ThemeToggle,
  cn,
  linkVariants,
} from '@repo/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { LanguageToggle } from '~/modules/common/components/language-toggle'
import { handleSectionNavClick } from '../utils/scroll-to-section.utils'

const LANDING_NAV = [
  { hash: '#features', labelKey: 'header.features' },
  { hash: '#how', labelKey: 'header.how' },
  { hash: '#audiences', labelKey: 'header.audiences' },
  { hash: '#faq', labelKey: 'header.faq' },
] as const

const NAV_LINK =
  'inline-flex min-h-10 items-center rounded-full px-3 font-label text-sm text-on-surface-variant transition-colors duration-(--duration-instant) ease-emphasized hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25'
const MOBILE_LINK = 'justify-start'
const ICON_BUTTON = 'size-10 shrink-0'

export function LandingHeader() {
  const { t } = useTranslation('dashboardLanding')
  const [menuOpen, setMenuOpen] = useState(false)

  const onMobileNavClick = (event: MouseEvent<HTMLAnchorElement>, hash: string) => {
    handleSectionNavClick(event, hash)
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-hairline/60 bg-background/85 backdrop-blur-md">
      <nav
        aria-label={t('header.navAria')}
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-margin-mobile md:px-margin-desktop"
      >
        <Link to={DASHBOARD_ROUTES.home()} className="flex shrink-0 items-center gap-2">
          <AppLogo size="lg" />
          <span className="font-display text-lg font-bold tracking-tight text-on-surface">
            {t('header.brand')}
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex">
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

        <div className="hidden shrink-0 items-center gap-1 lg:flex lg:gap-2">
          <LanguageToggle className={ICON_BUTTON} />
          <ThemeToggle className={ICON_BUTTON} />
          <Button asChild variant="ghost" size="sm">
            <Link to={DASHBOARD_ROUTES.login()}>{t('header.login')}</Link>
          </Button>
          <Button asChild size="sm">
            <Link to={DASHBOARD_ROUTES.register()}>{t('header.register')}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <LanguageToggle className={ICON_BUTTON} />
          <ThemeToggle className={ICON_BUTTON} />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10 shrink-0"
                aria-label={t('header.openMenu')}
              >
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              overlayClassName="bg-surface-strong/50 backdrop-blur-sm"
              className="inset-y-3 right-3 flex h-auto max-h-[calc(100dvh-1.5rem)] w-[min(calc(100%-1.5rem),20rem)] flex-col gap-0 overflow-hidden rounded-app-xl border border-hairline/60 bg-background p-0 text-on-surface shadow-(--shadow-glass)"
            >
              <SheetHeader className="shrink-0 border-b border-hairline/60 px-5 py-5 pr-14 text-left">
                <SheetTitle className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
                  <AppLogo size="lg" />
                  {t('header.brand')}
                </SheetTitle>
              </SheetHeader>

              <nav
                aria-label={t('header.mobileAriaLabel')}
                className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
              >
                {LANDING_NAV.map((item) => (
                  <a
                    key={item.hash}
                    href={item.hash}
                    onClick={(event) => onMobileNavClick(event, item.hash)}
                    className={cn(linkVariants({ variant: 'ghost' }), MOBILE_LINK)}
                  >
                    {t(item.labelKey)}
                  </a>
                ))}
              </nav>

              <div className="mt-auto flex shrink-0 gap-2 border-t border-hairline/60 px-5 py-5">
                <SheetClose asChild>
                  <Button asChild variant="outline" size="lg" className="flex-1">
                    <Link to={DASHBOARD_ROUTES.login()}>{t('header.login')}</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild size="lg" className="flex-1">
                    <Link to={DASHBOARD_ROUTES.register()}>{t('header.register')}</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
