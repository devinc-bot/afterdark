export const OWNER_REGISTRATION_PURPOSE = 'owner-registration' as const

export type OwnerRegistrationPayload = {
  purpose: typeof OWNER_REGISTRATION_PURPOSE
  email: string
}

export function buildOwnerRegistrationPayload(input: { email: string }): OwnerRegistrationPayload {
  return {
    purpose: OWNER_REGISTRATION_PURPOSE,
    email: input.email,
  }
}
