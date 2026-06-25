import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  PayloadTooLargeException,
} from '@nestjs/common'
import type { Response } from 'express'
import { MulterError } from 'multer'
import { FILE_MESSAGE } from '../../files/files.constants'

const MULTER_ERROR_CODE = {
  limitPartCount: 'LIMIT_PART_COUNT',
  limitFileSize: 'LIMIT_FILE_SIZE',
  limitFileCount: 'LIMIT_FILE_COUNT',
  limitFieldKey: 'LIMIT_FIELD_KEY',
  limitFieldValue: 'LIMIT_FIELD_VALUE',
  limitFieldCount: 'LIMIT_FIELD_COUNT',
  limitUnexpectedFile: 'LIMIT_UNEXPECTED_FILE',
} as const

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()

    if (exception.code === MULTER_ERROR_CODE.limitFileSize) {
      const error = new PayloadTooLargeException(FILE_MESSAGE.FILE_TOO_LARGE)
      response.status(error.getStatus()).json({
        statusCode: error.getStatus(),
        message: error.message,
      })
      return
    }

    const error = new BadRequestException(FILE_MESSAGE.INVALID_IMAGE_TYPE)
    response.status(error.getStatus()).json({
      statusCode: error.getStatus(),
      message: error.message,
    })
  }
}
