import { Text } from 'react-email'
import { CtaButton, MailCallout, MailLayout } from './mail-layout'
import { mailBodyTextStyle, mailIgnoreTextStyle, mailMutedTextStyle } from './mail-tokens'

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
  lang?: string
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
  lang,
}: StaffInvitationEmailProps) {
  return (
    <MailLayout
      preview={preview}
      title={title}
      brand={brand}
      footer={footer}
      copyright={copyright}
      lang={lang}
    >
      <Text style={mailBodyTextStyle}>{body}</Text>
      {expires ? <Text style={mailMutedTextStyle}>{expires}</Text> : null}
      {securityWordNote ? <MailCallout>{securityWordNote}</MailCallout> : null}
      <CtaButton href={url} label={cta} showUrl />
      <Text style={mailIgnoreTextStyle}>{ignore}</Text>
    </MailLayout>
  )
}

StaffInvitationEmail.PreviewProps = {
  preview: 'Te invitaron a unirte al equipo de Club Norte',
  title: 'Invitación al equipo',
  brand: 'Lumina',
  body: 'María te invitó a unirte al equipo de Club Norte en Lumina.',
  cta: 'Activar acceso',
  url: 'https://dashboard.example.com/invitations/accept?token=preview',
  expires: 'Este enlace vence en 72 horas.',
  securityWordNote: 'Recordá la palabra de seguridad que acordaste con tu administrador.',
  ignore: 'Si no esperabas esta invitación, podés ignorar este correo.',
  footer: 'Este correo fue enviado por Lumina.',
  copyright: '© 2026 Lumina. Todos los derechos reservados.',
  lang: 'es',
} satisfies StaffInvitationEmailProps

export default StaffInvitationEmail
