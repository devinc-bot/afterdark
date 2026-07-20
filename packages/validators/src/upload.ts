export const ALLOWED_IMAGE_MIME_TYPE = {
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  WEBP: 'image/webp',
  JPG: 'image/jpg',
} as const

export const ALLOWED_IMAGE_MIME_TYPES = [
  ALLOWED_IMAGE_MIME_TYPE.JPEG,
  ALLOWED_IMAGE_MIME_TYPE.PNG,
  ALLOWED_IMAGE_MIME_TYPE.WEBP,
  ALLOWED_IMAGE_MIME_TYPE.JPG,
] as const

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number]

export const IMAGE_EXTENSION_BY_MIME_TYPE: Record<AllowedImageMimeType, string> = {
  [ALLOWED_IMAGE_MIME_TYPE.JPEG]: '.jpg',
  [ALLOWED_IMAGE_MIME_TYPE.PNG]: '.png',
  [ALLOWED_IMAGE_MIME_TYPE.WEBP]: '.webp',
  [ALLOWED_IMAGE_MIME_TYPE.JPG]: '.jpg',
}

export const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024

export const IMAGE_UPLOAD_MAX_MEGABYTES = IMAGE_UPLOAD_MAX_BYTES / (1024 * 1024)

export const IMAGE_OPTIMIZATION = {
  MAX_DIMENSION: 1280,
  QUALITY: 70,
} as const

export const LOCATION_IMAGE_MAX_COUNT = 4

export const EVENT_IMAGE_MAX_COUNT = 2

export function isAllowedImageMimeType(mimeType: string): mimeType is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType)
}
