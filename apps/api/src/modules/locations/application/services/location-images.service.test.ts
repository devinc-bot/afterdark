import { describe, expect, test, vi } from 'vitest'
import { LocationImagesService } from './location-images.service.ts'

type ExpectedLocationImagesService = {
  upload(
    files: Express.Multer.File[],
    locationDocumentId: string,
    startIndex: number
  ): Promise<Array<{ key: string; url: string }>>
}

function createFile(originalname: string): Express.Multer.File {
  return { originalname } as Express.Multer.File
}

function createService() {
  const filesService = {
    buildLocationImageKey: vi.fn(
      (documentId: string, imageIndex: number) =>
        `locations/${documentId}/gallery-${imageIndex}-33333333-3333-4333-8333-333333333333.webp`
    ),
    uploadImageWithKey: vi.fn(async (_file: Express.Multer.File, key: string) => ({
      key,
      url: `https://cdn.example.com/${key}`,
    })),
    uploadImage: vi.fn(async () => ({
      key: 'flat-key.jpg',
      url: 'https://cdn.example.com/flat-key.jpg',
    })),
  }
  const translationService = {
    translateError: vi.fn((code: string) => code),
  }
  const service = new LocationImagesService(filesService as never, translationService as never)

  return {
    service: service as unknown as ExpectedLocationImagesService,
    filesService,
  }
}

describe('LocationImagesService upload', () => {
  test('uploads new location images with zero-based document-scoped gallery keys', async () => {
    const { service, filesService } = createService()
    const files = [createFile('front.jpg'), createFile('inside.png')]

    await expect(service.upload(files, 'location-document-id', 0)).resolves.toEqual([
      {
        key: 'locations/location-document-id/gallery-0-33333333-3333-4333-8333-333333333333.webp',
        url: 'https://cdn.example.com/locations/location-document-id/gallery-0-33333333-3333-4333-8333-333333333333.webp',
      },
      {
        key: 'locations/location-document-id/gallery-1-33333333-3333-4333-8333-333333333333.webp',
        url: 'https://cdn.example.com/locations/location-document-id/gallery-1-33333333-3333-4333-8333-333333333333.webp',
      },
    ])

    expect(filesService.buildLocationImageKey).toHaveBeenNthCalledWith(1, 'location-document-id', 0)
    expect(filesService.buildLocationImageKey).toHaveBeenNthCalledWith(2, 'location-document-id', 1)
    expect(filesService.uploadImageWithKey).toHaveBeenNthCalledWith(
      1,
      files[0],
      'locations/location-document-id/gallery-0-33333333-3333-4333-8333-333333333333.webp'
    )
    expect(filesService.uploadImageWithKey).toHaveBeenNthCalledWith(
      2,
      files[1],
      'locations/location-document-id/gallery-1-33333333-3333-4333-8333-333333333333.webp'
    )
    expect(filesService.uploadImage).not.toHaveBeenCalled()
  })

  test('adds the caller-provided start index to each new image index', async () => {
    const { service, filesService } = createService()
    const files = [createFile('new-1.jpg'), createFile('new-2.jpg')]

    // Update callers pass keepImageIds.length as startIndex.
    await service.upload(files, 'location-document-id', 2)

    expect(filesService.buildLocationImageKey).toHaveBeenNthCalledWith(1, 'location-document-id', 2)
    expect(filesService.buildLocationImageKey).toHaveBeenNthCalledWith(2, 'location-document-id', 3)
  })

  test('returns an empty list without calling FilesService when no files are provided', async () => {
    const { service, filesService } = createService()

    await expect(service.upload([], 'location-document-id', 0)).resolves.toEqual([])

    expect(filesService.buildLocationImageKey).not.toHaveBeenCalled()
    expect(filesService.uploadImageWithKey).not.toHaveBeenCalled()
    expect(filesService.uploadImage).not.toHaveBeenCalled()
  })
})
