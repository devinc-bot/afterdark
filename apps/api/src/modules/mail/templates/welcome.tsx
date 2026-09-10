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
  lang?: string
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
  lang,
}: WelcomeEmailProps) {
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
      <CtaButton href={ctaUrl} label={cta} showUrl />
    </MailLayout>
  )
}

WelcomeEmail.PreviewProps = {
  preview: 'Bienvenido a Lumina',
  title: '¡Bienvenido, Ana!',
  brand: 'Lumina',
  body: 'Tu cuenta fue creada exitosamente. Ya podés iniciar sesión.',
  cta: 'Ir al panel',
  ctaUrl: 'https://dashboard.example.com',
  footer: 'Este correo fue enviado por Lumina.',
  copyright: '© 2026 Lumina. Todos los derechos reservados.',
  lang: 'es',
} satisfies WelcomeEmailProps

export default WelcomeEmail
