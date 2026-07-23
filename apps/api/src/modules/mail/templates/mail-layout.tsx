import type { CSSProperties, ReactNode } from 'react'
import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from 'react-email'

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
      <Head />
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
  backgroundColor: '#131314',
  color: '#e5e2e3',
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: '32px 16px',
}

const containerStyle: CSSProperties = {
  backgroundColor: '#201f20',
  borderRadius: '8px',
  margin: '0 auto',
  maxWidth: '480px',
  padding: '32px 28px',
}

const brandStyle: CSSProperties = {
  color: '#ecb1ff',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  margin: '0 0 24px',
}

const headingStyle: CSSProperties = {
  color: '#e5e2e3',
  fontSize: '24px',
  fontWeight: 700,
  lineHeight: '32px',
  margin: '0 0 16px',
}

const hrStyle: CSSProperties = {
  borderColor: '#4d444e',
  borderTop: '1px solid #4d444e',
  margin: '28px 0 16px',
}

const mutedStyle: CSSProperties = {
  color: '#998d99',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 8px',
}

const buttonStyle: CSSProperties = {
  backgroundColor: '#ecb1ff',
  borderRadius: '8px',
  color: '#4a1a5e',
  display: 'inline-block',
  fontSize: '15px',
  fontWeight: 600,
  marginTop: '20px',
  padding: '12px 20px',
  textDecoration: 'none',
}
