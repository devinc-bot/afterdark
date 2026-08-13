import { startTransition, useEffect, useState, type MouseEvent } from 'react'
import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Button,
  Link,
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  AppLogo,
  Skeleton,
  cn,
  ThemeToggle,
  linkVariants,
} from '@repo/ui'
import { UserMenu } from '~/modules/common/components/user-menu'
import { LanguageToggle } from '~/modules/common/components/language-toggle'
import { Container } from '~/modules/common/components/container'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import { useSession } from '~/modules/common/hooks/use-session'
import {
  LANDING_CTA_PRIMARY,
  LANDING_FOCUS_RING,
  LANDING_FOCUS_RING_ON_MEDIA,
} from '~/modules/landing/constants/layout'
import {
  handleSectionNavClick,
  sectionIdFromHash,
} from '~/modules/landing/utils/scroll-to-section.utils'

/** Attendee path first. Organizer path lives in #organizadores + footer. */
const LANDING_SECTION_NAV = [
  { href: '#como-funciona', labelKey: 'nav.how' },
  { href: '#claridad', labelKey: 'nav.clarity' },
] as const

export function LandingHeader() {
  const { t } = useTranslation('landing')
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { user, isAuthenticated, isLoading } = useSession()
  const [navSolid, setNavSolid] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const showAuthChrome = !isLoading && isAuthenticated
  const showAuthCtas = !isLoading && !isAuthenticated
  const isLanding = pathname === WEB_ROUTES.home()
  // Non-landing public pages have no hero media — keep chrome solid for separation.
  const chromeSolid = navSolid || !isLanding
  const onMedia = !chromeSolid
  const focusRing = onMedia ? LANDING_FOCUS_RING_ON_MEDIA : LANDING_FOCUS_RING

  const navLink = cn(
    'inline-flex min-h-11 items-center rounded-app px-2.5 font-label text-sm transition-colors duration-(--duration-instant) ease-emphasized',
    onMedia
      ? 'text-white/75 hover:text-white aria-[current=page]:text-white'
      : 'text-on-surface-variant hover:text-on-surface aria-[current=page]:text-on-surface',
    focusRing
  )
  const authLink = cn(
    'hidden min-h-11 items-center transition-colors duration-(--duration-instant) ease-emphasized sm:inline-flex',
    onMedia ? 'text-white/80 hover:text-white' : 'text-on-surface-variant hover:text-on-surface',
    focusRing
  )
  const iconButton = cn(
    'size-11 shrink-0 rounded-app',
    onMedia ? 'text-white hover:bg-white/10 hover:text-white' : 'text-on-surface'
  )

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 40
      startTransition(() => setNavSolid(next))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const displayName = user ? `${user.name} ${user.lastName}`.trim() || user.email : ''

  const onSectionClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isLanding) {
      handleSectionNavClick(event, href)
      return
    }
    event.preventDefault()
    void navigate({ to: WEB_ROUTES.home(), hash: sectionIdFromHash(href) })
  }

  const onMobileSectionClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    onSectionClick(event, href)
    setMenuOpen(false)
  }

  return (
    // No VT name: it isolates stacking and breaks backdrop-blur on the glass bar.
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 pt-4 sm:pt-5">
      <Container>
        <div
          className={cn(
            'pointer-events-auto flex h-15 w-full items-center justify-between gap-2 rounded-app-lg px-4 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-(--duration-normal) ease-emphasized motion-reduce:transition-none sm:gap-3 sm:px-4',
            chromeSolid
              ? 'border border-hairline/20 bg-surface-container-low/70 glass-panel backdrop-blur-xl backdrop-saturate-150 supports-backdrop-filter:bg-surface-container-low/55'
              : 'border border-white/10 bg-black/25 shadow-none backdrop-blur-md backdrop-saturate-125 supports-backdrop-filter:bg-black/15'
          )}
        >
          <Link
            to={WEB_ROUTES.home()}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-app px-0 transition-opacity duration-(--duration-instant) ease-emphasized hover:opacity-80',
              onMedia ? 'text-white' : 'text-on-surface',
              focusRing
            )}
          >
            <AppLogo />
            <span className="font-display text-sm font-bold tracking-tight sm:text-base">
              {t('nav.brand')}
            </span>
          </Link>

          <nav aria-label={t('nav.ariaLabel')} className="hidden items-center gap-0.5 md:flex">
            <Link to={WEB_ROUTES.events()} className={navLink}>
              {t('nav.events')}
            </Link>
            {showAuthChrome ? (
              <>
                <Link to={WEB_ROUTES.tickets()} className={navLink}>
                  {t('nav.tickets')}
                </Link>
                <Link to={WEB_ROUTES.orders()} className={navLink}>
                  {t('nav.orders')}
                </Link>
              </>
            ) : (
              LANDING_SECTION_NAV.map((item) => (
                <a
                  key={item.href}
                  href={isLanding ? item.href : `${WEB_ROUTES.home()}${item.href}`}
                  onClick={(event) => onSectionClick(event, item.href)}
                  className={navLink}
                >
                  {t(item.labelKey)}
                </a>
              ))
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <LanguageToggle className={iconButton} />
            <ThemeToggle className={iconButton} />
            {isLoading ? (
              <Skeleton
                className={cn(
                  'size-9 rounded-full',
                  onMedia ? 'bg-white/25' : 'bg-surface-container'
                )}
                aria-hidden
              />
            ) : showAuthChrome && user ? (
              <UserMenu
                user={user}
                ariaLabel={t('nav.accountAria', { name: displayName })}
                settingsHref={WEB_ROUTES.settings()}
              />
            ) : (
              <>
                <Link to={WEB_ROUTES.login()} size="sm" className={authLink}>
                  {t('nav.login')}
                </Link>
                <Link
                  to={WEB_ROUTES.register()}
                  size="sm"
                  className={cn(
                    'hidden h-11 min-h-11 px-4 sm:inline-flex',
                    onMedia ? 'bg-white text-black hover:bg-white/90' : LANDING_CTA_PRIMARY
                  )}
                >
                  {t('nav.register')}
                </Link>
              </>
            )}

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(iconButton, 'md:hidden')}
                  aria-label={t('nav.openMenu')}
                  aria-expanded={menuOpen}
                >
                  <Menu className="size-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                closeLabel={t('nav.closeMenu')}
                overlayClassName="bg-surface-strong/50 backdrop-blur-sm"
                className="inset-y-3 right-3 flex h-auto max-h-[calc(100dvh-1.5rem)] w-[min(calc(100%-1.5rem),20rem)] flex-col gap-0 overflow-hidden rounded-app-xl border border-hairline/50 bg-background p-0 text-on-surface shadow-(--shadow-glass)"
              >
                <SheetHeader className="shrink-0 border-b border-hairline/40 px-5 py-5 pr-14 text-left">
                  <SheetTitle className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
                    <AppLogo />
                    {t('nav.brand')}
                  </SheetTitle>
                </SheetHeader>

                <nav
                  aria-label={t('nav.mobileAriaLabel')}
                  className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
                >
                  <SheetClose asChild>
                    <Link
                      to={WEB_ROUTES.events()}
                      variant="ghost"
                      className={cn(LANDING_FOCUS_RING)}
                    >
                      {t('nav.events')}
                    </Link>
                  </SheetClose>
                  {showAuthChrome ? (
                    <>
                      <SheetClose asChild>
                        <Link
                          to={WEB_ROUTES.tickets()}
                          variant="ghost"
                          className={cn(LANDING_FOCUS_RING)}
                        >
                          {t('nav.tickets')}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to={WEB_ROUTES.orders()}
                          variant="ghost"
                          className={cn(LANDING_FOCUS_RING)}
                        >
                          {t('nav.orders')}
                        </Link>
                      </SheetClose>
                    </>
                  ) : (
                    LANDING_SECTION_NAV.map((item) => (
                      <a
                        key={item.href}
                        href={isLanding ? item.href : `${WEB_ROUTES.home()}${item.href}`}
                        onClick={(event) => onMobileSectionClick(event, item.href)}
                        className={cn(linkVariants({ variant: 'ghost' }), LANDING_FOCUS_RING)}
                      >
                        {t(item.labelKey)}
                      </a>
                    ))
                  )}
                </nav>

                {showAuthCtas ? (
                  <div className="mt-auto flex shrink-0 gap-2 border-t border-hairline/40 px-5 py-5">
                    <SheetClose asChild>
                      <Link
                        to={WEB_ROUTES.login()}
                        variant="outline"
                        size="lg"
                        className="min-h-11 flex-1 rounded-app hover:text-on-surface"
                      >
                        {t('nav.login')}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to={WEB_ROUTES.register()}
                        size="lg"
                        className={cn('flex-1', LANDING_CTA_PRIMARY)}
                      >
                        {t('nav.register')}
                      </Link>
                    </SheetClose>
                  </div>
                ) : null}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </header>
  )
}
