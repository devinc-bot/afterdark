import sharp from 'sharp'
import {
  ALLOWED_IMAGE_MIME_TYPE,
  IMAGE_EXTENSION_BY_MIME_TYPE,
  type AllowedImageMimeType,
} from '@repo/validators'

export type OptimizedImage = {
  buffer: Buffer
  mimeType: AllowedImageMimeType
  extension: string
}

type OptimizeImageOptions = {
  maxDimension: number
  quality: number
}

function encodeImage(
  pipeline: sharp.Sharp,
  mimeType: AllowedImageMimeType,
  quality: number
): sharp.Sharp {
  if (mimeType === ALLOWED_IMAGE_MIME_TYPE.PNG) {
    return pipeline.png({ compressionLevel: 9 })
  }

  if (mimeType === ALLOWED_IMAGE_MIME_TYPE.WEBP) {
    return pipeline.webp({ quality })
  }

  return pipeline.jpeg({ quality, mozjpeg: true })
}

export async function optimizeImage(
  buffer: Buffer,
  mimeType: AllowedImageMimeType,
  options: OptimizeImageOptions
): Promise<OptimizedImage> {
  const pipeline = sharp(buffer, { failOn: 'error' })
    .rotate()
    .resize(options.maxDimension, options.maxDimension, {
      fit: 'inside',
      withoutEnlargement: true,
    })

  const optimizedBuffer = await encodeImage(pipeline, mimeType, options.quality).toBuffer()

  return {
    buffer: optimizedBuffer,
    mimeType,
    extension: IMAGE_EXTENSION_BY_MIME_TYPE[mimeType],
  }
}
