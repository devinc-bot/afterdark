import { randomUUID } from 'node:crypto'
import { extname } from 'node:path'
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common'
import {
  IMAGE_EXTENSION_BY_MIME_TYPE,
  isAllowedImageMimeType,
  type AllowedImageMimeType,
} from '@repo/validators'
import { FILE_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import { ENV } from '../../../../config/env'
import { optimizeImage } from '../../utils/image-optimizer'

type FilesClient = import('files-sdk').Files

@Injectable()
export class FilesService implements OnModuleInit {
  private client!: FilesClient

  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async onModuleInit() {
    const [{ Files }, { r2 }] = await Promise.all([import('files-sdk'), import('files-sdk/r2')])

    this.client = new Files({
      adapter: r2({
        bucket: ENV.R2_BUCKET,
        accountId: ENV.R2_ACCOUNT_ID,
        accessKeyId: ENV.R2_ACCESS_KEY_ID,
        secretAccessKey: ENV.R2_SECRET_ACCESS_KEY,
        publicBaseUrl: ENV.R2_PUBLIC_BASE_URL,
      }),
      prefix: ENV.R2_UPLOAD_PREFIX,
    })
  }

  buildImageKey(mimeType: AllowedImageMimeType, originalName: string): string {
    const extension = IMAGE_EXTENSION_BY_MIME_TYPE[mimeType] ?? extname(originalName).toLowerCase()

    if (!extension) {
      throw new BadRequestException(this.ts.translateError(FILE_ERROR_CODE.INVALID_IMAGE_TYPE))
    }

    return `${randomUUID()}${extension}`
  }

  async uploadImage(file: Express.Multer.File): Promise<{ key: string; url: string }> {
    if (!isAllowedImageMimeType(file.mimetype)) {
      throw new BadRequestException(this.ts.translateError(FILE_ERROR_CODE.INVALID_IMAGE_TYPE))
    }

    if (file.size > ENV.UPLOAD_MAX_BYTES) {
      throw new BadRequestException(this.ts.translateError(FILE_ERROR_CODE.FILE_TOO_LARGE))
    }

    let optimized

    try {
      optimized = await optimizeImage(file.buffer, file.mimetype, {
        maxDimension: ENV.IMAGE_MAX_DIMENSION,
        quality: ENV.IMAGE_QUALITY,
      })
    } catch {
      throw new BadRequestException(this.ts.translateError(FILE_ERROR_CODE.INVALID_IMAGE_TYPE))
    }

    const key = this.buildImageKey(optimized.mimeType, file.originalname)

    try {
      await this.client.upload(key, optimized.buffer, {
        contentType: optimized.mimeType,
        cacheControl: 'public, max-age=31536000, immutable',
      })

      const url = await this.client.url(key)
      return { key, url }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }

      throw new InternalServerErrorException(this.ts.translateError(FILE_ERROR_CODE.UPLOAD_FAILED))
    }
  }

  async deleteImages(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return
    }

    try {
      await Promise.all(keys.map((key) => this.client.delete(key)))
    } catch {
      throw new InternalServerErrorException(this.ts.translateError(FILE_ERROR_CODE.DELETE_FAILED))
    }
  }
}
