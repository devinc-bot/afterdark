import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  createClubImageAssets,
  deleteClubImageAssetsByIds,
  findClubImageAssetsByClubIds,
  findClubImageAssetsNotInKeepList,
} from '@afterdark/db'
import type { ClubImageResponse } from '@afterdark/types'
import { TranslationService } from '@afterdark/i18n/server'
import { FilesService } from '../../../files/application/services/files.service'
import { toClubImageResponse } from '../../mappers/club.mapper'
import type { UploadedClubImage } from '../../types'

@Injectable()
export class ClubImagesService {
  constructor(
    @Inject(FilesService) private readonly filesService: FilesService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async upload(files: Express.Multer.File[]): Promise<UploadedClubImage[]> {
    if (files.length === 0) {
      return []
    }

    try {
      return await Promise.all(files.map((file) => this.filesService.uploadImage(file)))
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('club.IMAGE_UPLOAD_FAILED'))
    }
  }

  async rollback(uploads: UploadedClubImage[]): Promise<void> {
    if (uploads.length === 0) {
      return
    }

    await this.filesService.deleteImages(uploads.map((upload) => upload.key))
  }

  async removeUnwanted(clubId: number, keepImageIds: string[]): Promise<void> {
    const assetsToRemove = await findClubImageAssetsNotInKeepList(clubId, keepImageIds)
    const storageKeys = assetsToRemove
      .map((asset) => asset.storageKey)
      .filter((key): key is string => Boolean(key))

    if (storageKeys.length > 0) {
      await this.filesService.deleteImages(storageKeys)
    }

    await deleteClubImageAssetsByIds(
      clubId,
      assetsToRemove.map((asset) => asset.id)
    )
  }

  async saveNew(
    clubId: number,
    files: Express.Multer.File[],
    uploads: UploadedClubImage[]
  ): Promise<ClubImageResponse[]> {
    if (uploads.length === 0) {
      return []
    }

    const images = await createClubImageAssets(
      clubId,
      uploads.map((upload, index) => ({
        name: files[index]?.originalname ?? upload.key,
        url: upload.url,
        storageKey: upload.key,
      }))
    )

    return images.map(toClubImageResponse)
  }

  async getByClubId(clubId: number): Promise<ClubImageResponse[]> {
    const imageRows = await findClubImageAssetsByClubIds([clubId])

    return imageRows.map(({ asset }) => toClubImageResponse(asset))
  }
}
