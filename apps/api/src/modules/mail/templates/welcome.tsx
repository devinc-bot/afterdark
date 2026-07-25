import type { CSSProperties } from 'react'
import { Text } from 'react-email'
import { CtaButton, MailLayout } from './mail-layout'

export type WelcomeEmailProps = {
  preview: string
  title: string
  brand: string
  body: string
  cta: string
  ctaUrl: string
  footer: string
  copyright: string
}

export function WelcomeEmail({
  preview,
  title,
  brand,
  body,
  cta,
  ctaUrl,
  footer,
  copyright,
}: WelcomeEmailProps) {
  return (
    <MailLayout preview={preview} title={title} brand={brand} footer={footer} copyright={copyright}>
      <Text style={bodyTextStyle}>{body}</Text>
      <CtaButton href={ctaUrl} label={cta} />
    </MailLayout>
  )
}

const bodyTextStyle: CSSProperties = {
  color: '#e5e2e3',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 12px',
}
