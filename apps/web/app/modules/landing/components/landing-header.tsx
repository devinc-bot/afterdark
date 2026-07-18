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
  cn,
} from '@afterdark/ui'
import { COOKIE_KEYS } from '~/modules/common/constants/cookies'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import { useSession } from '~/modules/common/hooks/use-session'
import { getUserInitials } from '../utils/user-initials.utils'
import { handleSectionNavClick } from '../utils/scroll-to-section.utils'

const SHELL = 'mx-auto max-w-7xl px-margin-mobile sm:px-8 lg:px-margin-desktop'
const NAV_LINK =
  'inline-flex min-h-10 items-center font-label text-sm text-on-surface-variant transition-colors duration-(--duration-instant) ease-emphasized hover:text-on-surface focus-visible:rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink'
const NAV_LINK_STATIC =
  'inline-flex min-h-10 cursor-default items-center font-label text-sm text-on-surface-variant'
const MOBILE_LINK =
  'flex min-h-12 w-full items-center rounded-xl px-3 font-label text-base text-on-surface transition-colors duration-(--duration-instant) ease-emphasized hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink'

const LANDING_NAV = [
  { href: '#como-funciona', labelKey: 'nav.how' },
  { href: '#claridad', labelKey: 'nav.clarity' },
  { href: '#eventos', labelKey: 'nav.events' },
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
      <div className={SHELL}>
        <div
          className={cn(
            'pointer-events-auto flex h-14 w-full items-center justify-between gap-2 rounded-full px-3 pl-5 shadow-none transition-[background-color,border-color,box-shadow,backdrop-filter] duration-(--duration-normal) ease-emphasized motion-reduce:transition-none sm:gap-3 sm:px-4 sm:pl-6',
            navSolid
              ? 'border border-hairline/50 bg-background/85 shadow-glass backdrop-blur-md'
              : 'border border-white/10 bg-background/25 backdrop-blur-sm'
          )}
        >
          <a
            href="#inicio"
            onClick={(event) => handleSectionNavClick(event, '#inicio')}
            className="shrink-0 font-display text-sm font-bold tracking-tight text-on-surface transition-colors duration-(--duration-instant) ease-emphasized hover:text-primary focus-visible:rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink sm:text-base"
          >
            {t('nav.brand')}
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
                  className={cn(NAV_LINK, 'rounded-full px-2.5')}
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
                  variant="ghost"
                  size="sm"
                  className="hidden min-h-10 rounded-full text-on-surface sm:inline-flex"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to={WEB_ROUTES.register()}
                  variant="default"
                  size="sm"
                  className="hidden min-h-10 rounded-full sm:inline-flex"
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
                  className="size-10 shrink-0 rounded-full text-on-surface md:hidden"
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
                  <SheetTitle className="font-display text-lg font-bold tracking-tight">
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
                        className="min-h-11 w-full rounded-lg"
                      >
                        {t('nav.login')}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to={WEB_ROUTES.register()}
                        variant="default"
                        size="lg"
                        className="min-h-11 w-full rounded-lg"
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
