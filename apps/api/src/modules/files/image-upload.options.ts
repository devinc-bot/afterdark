import { memoryStorage } from 'multer'
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'
import { isAllowedImageMimeType } from '@afterdark/validators'
import { ENV } from '../common/config/env'
import { FILE_MESSAGE } from './files.constants'

export const imageUploadOptions: MulterOptions = {
  limits: {
    fileSize: ENV.UPLOAD_MAX_BYTES,
  },
  storage: memoryStorage(),
  fileFilter: (_request, file, callback) => {
    if (!isAllowedImageMimeType(file.mimetype)) {
      callback(new Error(FILE_MESSAGE.INVALID_IMAGE_TYPE), false)
      return
    }

    callback(null, true)
  },
}
