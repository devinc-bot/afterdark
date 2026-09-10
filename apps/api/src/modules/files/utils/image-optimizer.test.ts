import sharp from 'sharp'
import { expect, test } from 'vitest'
import * as imageOptimizer from './image-optimizer.ts'

type AvatarOptimizer = {
  optimizeAvatarImage(buffer: Buffer): Promise<{
    buffer: Buffer
    mimeType: string
    extension: string
  }>
}

test('optimizes a non-square image to an exact 256px WebP avatar', async () => {
  const source = await sharp({
    create: {
      width: 640,
      height: 320,
      channels: 3,
      background: { r: 30, g: 90, b: 180 },
    },
  })
    .png()
    .toBuffer()

  const { optimizeAvatarImage } = imageOptimizer as unknown as AvatarOptimizer
  const optimized = await optimizeAvatarImage(source)
  const metadata = await sharp(optimized.buffer).metadata()

  expect(optimized.mimeType).toBe('image/webp')
  expect(optimized.extension).toBe('.webp')
  expect(metadata.format).toBe('webp')
  expect(metadata.width).toBe(256)
  expect(metadata.height).toBe(256)
})
