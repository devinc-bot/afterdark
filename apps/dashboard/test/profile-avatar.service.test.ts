import { afterEach, describe, expect, test, vi } from 'vitest'
import type { AvatarMutationResponse } from '@repo/types'
import { API_ROUTES, buildApiPath } from '@repo/common'
import { AVATAR_MULTIPART_FIELD } from '@repo/validators'

const apiMocks = vi.hoisted(() => ({
  put: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('~/config/api', async () => {
  const { API_ROUTES: routes } = await import('@repo/common')
  return { api: apiMocks, API_ROUTES: routes }
})

vi.mock('@repo/i18n/client', () => ({
  i18n: { t: (key: string) => key },
}))

import * as settingsServiceModule from '../app/modules/settings/services/settings.service'

type ProfileAvatarService = {
  uploadMyAvatar: (avatar: Blob) => Promise<AvatarMutationResponse>
  removeMyAvatar: () => Promise<AvatarMutationResponse>
}

const profileAvatarService = settingsServiceModule as typeof settingsServiceModule &
  Partial<ProfileAvatarService>
const avatarPath = buildApiPath(API_ROUTES.settings, API_ROUTES.settings.path.avatar())

function requireServiceMethod<Key extends keyof ProfileAvatarService>(
  key: Key
): ProfileAvatarService[Key] {
  const method = profileAvatarService[key]
  expect(method, `settings.service must export ${key}`).toBeTypeOf('function')
  if (typeof method !== 'function') {
    throw new TypeError(`Missing profile avatar service method: ${key}`)
  }
  return method as ProfileAvatarService[Key]
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('dashboard owner profile avatar service', () => {
  test('uploads the cropped avatar through the dedicated multipart PUT endpoint', async () => {
    const uploadMyAvatar = requireServiceMethod('uploadMyAvatar')
    const response = { avatar: 'https://cdn.example.test/users/avatars/owner.webp' }
    apiMocks.put.mockResolvedValue(response)
    const croppedAvatar = new Blob(['cropped-avatar'], { type: 'image/webp' })

    await expect(uploadMyAvatar(croppedAvatar)).resolves.toEqual(response)

    expect(apiMocks.put).toHaveBeenCalledOnce()
    const [path, body] = apiMocks.put.mock.calls[0] ?? []
    expect(path).toBe(avatarPath)
    expect(body).toBeInstanceOf(FormData)
    const avatarPart = (body as FormData).get(AVATAR_MULTIPART_FIELD)
    expect(avatarPart).toBeInstanceOf(Blob)
    expect((avatarPart as Blob).type).toBe('image/webp')
    expect((avatarPart as Blob).size).toBe(croppedAvatar.size)
  })

  test('removes the avatar through the dedicated DELETE endpoint', async () => {
    const removeMyAvatar = requireServiceMethod('removeMyAvatar')
    const response = { avatar: null }
    apiMocks.delete.mockResolvedValue(response)

    await expect(removeMyAvatar()).resolves.toEqual(response)

    expect(apiMocks.delete).toHaveBeenCalledWith(avatarPath)
  })
})
