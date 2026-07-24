export type UserProfileRow = {
  documentId: string
  name: string
  lastName: string
  phone: string
  avatar: string | null
  email: string
}

export type UserProfileUpdateInput = {
  name: string
  lastName: string
  phone: string
}

export type UserProfileSeed = {
  name: string
  lastName: string
  phone: string
}
