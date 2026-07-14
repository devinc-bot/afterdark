export const PASSWORD_RESET_PURPOSE = 'password-reset' as const

export type PasswordResetPayload = {
  purpose: typeof PASSWORD_RESET_PURPOSE
  accountId: number
  email: string
}

export function buildPasswordResetPayload(input: {
  accountId: number
  email: string
}): PasswordResetPayload {
  return {
    purpose: PASSWORD_RESET_PURPOSE,
    accountId: input.accountId,
    email: input.email,
  }
}
