import type { CSSProperties, ReactNode } from 'react'
import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from 'react-email'
import {
  MAIL_COLOR,
  MAIL_FONT,
  MAIL_RADIUS,
  MAIL_SPACE,
  mailCalloutStyle,
  mailPlainUrlStyle,
} from './mail-tokens'

type MailLayoutProps = {
  preview: string
  title: string
  brand: string
  children: ReactNode
  footer: string
  copyright: string
  /** Document language for the email HTML root (matches i18n locale). */
  lang?: string
}

export function MailLayout({
  preview,
  title,
  brand,
  children,
  footer,
  copyright,
  lang = 'es',
}: MailLayoutProps) {
  return (
    <Html lang={lang}>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Montserrat:wght@600;700&display=swap');
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Text style={brandStyle}>{brand}</Text>
          <Heading style={headingStyle}>{title}</Heading>
          <Section>{children}</Section>
          <Hr style={hrStyle} />
          <Text style={footerStyle}>{footer}</Text>
          <Text style={copyrightStyle}>{copyright}</Text>
        </Container>
      </Body>
    </Html>
  )
}

type CtaButtonProps = {
  href: string
  label: string
  /** When true, renders the href as visible plaintext under the button. */
  showUrl?: boolean
}

export function CtaButton({ href, label, showUrl = false }: CtaButtonProps) {
  return (
    <>
      <Link href={href} style={buttonStyle}>
        {label}
      </Link>
      {showUrl ? <PlainUrl url={href} /> : null}
    </>
  )
}

/** Visible plaintext URL for clients that strip button/href styling. */
export function PlainUrl({ url }: { url: string }) {
  return <Text style={mailPlainUrlStyle}>{url}</Text>
}

/** Soft surface-high callout — use only when content is present. */
export function MailCallout({ children }: { children: ReactNode }) {
  return <Text style={mailCalloutStyle}>{children}</Text>
}

const bodyStyle: CSSProperties = {
  backgroundColor: MAIL_COLOR.background,
  color: MAIL_COLOR.foreground,
  fontFamily: MAIL_FONT.body,
  margin: 0,
  padding: `${MAIL_SPACE.xl} ${MAIL_SPACE.md}`,
}

const containerStyle: CSSProperties = {
  backgroundColor: MAIL_COLOR.surfaceRaised,
  border: `1px solid ${MAIL_COLOR.hairline}`,
  borderRadius: MAIL_RADIUS.control,
  margin: '0 auto',
  maxWidth: '480px',
  padding: `${MAIL_SPACE.xl} ${MAIL_SPACE.lg}`,
}

const brandStyle: CSSProperties = {
  color: MAIL_COLOR.primary,
  fontFamily: MAIL_FONT.display,
  fontSize: '18px',
  fontWeight: 700,
  letterSpacing: '-0.03em',
  margin: `0 0 ${MAIL_SPACE.lg}`,
}

const headingStyle: CSSProperties = {
  color: MAIL_COLOR.foreground,
  fontFamily: MAIL_FONT.display,
  fontSize: '24px',
  fontWeight: 700,
  lineHeight: '34px',
  letterSpacing: '-0.02em',
  margin: `0 0 ${MAIL_SPACE.md}`,
}

const hrStyle: CSSProperties = {
  borderColor: MAIL_COLOR.hairline,
  borderTop: `1px solid ${MAIL_COLOR.hairline}`,
  margin: `${MAIL_SPACE.xl} 0 ${MAIL_SPACE.md}`,
}

const footerStyle: CSSProperties = {
  color: MAIL_COLOR.inkMuted,
  fontFamily: MAIL_FONT.body,
  fontSize: '12px',
  lineHeight: '18px',
  margin: `0 0 ${MAIL_SPACE.xs}`,
}

const copyrightStyle: CSSProperties = {
  color: MAIL_COLOR.inkMuted,
  fontFamily: MAIL_FONT.body,
  fontSize: '12px',
  lineHeight: '18px',
  margin: 0,
}

const buttonStyle: CSSProperties = {
  backgroundColor: MAIL_COLOR.primary,
  borderRadius: MAIL_RADIUS.control,
  color: MAIL_COLOR.onPrimary,
  display: 'inline-block',
  fontFamily: MAIL_FONT.body,
  fontSize: '15px',
  fontWeight: 600,
  lineHeight: '16px',
  marginTop: MAIL_SPACE.lg,
  marginBottom: MAIL_SPACE.xs,
  padding: '12px 20px',
  textDecoration: 'none',
}
