import { BadRequestException } from '@nestjs/common'
import { CLUB_IMAGE_MAX_COUNT } from '@afterdark/validators'

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

export function validateImageLimit(
  keepImageIds: string[],
  files: Express.Multer.File[],
  errorMessage: string
): void {
  if (keepImageIds.length + files.length > CLUB_IMAGE_MAX_COUNT) {
    throw new BadRequestException(errorMessage)
  }
}
