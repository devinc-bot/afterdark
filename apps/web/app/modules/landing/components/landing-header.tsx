import { useEffect, useState, type MouseEvent } from 'react'
import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
import { handleSectionNavClick } from '../utils/scroll-to-section.utils'

const NAV_LINK = cn(
  'inline-flex min-h-10 items-center rounded-lg px-2.5 font-label text-sm text-on-surface-variant transition-colors duration-(--duration-instant) ease-emphasized hover:text-on-surface',
  LANDING_FOCUS_RING
)
const NAV_LINK_STATIC =
  'inline-flex min-h-10 cursor-default items-center px-2.5 font-label text-sm text-on-surface-variant'
const MOBILE_LINK = cn(
  'flex min-h-12 w-full items-center rounded-lg px-3 font-label text-base text-on-surface transition-colors duration-(--duration-instant) ease-emphasized hover:bg-surface-container',
  LANDING_FOCUS_RING
)

/** Attendee path first. Organizer CTA lives in the footer only. */
const LANDING_NAV = [
  { href: '#eventos', labelKey: 'nav.events' },
  { href: '#como-funciona', labelKey: 'nav.how' },
  { href: '#claridad', labelKey: 'nav.clarity' },
] as const

export function LandingHeader() {
  const { t } = useTranslation('landing')
  const { user, isAuthenticated, isLoading } = useSession()
  const [navSolid, setNavSolid] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const hasToken = getCookieSync({ name: COOKIE_KEYS.accessToken }) !== null
  const showAuthChrome = isAuthenticated || (isLoading && hasToken)
  const showAuthCtas = !showAuthChrome

  useEffect(() => {
    const onScroll = () => {
      setNavSolid(window.scrollY > 40)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const displayName = user ? `${user.name} ${user.lastName}`.trim() || user.email : ''
  const initials = user ? getUserInitials(user.name, user.lastName) : ''

  const onMobileSectionClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    handleSectionNavClick(event, href)
    setMenuOpen(false)
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 pt-4 sm:pt-5">
      <div className={LANDING_SHELL}>
        <div
          className={cn(
            'pointer-events-auto flex h-14 w-full items-center justify-between gap-2 rounded-lg px-3 pl-5 transition-[background-color,border-color] duration-(--duration-normal) ease-emphasized motion-reduce:transition-none sm:gap-3 sm:px-4 sm:pl-6',
            navSolid
              ? 'border border-hairline/50 bg-background'
              : 'border border-transparent bg-transparent'
          )}
        >
          <a
            href="#inicio"
            onClick={(event) => handleSectionNavClick(event, '#inicio')}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-lg text-on-surface transition-opacity duration-(--duration-instant) ease-emphasized hover:opacity-80',
              LANDING_FOCUS_RING
            )}
          >
            <AppLogo />
            <span className="font-display text-sm font-bold tracking-tight sm:text-base">
              {t('nav.brand')}
            </span>
          </a>

          <nav aria-label={t('nav.ariaLabel')} className="hidden items-center gap-0.5 md:flex">
            {showAuthChrome ? (
              <>
                <span className={cn(NAV_LINK_STATIC, 'px-2.5')} aria-disabled="true">
                  {t('nav.events')}
                </span>
                <span className={cn(NAV_LINK_STATIC, 'px-2.5')} aria-disabled="true">
                  {t('nav.tickets')}
                </span>
              </>
            ) : (
              LANDING_NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(event) => handleSectionNavClick(event, item.href)}
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
                  className="flex size-10 items-center justify-center"
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
                <Link
                  to={WEB_ROUTES.login()}
                  size="sm"
                  className="hidden min-h-10 rounded-lg text-on-surface-variant sm:inline-flex hover:text-on-surface"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to={WEB_ROUTES.register()}
                  size="sm"
                  className={cn('hidden px-4 sm:inline-flex', LANDING_CTA_PRIMARY)}
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
                  className="size-10 shrink-0 rounded-lg text-on-surface md:hidden"
                  aria-label={t('nav.openMenu')}
                >
                  <Menu className="size-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex h-full w-[min(100%,20rem)] flex-col border-hairline/50 bg-background p-0 text-on-surface"
              >
                <SheetHeader className="border-b border-hairline/40 px-5 py-5 text-left">
                  <SheetTitle className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
                    <AppLogo />
                    {t('nav.brand')}
                  </SheetTitle>
                </SheetHeader>

                <nav
                  aria-label={t('nav.mobileAriaLabel')}
                  className="flex flex-col gap-1 px-3 py-4"
                >
                  {showAuthChrome ? (
                    <>
                      <span
                        className={cn(MOBILE_LINK, 'cursor-default opacity-60')}
                        aria-disabled="true"
                      >
                        {t('nav.events')}
                      </span>
                      <span
                        className={cn(MOBILE_LINK, 'cursor-default opacity-60')}
                        aria-disabled="true"
                      >
                        {t('nav.tickets')}
                      </span>
                    </>
                  ) : (
                    LANDING_NAV.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
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
                        className="min-h-11 w-full rounded-lg hover:text-on-surface"
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
