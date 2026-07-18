export const ASSET_TYPE = {
  IMG: 'img',
  VIDEO: 'video',
} as const

export type AssetType = (typeof ASSET_TYPE)[keyof typeof ASSET_TYPE]

export const LOCATION_TYPE = {
  PERMANENT: 'permanent',
  TEMPORARY: 'temporary',
} as const

export type LocationType = (typeof LOCATION_TYPE)[keyof typeof LOCATION_TYPE]
