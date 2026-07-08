import type { AssetSelect } from '@afterdark/db/schema'

export type ClubImageAssetInput = {
  name: string
  url: string
  storageKey: string
}

export type ClubImageAsset = {
  clubId: number
  asset: AssetSelect
}
