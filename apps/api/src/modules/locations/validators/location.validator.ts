import { BadRequestException } from '@nestjs/common'
import { LOCATION_IMAGE_MAX_COUNT } from '@repo/validators'

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
  if (keepImageIds.length + files.length > LOCATION_IMAGE_MAX_COUNT) {
    throw new BadRequestException(errorMessage)
  }
}
