export const ASSET_TYPE = {
  IMG: 'img',
  VIDEO: 'video',
} as const

export type AssetType = (typeof ASSET_TYPE)[keyof typeof ASSET_TYPE]
