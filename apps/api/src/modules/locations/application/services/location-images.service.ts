import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  createLocationImageAssets,
  deleteLocationImageAssetsByIds,
  findLocationImageAssetsByLocationIds,
  findLocationImageAssetsNotInKeepList,
} from '@afterdark/db'
import type { LocationImageResponse } from '@afterdark/types'
import { TranslationService } from '@afterdark/i18n/server'
import { FilesService } from '../../../files/application/services/files.service'
import { toLocationImageResponse } from '../../mappers/location.mapper'
import type { UploadedLocationImage } from '../../types'

@Injectable()
export class LocationImagesService {
  constructor(
    @Inject(FilesService) private readonly filesService: FilesService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async upload(files: Express.Multer.File[]): Promise<UploadedLocationImage[]> {
    if (files.length === 0) {
      return []
    }

    try {
      return await Promise.all(files.map((file) => this.filesService.uploadImage(file)))
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('location.IMAGE_UPLOAD_FAILED'))
    }
  }

  async rollback(uploads: UploadedLocationImage[]): Promise<void> {
    if (uploads.length === 0) {
      return
    }

    await this.filesService.deleteImages(uploads.map((upload) => upload.key))
  }

  async removeUnwanted(locationId: number, keepImageIds: string[]): Promise<void> {
    const assetsToRemove = await findLocationImageAssetsNotInKeepList(locationId, keepImageIds)
    const storageKeys = assetsToRemove
      .map((asset) => asset.storageKey)
      .filter((key): key is string => Boolean(key))

    if (storageKeys.length > 0) {
      await this.filesService.deleteImages(storageKeys)
    }

    await deleteLocationImageAssetsByIds(
      locationId,
      assetsToRemove.map((asset) => asset.id)
    )
  }

  async saveNew(
    locationId: number,
    files: Express.Multer.File[],
    uploads: UploadedLocationImage[]
  ): Promise<LocationImageResponse[]> {
    if (uploads.length === 0) {
      return []
    }

    const images = await createLocationImageAssets(
      locationId,
      uploads.map((upload, index) => ({
        name: files[index]?.originalname ?? upload.key,
        url: upload.url,
        storageKey: upload.key,
      }))
    )

    return images.map(toLocationImageResponse)
  }

  async getByLocationId(locationId: number): Promise<LocationImageResponse[]> {
    const imageRows = await findLocationImageAssetsByLocationIds([locationId])

    return imageRows.map(({ asset }) => toLocationImageResponse(asset))
  }
}
