import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import {
  createClubImageAssets,
  createClubWithAddress,
  deleteClubById,
  deleteClubImageAssetsByIds,
  findClubIdByDocumentId,
  findClubImageAssetsByClubIds,
  findClubImageAssetsNotInKeepList,
  findClubsWithAddressesByOwnerDocumentId,
  findOwnerIdByDocumentId,
  updateClubWithAddress,
} from '@afterdark/db'
import type { ClubImageResponse, ClubResponse } from '@afterdark/types'
import {
  CLUB_IMAGE_MAX_COUNT,
  type CreateClubInput,
  type UpdateClubInput,
} from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'
import { FilesService } from '../files/files.service'
import {
  assertValidKeepImageIds,
  groupClubImagesByClubId,
  toClubImageResponse,
  toClubResponse,
  toClubUpsertInput,
  validateImageLimit,
} from './utils/clubs.mapper'

type UploadedImage = { key: string; url: string }

@Injectable()
export class ClubsService {
  constructor(
    @Inject(FilesService) private readonly filesService: FilesService,
    private readonly ts: TranslationService
  ) {}

  async listMyClubs(ownerDocumentId: string): Promise<ClubResponse[]> {
    const clubs = await findClubsWithAddressesByOwnerDocumentId(ownerDocumentId)
    const clubIds = clubs.map(({ club }) => club.id)
    const imageRows = await findClubImageAssetsByClubIds(clubIds)
    const imagesByClubId = groupClubImagesByClubId(imageRows)

    return clubs.map(({ club, address }) =>
      toClubResponse(club, address, imagesByClubId.get(club.id) ?? [])
    )
  }

  async createClub(
    ownerDocumentId: string,
    input: CreateClubInput,
    files: Express.Multer.File[] = []
  ): Promise<ClubResponse> {
    const ownerId = await findOwnerIdByDocumentId(ownerDocumentId)

    if (!ownerId) {
      throw new NotFoundException(this.ts.translateError('owner.NOT_FOUND'))
    }

    validateImageLimit(
      [],
      files,
      this.ts.translateError('club.TOO_MANY_IMAGES', { max: CLUB_IMAGE_MAX_COUNT })
    )

    const uploads = await this.uploadClubImages(files)
    const row = await this.createClubRecord(ownerId, input)
    const images = await this.saveNewImages(row.club.id, files, uploads)

    return toClubResponse(row.club, row.address, images)
  }

  async updateClub(
    documentId: string,
    input: UpdateClubInput,
    files: Express.Multer.File[] = [],
    keepImageIds: string[] = []
  ): Promise<ClubResponse> {
    const clubId = await this.requireClubId(documentId)
    const currentImages = await findClubImageAssetsByClubIds([clubId])

    assertValidKeepImageIds(
      currentImages.map(({ asset }) => asset.documentId),
      keepImageIds,
      this.ts.translateError('club.INVALID_IMAGE_IDS')
    )
    validateImageLimit(
      keepImageIds,
      files,
      this.ts.translateError('club.TOO_MANY_IMAGES', { max: CLUB_IMAGE_MAX_COUNT })
    )

    const uploadedImages = await this.uploadClubImages(files)

    try {
      const clubData = await this.updateClubData(documentId, clubId, input)
      await this.removeUnwantedImages(clubId, keepImageIds)
      await this.saveNewImages(clubId, files, uploadedImages)

      const images = await this.getClubImages(clubId)

      return toClubResponse(clubData.club, clubData.address, images)
    } catch (error) {
      await this.rollbackUploadedImages(uploadedImages)
      throw error
    }
  }

  async deleteClub(documentId: string): Promise<void> {
    const clubId = await this.requireClubId(documentId)

    try {
      await this.removeUnwantedImages(clubId, [])
      await deleteClubById(clubId)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('club.DELETE_FAILED'))
    }
  }

  private async requireClubId(documentId: string): Promise<number> {
    const clubId = await findClubIdByDocumentId(documentId)

    if (!clubId) {
      throw new NotFoundException(this.ts.translateError('club.NOT_FOUND'))
    }

    return clubId
  }

  private async uploadClubImages(files: Express.Multer.File[]): Promise<UploadedImage[]> {
    if (files.length === 0) {
      return []
    }

    try {
      return await Promise.all(files.map((file) => this.filesService.uploadImage(file)))
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('club.IMAGE_UPLOAD_FAILED'))
    }
  }

  private async rollbackUploadedImages(uploads: UploadedImage[]): Promise<void> {
    if (uploads.length === 0) {
      return
    }

    await this.filesService.deleteImages(uploads.map((upload) => upload.key))
  }

  private async createClubRecord(ownerId: number, input: CreateClubInput) {
    try {
      return await createClubWithAddress(ownerId, toClubUpsertInput(input))
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('club.CREATE_FAILED'))
    }
  }

  private async updateClubData(documentId: string, clubId: number, input: UpdateClubInput) {
    return updateClubWithAddress(documentId, clubId, toClubUpsertInput(input))
  }

  private async removeUnwantedImages(clubId: number, keepImageIds: string[]): Promise<void> {
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

  private async saveNewImages(
    clubId: number,
    files: Express.Multer.File[],
    uploads: UploadedImage[]
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

  private async getClubImages(clubId: number): Promise<ClubImageResponse[]> {
    const imageRows = await findClubImageAssetsByClubIds([clubId])

    return imageRows.map(({ asset }) => toClubImageResponse(asset))
  }
}
