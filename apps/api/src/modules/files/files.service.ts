import { randomUUID } from 'node:crypto'
import { extname } from 'node:path'
import { Injectable } from '@nestjs/common'
import { Files } from 'files-sdk'
import { r2 } from 'files-sdk/r2'
import {
  IMAGE_EXTENSION_BY_MIME_TYPE,
  isAllowedImageMimeType,
  type AllowedImageMimeType,
} from '@afterdark/validators'
import { ENV } from '../common/config/env'

function resolveImageExtension(mimeType: AllowedImageMimeType, originalName: string): string {
  return IMAGE_EXTENSION_BY_MIME_TYPE[mimeType] ?? (extname(originalName).toLowerCase() || '.img')
}

@Injectable()
export class FilesService {
  private readonly client: Files

  constructor() {
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
      throw new Error('Invalid image mime type')
    }

    const extension = resolveImageExtension(file.mimetype, file.originalname)
    return `${randomUUID()}${extension}`
  }

  async uploadImage(file: Express.Multer.File): Promise<{ key: string; url: string }> {
    const key = this.buildImageKey(file)

    await this.client.upload(key, file.buffer, {
      contentType: file.mimetype,
      cacheControl: 'public, max-age=31536000, immutable',
    })

    const url = await this.client.url(key)

    return { key, url }
  }
}
