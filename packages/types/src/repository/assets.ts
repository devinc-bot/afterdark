import type { AssetSelect } from '@afterdark/db/schema'

export type LocationImageAssetInput = {
  name: string
  url: string
  storageKey: string
}

export type LocationImageAsset = {
  locationId: number
  asset: AssetSelect
}

export type EventImageAssetInput = {
  name: string
  url: string
  storageKey: string
}

export type EventImageAsset = {
  eventId: number
  asset: AssetSelect
}
