import type { AssetType, LocationType } from '../enums/location.ts'

export interface LocationImageResponse {
  documentId: string
  name: string
  url: string
}

export interface LocationResponse {
  documentId: string
  name: string
  capacity: string
  description: string | null
  type: LocationType
  address: string
  streetNumber: string
  state: string
  city: string
  latitude: number | null
  longitude: number | null
  images: LocationImageResponse[]
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
