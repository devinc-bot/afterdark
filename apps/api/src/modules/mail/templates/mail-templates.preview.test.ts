import { createElement, type FunctionComponent } from 'react'
import { render } from 'react-email'
import { describe, expect, test } from 'vitest'
import * as MailLayoutModule from './mail-layout.tsx'
import * as MailTokensModule from './mail-tokens.ts'
import * as PasswordResetModule from './password-reset.tsx'
import * as StaffInvitationModule from './staff-invitation.tsx'
import * as UserRegistrationModule from './user-registration.tsx'
import * as WelcomeModule from './welcome.tsx'
import type { PasswordResetEmailProps } from './password-reset.tsx'
import type { StaffInvitationEmailProps } from './staff-invitation.tsx'
import type { UserRegistrationEmailProps } from './user-registration.tsx'
import type { WelcomeEmailProps } from './welcome.tsx'

type PreviewEmailComponent<P> = FunctionComponent<P> & {
  PreviewProps: P
}

type PreviewCase<P> = {
  name: string
  module: { default?: PreviewEmailComponent<P>; [key: string]: unknown }
  namedExport: string
  snippets: string[]
}

const previewCases = [
  {
    name: 'welcome',
    module: WelcomeModule,
    namedExport: 'WelcomeEmail',
    snippets: ['Lumina', '¡Bienvenido, Ana!', 'Ir al panel'],
  },
  {
    name: 'password-reset',
    module: PasswordResetModule,
    namedExport: 'PasswordResetEmail',
    snippets: [
      'Lumina',
      'Restablecer contraseña',
      'Recibimos una solicitud para restablecer la contraseña de tu cuenta.',
      'Este enlace vence en 30 minutos.',
    ],
  },
  {
    name: 'user-registration',
    module: UserRegistrationModule,
    namedExport: 'UserRegistrationEmail',
    snippets: [
      'Lumina',
      'Confirmá tu email',
      'Confirmar cuenta',
      'Este enlace vence en 60 minutos.',
    ],
  },
  {
    name: 'staff-invitation',
    module: StaffInvitationModule,
    namedExport: 'StaffInvitationEmail',
    snippets: [
      'Lumina',
      'Invitación al equipo',
      'Activar acceso',
      'Este enlace vence en 72 horas.',
      'Recordá la palabra de seguridad que acordaste con tu administrador.',
    ],
  },
] as const satisfies ReadonlyArray<
  | PreviewCase<WelcomeEmailProps>
  | PreviewCase<PasswordResetEmailProps>
  | PreviewCase<UserRegistrationEmailProps>
  | PreviewCase<StaffInvitationEmailProps>
>

describe('mail template React Email preview wiring', () => {
  test('shared layout helpers are not default-exported email templates', () => {
    expect(MailLayoutModule.default).toBeUndefined()
    expect(MailTokensModule.default).toBeUndefined()
  })

  test.each(previewCases)(
    '$name default export matches named export and renders PreviewProps',
    async ({ module, namedExport, snippets }) => {
      const DefaultExport = module.default
      const NamedExport = module[namedExport]

      expect(DefaultExport).toBeTypeOf('function')
      expect(NamedExport).toBeTypeOf('function')
      expect(DefaultExport).toBe(NamedExport)

      const PreviewProps = DefaultExport?.PreviewProps
      expect(PreviewProps).toBeTypeOf('object')
      expect(PreviewProps).not.toBeNull()

      const html = await render(createElement(DefaultExport!, PreviewProps))

      expect(html).toMatch(/<html[\s>]/i)
      for (const snippet of snippets) {
        expect(html).toContain(snippet)
      }
    }
  )
})
