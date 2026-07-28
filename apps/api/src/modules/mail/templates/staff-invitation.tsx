import { Text } from 'react-email'
import { CtaButton, MailLayout } from './mail-layout'
import { mailBodyTextStyle, mailMutedTextStyle } from './mail-tokens'

export type StaffInvitationEmailProps = {
  preview: string
  title: string
  brand: string
  body: string
  cta: string
  url: string
  expires?: string
  securityWordNote?: string
  ignore: string
  footer: string
  copyright: string
}

export function StaffInvitationEmail({
  preview,
  title,
  brand,
  body,
  cta,
  url,
  expires,
  securityWordNote,
  ignore,
  footer,
  copyright,
}: StaffInvitationEmailProps) {
  return (
    <MailLayout preview={preview} title={title} brand={brand} footer={footer} copyright={copyright}>
      <Text style={mailBodyTextStyle}>{body}</Text>
      {expires ? <Text style={mailMutedTextStyle}>{expires}</Text> : null}
      {securityWordNote ? <Text style={mailMutedTextStyle}>{securityWordNote}</Text> : null}
      <CtaButton href={url} label={cta} />
      <Text style={mailMutedTextStyle}>{ignore}</Text>
    </MailLayout>
  )
}
