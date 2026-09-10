import { memoryStorage, MulterError } from 'multer'
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'
import { AVATAR_UPLOAD_MAX_BYTES, isAllowedImageMimeType } from '@repo/validators'

export const avatarUploadOptions: MulterOptions = {
  limits: {
    fileSize: AVATAR_UPLOAD_MAX_BYTES,
  },
  storage: memoryStorage(),
  fileFilter: (_request, file, callback) => {
    if (!isAllowedImageMimeType(file.mimetype)) {
      callback(new MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname), false)
      return
    }

    callback(null, true)
  },
}
