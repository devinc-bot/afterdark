import { startTransition, useEffect, useState, type MouseEvent } from 'react'
import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { getCookieSync } from '@afterdark/common'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Link,
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  AppLogo,
  cn,
} from '@afterdark/ui'
import { COOKIE_KEYS } from '~/modules/common/constants/cookies'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import { useSession } from '~/modules/common/hooks/use-session'
import { getUserInitials } from '../utils/user-initials.utils'
import { LANDING_CTA_PRIMARY, LANDING_FOCUS_RING, LANDING_SHELL } from '../constants/layout'
import { handleSectionNavClick, sectionIdFromHash } from '../utils/scroll-to-section.utils'

const NAV_LINK = cn(
  'inline-flex min-h-11 items-center rounded-control px-2.5 font-label text-sm text-on-surface-variant transition-colors duration-(--duration-instant) ease-emphasized hover:text-on-surface aria-[current=page]:text-on-surface',
  LANDING_FOCUS_RING
)
const NAV_LINK_STATIC =
  'inline-flex min-h-11 cursor-default items-center rounded-control px-2.5 font-label text-sm text-on-surface-variant'
const MOBILE_LINK = cn(
  'flex min-h-12 w-full items-center rounded-control px-3 font-label text-base text-on-surface transition-colors duration-(--duration-instant) ease-emphasized hover:bg-surface-container aria-[current=page]:bg-surface-container',
  LANDING_FOCUS_RING
)
const AUTH_LINK = cn(
  'hidden min-h-11 items-center text-on-surface-variant transition-colors duration-(--duration-instant) ease-emphasized hover:text-on-surface sm:inline-flex',
  LANDING_FOCUS_RING
)

/** Attendee path first. Organizer CTA lives in the footer only. */
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
  const hasToken = getCookieSync({ name: COOKIE_KEYS.accessToken }) !== null
  const showAuthChrome = isAuthenticated || (isLoading && hasToken)
  const showAuthCtas = !showAuthChrome
  const isLanding = pathname === WEB_ROUTES.home()
  // Non-landing public pages have no hero media — keep chrome solid for separation.
  const chromeSolid = navSolid || !isLanding

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
  const initials = user ? getUserInitials(user.name, user.lastName) : ''

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
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 pt-4 sm:pt-5">
      <div className={LANDING_SHELL}>
        <div
          className={cn(
            'pointer-events-auto flex h-14 w-full items-center justify-between gap-2 rounded-2xl px-2 transition-[background-color,border-color,box-shadow] duration-(--duration-normal) ease-emphasized motion-reduce:transition-none sm:gap-3 sm:px-3',
            chromeSolid
              ? 'border border-hairline/50 bg-surface-container-low shadow-(--shadow-glass)'
              : 'border border-transparent bg-transparent shadow-none'
          )}
        >
          <Link
            to={WEB_ROUTES.home()}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-control px-0 text-on-surface transition-opacity duration-(--duration-instant) ease-emphasized hover:opacity-80',
              LANDING_FOCUS_RING
            )}
          >
            <AppLogo />
            <span className="font-display text-sm font-bold tracking-tight sm:text-base">
              {t('nav.brand')}
            </span>
          </Link>

          <nav aria-label={t('nav.ariaLabel')} className="hidden items-center gap-0.5 md:flex">
            <Link to={WEB_ROUTES.events()} className={NAV_LINK}>
              {t('nav.events')}
            </Link>
            {showAuthChrome ? (
              <span className={NAV_LINK_STATIC} aria-disabled="true" title={t('nav.ticketsSoon')}>
                {t('nav.tickets')}
              </span>
            ) : (
              LANDING_SECTION_NAV.map((item) => (
                <a
                  key={item.href}
                  href={isLanding ? item.href : `${WEB_ROUTES.home()}${item.href}`}
                  onClick={(event) => onSectionClick(event, item.href)}
                  className={NAV_LINK}
                >
                  {t(item.labelKey)}
                </a>
              ))
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {showAuthChrome ? (
              isAuthenticated && user ? (
                <div
                  className="flex size-11 items-center justify-center"
                  role="img"
                  aria-label={t('nav.accountAria', { name: displayName })}
                >
                  <Avatar className="size-8 shrink-0" aria-hidden="true">
                    {user.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
                    <AvatarFallback className="bg-surface-container text-xs font-medium text-on-surface">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <div
                  className="size-8 animate-pulse rounded-full bg-surface-container"
                  aria-hidden
                />
              )
            ) : (
              <>
                <Link to={WEB_ROUTES.login()} size="sm" className={AUTH_LINK}>
                  {t('nav.login')}
                </Link>
                <Link
                  to={WEB_ROUTES.register()}
                  size="sm"
                  className={cn('hidden h-11 min-h-11 px-4 sm:inline-flex', LANDING_CTA_PRIMARY)}
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
                  className="size-11 shrink-0 rounded-control text-on-surface md:hidden"
                  aria-label={t('nav.openMenu')}
                  aria-expanded={menuOpen}
                >
                  <Menu className="size-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                closeLabel={t('nav.closeMenu')}
                className="flex h-full w-[min(100%,20rem)] flex-col border-hairline/50 bg-background p-0 text-on-surface"
              >
                <SheetHeader className="border-b border-hairline/40 px-5 py-5 pr-14 text-left">
                  <SheetTitle className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
                    <AppLogo />
                    {t('nav.brand')}
                  </SheetTitle>
                </SheetHeader>

                <nav
                  aria-label={t('nav.mobileAriaLabel')}
                  className="flex flex-col gap-1 px-3 py-4"
                >
                  <SheetClose asChild>
                    <Link to={WEB_ROUTES.events()} className={MOBILE_LINK}>
                      {t('nav.events')}
                    </Link>
                  </SheetClose>
                  {showAuthChrome ? (
                    <span
                      className={cn(MOBILE_LINK, 'cursor-default opacity-60')}
                      aria-disabled="true"
                      title={t('nav.ticketsSoon')}
                    >
                      {t('nav.tickets')}
                    </span>
                  ) : (
                    LANDING_SECTION_NAV.map((item) => (
                      <a
                        key={item.href}
                        href={isLanding ? item.href : `${WEB_ROUTES.home()}${item.href}`}
                        onClick={(event) => onMobileSectionClick(event, item.href)}
                        className={MOBILE_LINK}
                      >
                        {t(item.labelKey)}
                      </a>
                    ))
                  )}
                </nav>

                {showAuthCtas ? (
                  <div className="mt-auto flex flex-col gap-2 border-t border-hairline/40 px-5 py-5">
                    <SheetClose asChild>
                      <Link
                        to={WEB_ROUTES.login()}
                        variant="outline"
                        size="lg"
                        className="min-h-11 w-full rounded-control hover:text-on-surface"
                      >
                        {t('nav.login')}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to={WEB_ROUTES.register()}
                        size="lg"
                        className={cn('w-full', LANDING_CTA_PRIMARY)}
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
      </div>
    </header>
  )
}
