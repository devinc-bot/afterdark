import { createElement } from 'react'
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

/** Hairline from DESIGN.md / globals — soft depth container border. */
const HAIRLINE = '#44473c'

function styleAttributes(html: string): string[] {
  return [...html.matchAll(/\bstyle="([^"]*)"/gi)].map((match) => match[1] ?? '')
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
  test('MailLayout renders with soft-depth hairline container border and 12px citrus CTA', async () => {
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
        },
        createElement(CtaButton, { href: ctaHref, label: 'Continuar' })
      )
    )

    expect(html).toMatch(/<html[\s>]/i)
    expect(html).toContain('Lumina')
    expect(html).toContain('Título de prueba')
    expect(html).toContain(ctaHref)
    expect(html).toContain(HAIRLINE)
    expect(html).toMatch(/<html[^>]*\slang="es"/i)

    const raisedSurfaceStyles = styleAttributes(html).filter((style) =>
      style.toLowerCase().includes(MAIL_COLOR.surfaceRaised.toLowerCase())
    )
    expect(raisedSurfaceStyles.length).toBeGreaterThan(0)
    expect(
      raisedSurfaceStyles.some((style) => /border:\s*1px\s+solid\s*#44473c/i.test(style))
    ).toBe(true)

    const primaryFillStyles = styleAttributes(html).filter((style) =>
      /background-color:\s*#dcff02/i.test(style)
    )
    expect(primaryFillStyles.length).toBeGreaterThan(0)
    expect(primaryFillStyles.some((style) => /border-radius:\s*12px/i.test(style))).toBe(true)
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
        children: null,
      })
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
