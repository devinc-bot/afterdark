import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  createEventImageAssets,
  deleteEventImageAssetsByIds,
  findEventImageAssetsByEventIds,
  findEventImageAssetsNotInKeepList,
} from '@repo/db'
import type { EventImageResponse } from '@repo/types'
import { TranslationService } from '@repo/i18n/server'
import { FilesService } from '../../../files/application/services/files.service'
import { toEventImageResponse } from '../../mappers/events.mapper'
import type { UploadedEventImage } from '../../types'

@Injectable()
export class EventImagesService {
  constructor(
    @Inject(FilesService) private readonly filesService: FilesService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async upload(files: Express.Multer.File[]): Promise<UploadedEventImage[]> {
    if (files.length === 0) {
      return []
    }

    try {
      return await Promise.all(files.map((file) => this.filesService.uploadImage(file)))
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('event.IMAGE_UPLOAD_FAILED'))
    }
  }

  async rollback(uploads: UploadedEventImage[]): Promise<void> {
    if (uploads.length === 0) {
      return
    }

    await this.filesService.deleteImages(uploads.map((upload) => upload.key))
  }

  async removeUnwanted(eventId: number, keepImageIds: string[]): Promise<void> {
    const assetsToRemove = await findEventImageAssetsNotInKeepList(eventId, keepImageIds)
    const storageKeys = assetsToRemove
      .map((asset) => asset.storageKey)
      .filter((key): key is string => Boolean(key))

    if (storageKeys.length > 0) {
      await this.filesService.deleteImages(storageKeys)
    }

    await deleteEventImageAssetsByIds(
      eventId,
      assetsToRemove.map((asset) => asset.id)
    )
  }

  async saveNew(
    eventId: number,
    files: Express.Multer.File[],
    uploads: UploadedEventImage[]
  ): Promise<EventImageResponse[]> {
    if (uploads.length === 0) {
      return []
    }

    const images = await createEventImageAssets(
      eventId,
      uploads.map((upload, index) => ({
        name: files[index]?.originalname ?? upload.key,
        url: upload.url,
        storageKey: upload.key,
      }))
    )

    return images.map(toEventImageResponse)
  }

  async getByEventId(eventId: number): Promise<EventImageResponse[]> {
    const imageRows = await findEventImageAssetsByEventIds([eventId])

    return imageRows.map(({ asset }) => toEventImageResponse(asset))
  }
}
