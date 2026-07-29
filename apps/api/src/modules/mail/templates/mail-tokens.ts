import type { CSSProperties } from 'react'

/** Inline hex tokens aligned with DESIGN.md + `packages/ui` dark theme (email-safe). */
export const MAIL_COLOR = {
  background: '#121311',
  surfaceRaised: '#1e1f1c',
  foreground: '#e6e7e2',
  muted: '#c5c8b8',
  inkMuted: '#b8bcab',
  hairline: '#44473c',
  primary: '#dcff02',
  onPrimary: '#2a3208',
} as const

export const MAIL_FONT = {
  display:
    'Montserrat, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
} as const

export const MAIL_RADIUS = {
  control: '16px',
} as const

export const mailBodyTextStyle: CSSProperties = {
  color: MAIL_COLOR.foreground,
  fontFamily: MAIL_FONT.body,
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 12px',
}

export const mailMutedTextStyle: CSSProperties = {
  color: MAIL_COLOR.muted,
  fontFamily: MAIL_FONT.body,
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 8px',
}
