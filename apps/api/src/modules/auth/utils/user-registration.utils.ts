export const USER_REGISTRATION_PURPOSE = 'user-registration' as const

export type UserRegistrationPayload = {
  purpose: typeof USER_REGISTRATION_PURPOSE
  email: string
}

export function buildUserRegistrationPayload(input: { email: string }): UserRegistrationPayload {
  return {
    purpose: USER_REGISTRATION_PURPOSE,
    email: input.email,
  }
}
