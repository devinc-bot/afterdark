export const QUERY_KEYS = {
  currentUser: () => ['current-user'] as const,
  clubs: () => ['clubs'] as const,
  staffPersonnel: () => ['staff-personnel'] as const,
  staffInvitations: () => ['staff-invitations'] as const,
  staffInvitationLink: (slug: string, token: string) =>
    ['staff-invitation-link', slug, token] as const,
} as const
