import type { CSSProperties } from 'react'
import { Text } from 'react-email'
import { CtaButton, MailLayout } from './mail-layout'

export type StaffInvitationEmailProps = {
  preview: string
  title: string
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
    <MailLayout preview={preview} title={title} footer={footer} copyright={copyright}>
      <Text style={bodyTextStyle}>{body}</Text>
      {expires ? <Text style={mutedTextStyle}>{expires}</Text> : null}
      {securityWordNote ? <Text style={mutedTextStyle}>{securityWordNote}</Text> : null}
      <CtaButton href={url} label={cta} />
      <Text style={mutedTextStyle}>{ignore}</Text>
    </MailLayout>
  )
}

const bodyTextStyle: CSSProperties = {
  color: '#e5e2e3',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 12px',
}

const mutedTextStyle: CSSProperties = {
  color: '#d0c3cf',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 8px',
}
