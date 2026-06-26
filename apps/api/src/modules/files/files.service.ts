import { randomUUID } from 'node:crypto'
import { extname } from 'node:path'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common'
import {
  IMAGE_EXTENSION_BY_MIME_TYPE,
  isAllowedImageMimeType,
  type AllowedImageMimeType,
} from '@afterdark/validators'
import { ENV } from '../common/config/env'
import { FILE_MESSAGE } from './files.constants'

type FilesClient = import('files-sdk').Files

function resolveImageExtension(mimeType: AllowedImageMimeType, originalName: string): string {
  return IMAGE_EXTENSION_BY_MIME_TYPE[mimeType] ?? (extname(originalName).toLowerCase() || '.img')
}

@Injectable()
export class FilesService implements OnModuleInit {
  private client!: FilesClient

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

  buildImageKey(file: Express.Multer.File): string {
    if (!isAllowedImageMimeType(file.mimetype)) {
      throw new BadRequestException(FILE_MESSAGE.INVALID_IMAGE_TYPE)
    }

    const extension = resolveImageExtension(file.mimetype, file.originalname)
    return `${randomUUID()}${extension}`
  }

  async uploadImage(file: Express.Multer.File): Promise<{ key: string; url: string }> {
    if (file.size > ENV.UPLOAD_MAX_BYTES) {
      throw new BadRequestException(FILE_MESSAGE.FILE_TOO_LARGE)
    }
    const key = this.buildImageKey(file)

    try {
      await this.client.upload(key, file.buffer, {
        contentType: file.mimetype,
        cacheControl: 'public, max-age=31536000, immutable',
      })

      const url = await this.client.url(key)
      return { key, url }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }

      throw new InternalServerErrorException(FILE_MESSAGE.UPLOAD_FAILED)
    }
  }

  async deleteImages(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return
    }

    try {
      await Promise.all(keys.map((key) => this.client.delete(key)))
    } catch {
      throw new InternalServerErrorException(FILE_MESSAGE.DELETE_FAILED)
    }
  }
}
