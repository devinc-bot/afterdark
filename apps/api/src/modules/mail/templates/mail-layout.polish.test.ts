import { createElement, type ComponentProps } from 'react'
import { render } from 'react-email'
import { describe, expect, test } from 'vitest'
import { CtaButton, MailLayout } from './mail-layout.tsx'
import { MAIL_COLOR, MAIL_RADIUS, mailBodyTextStyle } from './mail-tokens.ts'
import * as PasswordResetModule from './password-reset.tsx'
import * as StaffInvitationModule from './staff-invitation.tsx'
import * as UserRegistrationModule from './user-registration.tsx'
import * as WelcomeModule from './welcome.tsx'
import type { StaffInvitationEmailProps } from './staff-invitation.tsx'

/** Surface-high from DESIGN.md / globals `--color-surface-container-high` — security callout fill. */
const SURFACE_HIGH = '#282a26'

function styleAttributes(html: string): string[] {
  return [...html.matchAll(/\bstyle="([^"]*)"/gi)].map((match) => match[1] ?? '')
}

/** Raised container: email-safe dual-layer gradient border (135deg transparent → primary → transparent). */
function isRaisedGradientBorderContainer(style: string): boolean {
  const hasTransparentBorder = /border:\s*1px\s+solid\s+transparent/i.test(style)
  const hasRaisedSurfaceFill = /background-color:\s*#1e1f1c/i.test(style)
  const hasControlRadius = /border-radius:\s*12px/i.test(style)
  // Dual-layer pattern: solid raised fill + 135deg transparent→primary→transparent border gradient.
  const hasPrimaryBorderGradient =
    /linear-gradient\(\s*135deg\s*,\s*transparent\s*,\s*#dcff02\s*,\s*transparent\s*\)/i.test(style)
  const hasRaisedFillGradient = /linear-gradient\(\s*#1e1f1c\s*,\s*#1e1f1c\s*\)/i.test(style)
  const hasBorderBoxOrigin = /background-origin:\s*border-box/i.test(style)
  const hasPaddingThenBorderClip = /background-clip:\s*padding-box\s*,\s*border-box/i.test(style)

  return (
    hasTransparentBorder &&
    hasRaisedSurfaceFill &&
    hasControlRadius &&
    hasPrimaryBorderGradient &&
    hasRaisedFillGradient &&
    hasBorderBoxOrigin &&
    hasPaddingThenBorderClip
  )
}

/** Primary CTA fill: citrus background + near-black label (not white). */
function isCitrusOnPrimaryCta(style: string): boolean {
  const hasPrimaryFill = /background-color:\s*#dcff02/i.test(style)
  const hasOnPrimaryLabel = /(?:^|;)\s*color:\s*#2a3208\b/i.test(style)
  const hasWhiteLabel = /(?:^|;)\s*color:\s*(?:#fff(?:fff)?|white)\b/i.test(style)
  const hasControlRadius = /border-radius:\s*12px/i.test(style)

  return hasPrimaryFill && hasOnPrimaryLabel && !hasWhiteLabel && hasControlRadius
}

/** URL must remain readable when clients strip button/href styling. */
function htmlShowsPlaintextUrl(html: string, url: string): boolean {
  const withoutHrefValues = html.replace(/\bhref=(["'])[\s\S]*?\1/gi, 'href=""')
  return withoutHrefValues.includes(url)
}

function parseCssLengthPx(value: unknown): number {
  if (typeof value !== 'string') {
    return Number.NaN
  }
  const match = /^(\d+(?:\.\d+)?)px$/i.exec(value.trim())
  return match ? Number(match[1]) : Number.NaN
}

describe('mail design tokens align to shipping design system', () => {
  test('primary / on-primary / control radius match globals dark tokens', () => {
    expect(MAIL_COLOR.primary).toBe('#dcff02')
    expect(MAIL_COLOR.onPrimary).toBe('#2a3208')
    expect(MAIL_RADIUS.control).toBe('12px')
  })

  test('body text uses 16px size and comfortable line-height for light-on-dark mail', () => {
    expect(mailBodyTextStyle.fontSize).toBe('16px')
    expect(parseCssLengthPx(mailBodyTextStyle.lineHeight)).toBeGreaterThanOrEqual(24)
  })
})

describe('mail layout polish renders', () => {
  test('MailLayout renders with 135deg transparent→primary→transparent border and citrus on-primary CTA', async () => {
    const ctaHref = 'https://example.com/continue'
    const html = await render(
      createElement(
        MailLayout,
        {
          preview: 'Vista previa de prueba',
          title: 'Título de prueba',
          brand: 'Lumina',
          footer: 'Pie de página',
          copyright: '© 2026 Lumina',
        } as ComponentProps<typeof MailLayout>,
        createElement(CtaButton, { href: ctaHref, label: 'Continuar' })
      )
    )

    expect(html).toMatch(/<html[\s>]/i)
    expect(html).toContain('Lumina')
    expect(html).toContain('Título de prueba')
    expect(html).toContain(ctaHref)
    expect(html).toMatch(/<html[^>]*\slang="es"/i)

    const raisedSurfaceStyles = styleAttributes(html).filter((style) =>
      style.toLowerCase().includes(MAIL_COLOR.surfaceRaised.toLowerCase())
    )
    expect(raisedSurfaceStyles.length).toBeGreaterThan(0)
    expect(raisedSurfaceStyles.some(isRaisedGradientBorderContainer)).toBe(true)
    // Container must not keep the old solid hairline border (Hr may still use #44473c).
    expect(
      raisedSurfaceStyles.some((style) => /border:\s*1px\s+solid\s*#44473c/i.test(style))
    ).toBe(false)

    const primaryFillStyles = styleAttributes(html).filter((style) =>
      /background-color:\s*#dcff02/i.test(style)
    )
    expect(primaryFillStyles.length).toBeGreaterThan(0)
    expect(primaryFillStyles.some(isCitrusOnPrimaryCta)).toBe(true)
    // CTA label must stay near-black on citrus — never white on primary fill.
    expect(
      primaryFillStyles.some((style) => /(?:^|;)\s*color:\s*(?:#fff(?:fff)?|white)\b/i.test(style))
    ).toBe(false)
  })

  test('MailLayout respects lang prop for bilingual HTML root', async () => {
    const html = await render(
      createElement(MailLayout, {
        preview: 'Preview',
        title: 'Title',
        brand: 'Lumina',
        footer: 'Footer',
        copyright: '© 2026 Lumina',
        lang: 'en',
      } as ComponentProps<typeof MailLayout>)
    )

    expect(html).toMatch(/<html[^>]*\slang="en"/i)
  })
})

describe('staff invitation security note callout', () => {
  test('renders securityWordNote with surface-high callout fill when set', async () => {
    const StaffInvitationEmail = StaffInvitationModule.default!
    const props = {
      ...StaffInvitationEmail.PreviewProps,
      securityWordNote: 'Recordá la palabra de seguridad que acordaste con tu administrador.',
    } satisfies StaffInvitationEmailProps

    const html = await render(createElement(StaffInvitationEmail, props))

    expect(html).toContain(props.securityWordNote)
    expect(html.toLowerCase()).toContain(SURFACE_HIGH)
  })

  test('omits surface-high callout fill when securityWordNote is absent', async () => {
    const StaffInvitationEmail = StaffInvitationModule.default!
    const { securityWordNote: _omit, ...propsWithoutNote } = StaffInvitationEmail.PreviewProps

    const html = await render(createElement(StaffInvitationEmail, propsWithoutNote))

    expect(html).not.toContain(
      'Recordá la palabra de seguridad que acordaste con tu administrador.'
    )
    expect(html.toLowerCase()).not.toContain(SURFACE_HIGH)
  })
})

describe('action emails expose plaintext URL fallback under CTA', () => {
  test.each([
    {
      name: 'password-reset',
      module: PasswordResetModule,
      urlKey: 'url' as const,
    },
    {
      name: 'user-registration',
      module: UserRegistrationModule,
      urlKey: 'url' as const,
    },
    {
      name: 'staff-invitation',
      module: StaffInvitationModule,
      urlKey: 'url' as const,
    },
  ])('$name shows url as visible text, not only in href', async ({ module, urlKey }) => {
    const Email = module.default!
    const props = Email.PreviewProps
    const url = props[urlKey]
    expect(typeof url).toBe('string')
    expect(url.length).toBeGreaterThan(0)

    const html = await render(createElement(Email, props))

    expect(html).toContain(url)
    expect(htmlShowsPlaintextUrl(html, url)).toBe(true)
  })

  /**
   * Implementation contract: welcome keeps `ctaUrl` in the CTA href and ALSO
   * shows `ctaUrl` as visible plaintext under the button for client parity with
   * link-heavy auth emails (password-reset / registration / staff-invitation).
   */
  test('welcome shows ctaUrl as visible plaintext under CTA for consistency', async () => {
    const WelcomeEmail = WelcomeModule.default!
    const { ctaUrl } = WelcomeEmail.PreviewProps
    const html = await render(createElement(WelcomeEmail, WelcomeEmail.PreviewProps))

    expect(html).toContain(ctaUrl)
    expect(htmlShowsPlaintextUrl(html, ctaUrl)).toBe(true)
  })
})
