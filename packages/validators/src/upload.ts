import { z } from 'zod'

export const ALLOWED_IMAGE_MIME_TYPE = {
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  WEBP: 'image/webp',
  GIF: 'image/gif',
} as const

export const ALLOWED_IMAGE_MIME_TYPES = [
  ALLOWED_IMAGE_MIME_TYPE.JPEG,
  ALLOWED_IMAGE_MIME_TYPE.PNG,
  ALLOWED_IMAGE_MIME_TYPE.WEBP,
  ALLOWED_IMAGE_MIME_TYPE.GIF,
] as const

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number]

export const IMAGE_EXTENSION_BY_MIME_TYPE: Record<AllowedImageMimeType, string> = {
  [ALLOWED_IMAGE_MIME_TYPE.JPEG]: '.jpg',
  [ALLOWED_IMAGE_MIME_TYPE.PNG]: '.png',
  [ALLOWED_IMAGE_MIME_TYPE.WEBP]: '.webp',
  [ALLOWED_IMAGE_MIME_TYPE.GIF]: '.gif',
}

export const uploadEnvSchema = z.object({
  UPLOAD_MAX_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(5 * 1024 * 1024),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_PUBLIC_BASE_URL: z.url(),
  R2_UPLOAD_PREFIX: z.string().default('images'),
})

export function isAllowedImageMimeType(mimeType: string): mimeType is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType)
}
