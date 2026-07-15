import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getCookieSync } from '@afterdark/common'
import { Avatar, AvatarFallback, AvatarImage, Link, cn } from '@afterdark/ui'
import { COOKIE_KEYS } from '~/modules/common/constants/cookies'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import { useSession } from '~/modules/common/hooks/use-session'
import { LANDING_IMAGES } from '../constants/images'
import { getUserInitials } from '../utils/user-initials.utils'

const HOW_STEPS = ['1', '2', '3'] as const

const SHELL = 'mx-auto max-w-7xl px-margin-mobile sm:px-8 lg:px-margin-desktop'
const SECTION_Y = 'py-[clamp(4rem,10vw,7.5rem)]'
const HEADING =
  'font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-tight tracking-[-0.02em] text-balance'
const NAV_LINK =
  'inline-flex min-h-10 items-center font-label text-sm text-on-surface-variant transition-colors duration-(--duration-instant) ease-emphasized hover:text-on-surface focus-visible:rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink'
const NAV_LINK_STATIC =
  'inline-flex min-h-10 cursor-default items-center font-label text-sm text-on-surface-variant'

export function LandingPage() {
  const { t } = useTranslation('landing')
  const { user, isAuthenticated, isLoading } = useSession()
  const [navSolid, setNavSolid] = useState(false)
  const year = new Date().getFullYear()
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

  return (
    <div className="bg-background text-on-surface">
      <a
        href="#contenido"
        className="absolute top-4 left-4 z-50 -translate-y-16 rounded-control bg-primary px-4 py-2.5 font-sans text-sm font-medium text-on-primary transition-transform duration-(--duration-fast) ease-emphasized focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink motion-reduce:transition-none"
      >
        {t('skipToContent')}
      </a>

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
                <>
                  <a href="#como-funciona" className={cn(NAV_LINK, 'rounded-full px-2.5')}>
                    {t('nav.how')}
                  </a>
                  <a href="#noches" className={cn(NAV_LINK, 'rounded-full px-2.5')}>
                    {t('nav.nights')}
                  </a>
                </>
              )}
            </nav>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
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
                    className="min-h-10 rounded-full"
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main id="contenido">
        <section
          id="inicio"
          className="relative min-h-dvh overflow-hidden scroll-mt-0"
          aria-labelledby="landing-brand"
        >
          <div className="absolute inset-0">
            <img
              src={LANDING_IMAGES.hero.src}
              srcSet={LANDING_IMAGES.hero.srcSet}
              sizes="100vw"
              width={2400}
              height={1600}
              alt={t('hero.imageAlt')}
              className="animate-hero-drift h-full w-full object-cover object-[center_35%]"
              fetchPriority="high"
              decoding="async"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-b from-background/55 via-background/20 to-background/95"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-r from-background/70 via-background/25 to-transparent"
            />
          </div>

          <div
            className={cn(
              SHELL,
              'relative z-10 flex min-h-dvh flex-col justify-end pb-[max(4rem,8vh)] pt-28 sm:pb-[max(5rem,10vh)]'
            )}
          >
            <div className="max-w-3xl">
              <p
                id="landing-brand"
                className="font-display text-[clamp(2.75rem,12vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-balance text-on-surface"
              >
                {t('nav.brand')}
              </p>
              <h1 className="mt-6 max-w-[18ch] font-display text-[clamp(1.5rem,4.2vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em] text-pretty text-on-surface">
                {t('hero.headline')}
              </h1>
              <p className="mt-4 max-w-[38ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
                {t('hero.support')}
              </p>
              {showAuthCtas ? (
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link to={WEB_ROUTES.register()} variant="default" size="lg" className="min-h-11">
                    {t('hero.ctaPrimary')}
                  </Link>
                  <Link
                    to={WEB_ROUTES.login()}
                    variant="outline"
                    size="lg"
                    className="min-h-11 border-white/20 bg-transparent hover:bg-white/10"
                  >
                    {t('hero.ctaSecondary')}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="about-heading"
          className="relative overflow-hidden border-t border-hairline/40"
        >
          <div className={cn(SHELL, SECTION_Y, 'grid gap-12 lg:grid-cols-12 lg:gap-16')}>
            <div className="lg:col-span-5">
              <h2 id="about-heading" className={HEADING}>
                {t('about.headline')}
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <p className="max-w-[52ch] text-lg leading-relaxed text-pretty text-on-surface-variant">
                {t('about.body')}
              </p>
            </div>
          </div>

          <div className="relative aspect-21/9 overflow-hidden sm:aspect-[2.4/1]">
            <img
              src={LANDING_IMAGES.about.src}
              srcSet={LANDING_IMAGES.about.srcSet}
              sizes="100vw"
              width={1600}
              height={900}
              alt={t('about.imageAlt')}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/60"
            />
          </div>
        </section>

        <section
          id="como-funciona"
          aria-labelledby="how-heading"
          className={cn(SHELL, SECTION_Y, 'scroll-mt-20')}
        >
          <h2 id="how-heading" className={HEADING}>
            {t('how.headline')}
          </h2>

          <ol className="mt-14 grid gap-10 border-t border-hairline/50 md:grid-cols-3 md:gap-0 md:divide-x md:divide-hairline/50">
            {HOW_STEPS.map((step) => (
              <li key={step} className="md:px-8 md:pt-10 md:first:pl-0 md:last:pr-0">
                <p className="font-label text-sm tracking-label-sm text-primary">{step}</p>
                <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-balance">
                  {t(`how.steps.${step}.title`)}
                </h3>
                <p className="mt-3 max-w-[36ch] text-base leading-relaxed text-pretty text-on-surface-variant">
                  {t(`how.steps.${step}.body`)}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="noches"
          aria-labelledby="nights-heading"
          className="scroll-mt-20 border-t border-hairline/40 bg-surface-container-lowest"
        >
          <div className={cn(SHELL, SECTION_Y)}>
            <div className="max-w-2xl">
              <h2 id="nights-heading" className={HEADING}>
                {t('nights.headline')}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
                {t('nights.support')}
              </p>
            </div>

            <ul className="mt-14 divide-y divide-hairline/45 border-t border-hairline/45">
              {LANDING_IMAGES.nights.map((night, index) => (
                <li
                  key={night.key}
                  className={cn(
                    'group grid md:items-stretch',
                    index % 2 === 0
                      ? 'md:grid-cols-[1.15fr_0.85fr]'
                      : 'md:grid-cols-[0.85fr_1.15fr]'
                  )}
                >
                  <div
                    className={cn(
                      'relative aspect-16/10 overflow-hidden sm:aspect-auto sm:min-h-64',
                      index % 2 === 1 && 'md:order-2'
                    )}
                  >
                    <img
                      src={night.src}
                      srcSet={night.srcSet}
                      sizes="(min-width: 768px) 55vw, 100vw"
                      width={1400}
                      height={900}
                      alt={t(`nights.items.${night.key}.imageAlt`)}
                      className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div
                    className={cn(
                      'flex flex-col justify-center px-0 py-8 sm:py-10 md:px-8 lg:px-10',
                      index % 2 === 1 && 'md:order-1'
                    )}
                  >
                    <p className="font-label text-sm tracking-label-sm text-on-surface-variant">
                      {t(`nights.items.${night.key}.date`)}
                    </p>
                    <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                      {t(`nights.items.${night.key}.title`)}
                    </h3>
                    <p className="mt-2 text-base text-on-surface-variant">
                      {t(`nights.items.${night.key}.venue`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="closing-heading"
          className="relative overflow-hidden border-t border-hairline/40"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_45%),radial-gradient(ellipse_at_90%_100%,color-mix(in_oklab,var(--color-inverse-primary)_14%,transparent),transparent_40%)]"
          />
          <div
            className={cn(
              SHELL,
              'relative flex flex-col items-start gap-8 py-[clamp(4.5rem,12vw,8rem)]'
            )}
          >
            <div className="max-w-2xl">
              <h2
                id="closing-heading"
                className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-[-0.03em] text-balance"
              >
                {t('closing.headline')}
              </h2>
              <p className="mt-5 max-w-[42ch] text-lg leading-relaxed text-pretty text-on-surface-variant">
                {t('closing.support')}
              </p>
            </div>
            {showAuthCtas ? (
              <div className="flex flex-wrap items-center gap-3">
                <Link to={WEB_ROUTES.register()} variant="default" size="lg" className="min-h-11">
                  {t('closing.cta')}
                </Link>
                <Link
                  to={WEB_ROUTES.login()}
                  variant="ghost"
                  size="lg"
                  className="min-h-11 text-on-surface-variant hover:text-on-surface"
                >
                  {t('nav.login')}
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline/40">
        <div
          className={cn(
            SHELL,
            'flex flex-col gap-4 py-10 sm:flex-row sm:items-end sm:justify-between'
          )}
        >
          <div>
            <p className="font-display text-lg font-bold tracking-tight">{t('nav.brand')}</p>
            <p className="mt-2 text-sm text-on-surface-variant">{t('footer.tagline')}</p>
          </div>
          <p className="text-sm text-on-surface-variant">{t('footer.rights', { year })}</p>
        </div>
      </footer>
    </div>
  )
}
