import type { CSSProperties, ReactNode } from 'react'
import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from 'react-email'
import { MAIL_COLOR, MAIL_FONT, MAIL_RADIUS } from './mail-tokens'

type MailLayoutProps = {
  preview: string
  title: string
  brand: string
  children: ReactNode
  footer: string
  copyright: string
}

export function MailLayout({
  preview,
  title,
  brand,
  children,
  footer,
  copyright,
}: MailLayoutProps) {
  return (
    <Html lang="es">
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
          <Text style={mutedStyle}>{footer}</Text>
          <Text style={mutedStyle}>{copyright}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export function CtaButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={buttonStyle}>
      {label}
    </Link>
  )
}

const bodyStyle: CSSProperties = {
  backgroundColor: MAIL_COLOR.background,
  color: MAIL_COLOR.foreground,
  fontFamily: MAIL_FONT.body,
  margin: 0,
  padding: '32px 16px',
}

const containerStyle: CSSProperties = {
  backgroundColor: MAIL_COLOR.surfaceRaised,
  borderRadius: MAIL_RADIUS.control,
  margin: '0 auto',
  maxWidth: '480px',
  padding: '32px 28px',
}

const brandStyle: CSSProperties = {
  color: MAIL_COLOR.primary,
  fontFamily: MAIL_FONT.display,
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  margin: '0 0 24px',
}

const headingStyle: CSSProperties = {
  color: MAIL_COLOR.foreground,
  fontFamily: MAIL_FONT.display,
  fontSize: '24px',
  fontWeight: 700,
  lineHeight: '32px',
  letterSpacing: '-0.02em',
  margin: '0 0 16px',
}

const hrStyle: CSSProperties = {
  borderColor: MAIL_COLOR.hairline,
  borderTop: `1px solid ${MAIL_COLOR.hairline}`,
  margin: '28px 0 16px',
}

const mutedStyle: CSSProperties = {
  color: MAIL_COLOR.inkMuted,
  fontFamily: MAIL_FONT.body,
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 8px',
}

const buttonStyle: CSSProperties = {
  backgroundColor: MAIL_COLOR.primary,
  borderRadius: MAIL_RADIUS.control,
  color: MAIL_COLOR.onPrimary,
  display: 'inline-block',
  fontFamily: MAIL_FONT.body,
  fontSize: '15px',
  fontWeight: 600,
  marginTop: '20px',
  padding: '12px 20px',
  textDecoration: 'none',
}
