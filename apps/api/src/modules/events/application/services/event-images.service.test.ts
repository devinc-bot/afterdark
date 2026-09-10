import { describe, expect, test, vi } from 'vitest'
import { EventImagesService } from './event-images.service.ts'

type ExpectedEventImagesService = {
  upload(
    files: Express.Multer.File[],
    eventDocumentId: string,
    startIndex: number
  ): Promise<Array<{ key: string; url: string }>>
}

function createFile(originalname: string): Express.Multer.File {
  return { originalname } as Express.Multer.File
}

function createService() {
  const filesService = {
    buildEventImageKey: vi.fn((documentId: string, imageIndex: number) =>
      imageIndex === 0
        ? `events/${documentId}/cover-11111111-1111-4111-8111-111111111111.webp`
        : `events/${documentId}/gallery-${imageIndex}-22222222-2222-4222-8222-222222222222.webp`
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
  const service = new EventImagesService(filesService as never, translationService as never)

  return {
    service: service as unknown as ExpectedEventImagesService,
    filesService,
  }
}

describe('EventImagesService upload', () => {
  test('uploads new event images with document-scoped cover and gallery keys', async () => {
    const { service, filesService } = createService()
    const files = [createFile('cover.jpg'), createFile('gallery.png')]

    await expect(service.upload(files, 'event-document-id', 0)).resolves.toEqual([
      {
        key: 'events/event-document-id/cover-11111111-1111-4111-8111-111111111111.webp',
        url: 'https://cdn.example.com/events/event-document-id/cover-11111111-1111-4111-8111-111111111111.webp',
      },
      {
        key: 'events/event-document-id/gallery-1-22222222-2222-4222-8222-222222222222.webp',
        url: 'https://cdn.example.com/events/event-document-id/gallery-1-22222222-2222-4222-8222-222222222222.webp',
      },
    ])

    expect(filesService.buildEventImageKey).toHaveBeenNthCalledWith(1, 'event-document-id', 0)
    expect(filesService.buildEventImageKey).toHaveBeenNthCalledWith(2, 'event-document-id', 1)
    expect(filesService.uploadImageWithKey).toHaveBeenNthCalledWith(
      1,
      files[0],
      'events/event-document-id/cover-11111111-1111-4111-8111-111111111111.webp'
    )
    expect(filesService.uploadImageWithKey).toHaveBeenNthCalledWith(
      2,
      files[1],
      'events/event-document-id/gallery-1-22222222-2222-4222-8222-222222222222.webp'
    )
    expect(filesService.uploadImage).not.toHaveBeenCalled()
  })

  test('adds the caller-provided start index to each new image index', async () => {
    const { service, filesService } = createService()
    const files = [createFile('new-1.jpg'), createFile('new-2.jpg')]

    // Update callers pass keepImageIds.length as startIndex.
    await service.upload(files, 'event-document-id', 1)

    expect(filesService.buildEventImageKey).toHaveBeenNthCalledWith(1, 'event-document-id', 1)
    expect(filesService.buildEventImageKey).toHaveBeenNthCalledWith(2, 'event-document-id', 2)
  })

  test('returns an empty list without calling FilesService when no files are provided', async () => {
    const { service, filesService } = createService()

    await expect(service.upload([], 'event-document-id', 0)).resolves.toEqual([])

    expect(filesService.buildEventImageKey).not.toHaveBeenCalled()
    expect(filesService.uploadImageWithKey).not.toHaveBeenCalled()
    expect(filesService.uploadImage).not.toHaveBeenCalled()
  })
})
