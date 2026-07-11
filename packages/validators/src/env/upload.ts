import { z } from 'zod'
import { IMAGE_OPTIMIZATION, IMAGE_UPLOAD_MAX_BYTES } from '../upload.ts'

export const uploadEnvSchema = z.object({
  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(IMAGE_UPLOAD_MAX_BYTES),
  IMAGE_MAX_DIMENSION: z.coerce.number().int().positive().default(IMAGE_OPTIMIZATION.MAX_DIMENSION),
  IMAGE_QUALITY: z.coerce.number().int().min(1).max(100).default(IMAGE_OPTIMIZATION.QUALITY),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_PUBLIC_BASE_URL: z.url(),
  R2_UPLOAD_PREFIX: z.string().default('images'),
})
