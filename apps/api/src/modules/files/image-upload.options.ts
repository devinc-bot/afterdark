import { memoryStorage } from 'multer'
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'
import { isAllowedImageMimeType } from '@repo/validators'
import { FILE_ERROR_CODE } from '@repo/i18n/constants'
import { ENV } from '../../config/env'

export const imageUploadOptions: MulterOptions = {
  limits: {
    fileSize: ENV.UPLOAD_MAX_BYTES,
  },
  storage: memoryStorage(),
  fileFilter: (_request, file, callback) => {
    if (!isAllowedImageMimeType(file.mimetype)) {
      callback(new Error(FILE_ERROR_CODE.INVALID_IMAGE_TYPE), false)
      return
    }

    callback(null, true)
  },
}
