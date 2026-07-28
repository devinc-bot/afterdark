import { Text } from 'react-email'
import { CtaButton, MailLayout } from './mail-layout'
import { mailBodyTextStyle } from './mail-tokens'

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
      <Text style={mailBodyTextStyle}>{body}</Text>
      <CtaButton href={ctaUrl} label={cta} />
    </MailLayout>
  )
}
