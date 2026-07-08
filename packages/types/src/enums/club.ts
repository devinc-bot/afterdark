export const ASSET_TYPE = {
  IMG: 'img',
  VIDEO: 'video',
} as const

export type AssetType = (typeof ASSET_TYPE)[keyof typeof ASSET_TYPE]

export const CLUB_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type ClubStatus = (typeof CLUB_STATUS)[keyof typeof CLUB_STATUS]
