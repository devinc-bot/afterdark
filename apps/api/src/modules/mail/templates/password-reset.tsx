import { Text } from 'react-email'
import { CtaButton, MailLayout } from './mail-layout'
import { mailBodyTextStyle, mailMutedTextStyle } from './mail-tokens'

export type PasswordResetEmailProps = {
  preview: string
  title: string
  brand: string
  body: string
  cta: string
  url: string
  expires?: string
  ignore: string
  footer: string
  copyright: string
}

export function PasswordResetEmail({
  preview,
  title,
  brand,
  body,
  cta,
  url,
  expires,
  ignore,
  footer,
  copyright,
}: PasswordResetEmailProps) {
  return (
    <MailLayout preview={preview} title={title} brand={brand} footer={footer} copyright={copyright}>
      <Text style={mailBodyTextStyle}>{body}</Text>
      {expires ? <Text style={mailMutedTextStyle}>{expires}</Text> : null}
      <CtaButton href={url} label={cta} />
      <Text style={mailMutedTextStyle}>{ignore}</Text>
    </MailLayout>
  )
}
