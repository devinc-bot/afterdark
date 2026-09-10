import { Text } from 'react-email'
import { CtaButton, MailLayout } from './mail-layout'
import { mailBodyTextStyle, mailIgnoreTextStyle, mailMutedTextStyle } from './mail-tokens'

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
  lang?: string
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
  lang,
}: PasswordResetEmailProps) {
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
      <CtaButton href={url} label={cta} showUrl />
      <Text style={mailIgnoreTextStyle}>{ignore}</Text>
    </MailLayout>
  )
}

PasswordResetEmail.PreviewProps = {
  preview: 'Restablecé tu contraseña',
  title: 'Restablecer contraseña',
  brand: 'Lumina',
  body: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta.',
  cta: 'Restablecer contraseña',
  url: 'https://web.example.com/reset-password?token=preview',
  expires: 'Este enlace vence en 30 minutos.',
  ignore: 'Si no solicitaste este cambio, ignorá este correo.',
  footer: 'Este correo fue enviado por Lumina.',
  copyright: '© 2026 Lumina. Todos los derechos reservados.',
  lang: 'es',
} satisfies PasswordResetEmailProps

export default PasswordResetEmail
