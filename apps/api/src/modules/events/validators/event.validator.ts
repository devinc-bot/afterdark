import { BadRequestException } from '@nestjs/common'
import { EVENT_IMAGE_MAX_COUNT } from '@afterdark/validators'

export function assertValidKeepImageIds(
  currentImageDocumentIds: Iterable<string>,
  keepImageIds: string[],
  errorMessage: string
): void {
  const currentIds = new Set(currentImageDocumentIds)

  for (const documentId of keepImageIds) {
    if (!currentIds.has(documentId)) {
      throw new BadRequestException(errorMessage)
    }
  }
}

export function validateEventImageLimit(
  keepImageIds: string[],
  files: Express.Multer.File[],
  errorMessage: string
): void {
  if (keepImageIds.length + files.length > EVENT_IMAGE_MAX_COUNT) {
    throw new BadRequestException(errorMessage)
  }
}
