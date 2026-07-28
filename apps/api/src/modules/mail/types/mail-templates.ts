export type StaffInvitationRenderInput = {
  inviterName: string
  clubName: string
  url: string
  hours?: number
  includeSecurityWordNote?: boolean
}

export type PasswordResetRenderInput = {
  url: string
  minutes?: number
}

export type UserRegistrationRenderInput = {
  url: string
  minutes?: number
}

export type WelcomeRenderInput = {
  name: string
  ctaUrl: string
}
