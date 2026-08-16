export type OrganizationRow = {
  id: number
  documentId: string
  name: string
  taxId: string | null
}

export type OrganizationMembershipRow = OrganizationRow & {
  accountId: number
}
