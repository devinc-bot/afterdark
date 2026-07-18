import type { StaffStatus, UserRole } from '../enums/index.ts'

export type StaffProfileRow = {
  documentId: string
  name: string
  lastName: string
  avatar: string | null
  email: string
}

export type CurrentStaffRow = {
  documentId: string
  name: string
  lastName: string
  avatar: string | null
  phone: string
  status: StaffStatus
  email: string
}

export type StaffProfileUpdateInput = {
  name: string
  lastName: string
  phone: string
}

export type StaffProfileSeed = {
  name: string
  lastName: string
  phone: string
}

export type OwnerStaffPersonnelRow = {
  staffDocumentId: string
  name: string
  lastName: string
  email: string
  avatar: string | null
  staffStatus: StaffStatus
  locationDocumentId: string
  locationName: string
  role: UserRole
  lastActiveAt: Date
}
