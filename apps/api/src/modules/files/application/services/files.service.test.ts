import { expect, test } from 'vitest'
import { FilesService } from './files.service.ts'

type HierarchicalKeyBuilders = {
  buildAvatarKey(profileDocumentId: string): string
  buildEventImageKey(eventDocumentId: string, imageIndex: number): string
  buildLocationImageKey(locationDocumentId: string, imageIndex: number): string
}

const translationService = {
  translateError: (code: string) => code,
} as never

function createService(): HierarchicalKeyBuilders {
  return new FilesService(translationService) as unknown as HierarchicalKeyBuilders
}

test('builds a versioned WebP avatar key under the profile hierarchy', () => {
  const service = createService()
  const profileDocumentId = '8efedbd1-c965-4882-bad7-2235b02bcd6e'

  const key = service.buildAvatarKey(profileDocumentId)

  expect(key).toMatch(
    /^users\/avatars\/8efedbd1-c965-4882-bad7-2235b02bcd6e-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i
  )
})

test('builds versioned event cover and gallery WebP keys from image indexes', () => {
  const service = createService()
  const eventDocumentId = 'event-document-id'
  const versionPattern = '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}'

  expect(service.buildEventImageKey(eventDocumentId, 0)).toMatch(
    new RegExp(`^events/event-document-id/cover-${versionPattern}\\.webp$`, 'i')
  )
  expect(service.buildEventImageKey(eventDocumentId, 1)).toMatch(
    new RegExp(`^events/event-document-id/gallery-1-${versionPattern}\\.webp$`, 'i')
  )
})

test('builds versioned location gallery WebP keys with zero-based indexes', () => {
  const service = createService()
  const locationDocumentId = 'location-document-id'
  const versionPattern = '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}'

  expect(service.buildLocationImageKey(locationDocumentId, 0)).toMatch(
    new RegExp(`^locations/location-document-id/gallery-0-${versionPattern}\\.webp$`, 'i')
  )
  expect(service.buildLocationImageKey(locationDocumentId, 3)).toMatch(
    new RegExp(`^locations/location-document-id/gallery-3-${versionPattern}\\.webp$`, 'i')
  )
})
