import { Text } from 'react-email'
import { CtaButton, MailLayout } from './mail-layout'
import { mailBodyTextStyle, mailIgnoreTextStyle, mailMutedTextStyle } from './mail-tokens'

export type UserRegistrationEmailProps = {
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

export function UserRegistrationEmail({
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
}: UserRegistrationEmailProps) {
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

UserRegistrationEmail.PreviewProps = {
  preview: 'Confirmá tu cuenta',
  title: 'Confirmá tu email',
  brand: 'Lumina',
  body: 'Para terminar de crear tu cuenta, confirmá tu correo con el enlace de abajo.',
  cta: 'Confirmar cuenta',
  url: 'https://web.example.com/verify-email?token=preview',
  expires: 'Este enlace vence en 60 minutos.',
  ignore: 'Si no creaste una cuenta, ignorá este correo.',
  footer: 'Este correo fue enviado por Lumina.',
  copyright: '© 2026 Lumina. Todos los derechos reservados.',
  lang: 'es',
} satisfies UserRegistrationEmailProps

export default UserRegistrationEmail
