import { describe, expect, test } from 'vitest'
import * as uploadContracts from '../src/upload.ts'

type AvatarUploadContracts = {
  AVATAR_MULTIPART_FIELD?: unknown
  AVATAR_OPTIMIZATION?: unknown
  AVATAR_UPLOAD_MAX_BYTES?: unknown
}

const avatarUploadContracts = uploadContracts as AvatarUploadContracts

describe('avatar upload contracts', () => {
  test('uses a dedicated multipart field and 2 MiB upload limit', () => {
    expect(avatarUploadContracts.AVATAR_MULTIPART_FIELD).toBe('avatar')
    expect(avatarUploadContracts.AVATAR_UPLOAD_MAX_BYTES).toBe(2 * 1024 * 1024)
    expect(avatarUploadContracts.AVATAR_UPLOAD_MAX_BYTES).toBeLessThan(
      uploadContracts.IMAGE_UPLOAD_MAX_BYTES
    )
  })

  test('optimizes avatars to a 256px square WebP at quality 80', () => {
    expect(avatarUploadContracts.AVATAR_OPTIMIZATION).toEqual({
      SIZE: 256,
      QUALITY: 80,
    })
  })
})
