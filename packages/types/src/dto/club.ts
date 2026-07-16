import type { AssetType, ClubStatus } from '../enums/club.ts'

export interface ClubImageResponse {
  documentId: string
  name: string
  url: string
}

export interface ClubResponse {
  documentId: string
  name: string
  capacity: string
  description: string | null
  status: ClubStatus
  address: string
  streetNumber: string
  state: string
  city: string
  latitude: number | null
  longitude: number | null
  images: ClubImageResponse[]
  createdAt: Date
  updatedAt: Date
}

export interface UploadedAssetResponse {
  documentId: string
  name: string
  url: string
  type: AssetType
  createdAt: Date
  updatedAt: Date
}
