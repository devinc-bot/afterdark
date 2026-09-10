import { describe, expect, test, vi } from 'vitest'
import { ForbiddenException } from '@nestjs/common'
import { ASSET_TYPE, USER_ROLE, type JwtPayload } from '@repo/types'
import { AVATAR_UPLOAD_MAX_BYTES } from '@repo/validators'
import { FILE_ERROR_CODE } from '@repo/i18n/constants'

type AvatarAsset = {
  id: number
  name: string
  url: string | null
  storageKey: string | null
  type: typeof ASSET_TYPE.IMG
}

const state = vi.hoisted(() => ({
  replaceUserAvatar: vi.fn(),
  replaceOwnerAvatar: vi.fn(),
  clearUserAvatar: vi.fn(),
  clearOwnerAvatar: vi.fn(),
}))

vi.mock('@repo/db', () => ({
  replaceUserAvatar: state.replaceUserAvatar,
  replaceOwnerAvatar: state.replaceOwnerAvatar,
  clearUserAvatar: state.clearUserAvatar,
  clearOwnerAvatar: state.clearOwnerAvatar,
}))

import { RemoveAvatarUseCase } from './remove-avatar.use-case.ts'
import { UploadAvatarUseCase } from './upload-avatar.use-case.ts'

const USER_DOCUMENT_ID = '11111111-1111-4111-8111-111111111111'
const OWNER_DOCUMENT_ID = '22222222-2222-4222-8222-222222222222'
const NEW_KEY = `users/avatars/${USER_DOCUMENT_ID}-33333333-3333-4333-8333-333333333333.webp`
const NEW_URL = `https://cdn.example.com/${NEW_KEY}`

const userPayload: JwtPayload = {
  sub: USER_DOCUMENT_ID,
  email: 'user@example.com',
  role: USER_ROLE.USER,
  sessionDocumentId: 'user-session',
}

const ownerPayload: JwtPayload = {
  sub: OWNER_DOCUMENT_ID,
  email: 'owner@example.com',
  role: USER_ROLE.OWNER,
  sessionDocumentId: 'owner-session',
}

const staffPayload: JwtPayload = {
  sub: '44444444-4444-4444-8444-444444444444',
  email: 'staff@example.com',
  role: USER_ROLE.STAFF,
  sessionDocumentId: 'staff-session',
}

const newAsset: AvatarAsset = {
  id: 20,
  name: 'avatar.png',
  url: NEW_URL,
  storageKey: NEW_KEY,
  type: ASSET_TYPE.IMG,
}

const storedPreviousAsset: AvatarAsset = {
  id: 10,
  name: 'previous-avatar.webp',
  url: 'https://cdn.example.com/users/avatars/previous-avatar.webp',
  storageKey: 'users/avatars/previous-avatar.webp',
  type: ASSET_TYPE.IMG,
}

const googlePreviousAsset: AvatarAsset = {
  id: 11,
  name: 'google-avatar',
  url: 'https://lh3.googleusercontent.com/avatar',
  storageKey: null,
  type: ASSET_TYPE.IMG,
}

function createFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  const buffer = Buffer.from('valid-image')

  return {
    fieldname: 'avatar',
    originalname: 'avatar.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: buffer.length,
    buffer,
    destination: '',
    filename: '',
    path: '',
    stream: undefined as never,
    ...overrides,
  }
}

function createUseCases() {
  const filesService = {
    buildAvatarKey: vi.fn((profileDocumentId: string) =>
      profileDocumentId === USER_DOCUMENT_ID
        ? NEW_KEY
        : `users/avatars/${profileDocumentId}-33333333-3333-4333-8333-333333333333.webp`
    ),
    uploadAvatarWithKey: vi.fn(
      async (_file: Express.Multer.File, key: string): Promise<{ key: string; url: string }> => ({
        key,
        url: `https://cdn.example.com/${key}`,
      })
    ),
    deleteImages: vi.fn(async (_keys: string[]): Promise<void> => undefined),
  }
  const translationService = {
    translateError: vi.fn((code: string) => code),
  }

  return {
    upload: new UploadAvatarUseCase(filesService as never, translationService as never),
    remove: new RemoveAvatarUseCase(filesService as never, translationService as never),
    filesService,
  }
}

function resetState() {
  vi.clearAllMocks()
  state.replaceUserAvatar.mockResolvedValue({
    avatar: newAsset,
    previousAvatar: null,
  })
  state.replaceOwnerAvatar.mockResolvedValue({
    avatar: {
      ...newAsset,
      storageKey: `users/avatars/${OWNER_DOCUMENT_ID}-33333333-3333-4333-8333-333333333333.webp`,
      url: `https://cdn.example.com/users/avatars/${OWNER_DOCUMENT_ID}-33333333-3333-4333-8333-333333333333.webp`,
    },
    previousAvatar: null,
  })
  state.clearUserAvatar.mockResolvedValue(null)
  state.clearOwnerAvatar.mockResolvedValue(null)
}

describe('UploadAvatarUseCase', () => {
  test('uploads and assigns a USER avatar, returning AvatarMutationResponse', async () => {
    resetState()
    const { upload, filesService } = createUseCases()
    const file = createFile()

    await expect(upload.execute(userPayload, file)).resolves.toEqual({ avatar: NEW_URL })

    expect(filesService.buildAvatarKey).toHaveBeenCalledWith(USER_DOCUMENT_ID)
    expect(filesService.uploadAvatarWithKey).toHaveBeenCalledWith(file, NEW_KEY)
    expect(state.replaceUserAvatar).toHaveBeenCalledWith(USER_DOCUMENT_ID, {
      name: file.originalname,
      url: NEW_URL,
      storageKey: NEW_KEY,
      type: ASSET_TYPE.IMG,
    })
    expect(state.replaceOwnerAvatar).not.toHaveBeenCalled()
    expect(filesService.deleteImages).not.toHaveBeenCalled()
  })

  test('dispatches OWNER upload and deletes the previous stored object after DB replacement', async () => {
    resetState()
    const { upload, filesService } = createUseCases()
    const file = createFile({ originalname: 'owner-avatar.jpg', mimetype: 'image/jpeg' })
    const ownerKey = `users/avatars/${OWNER_DOCUMENT_ID}-33333333-3333-4333-8333-333333333333.webp`
    const ownerUrl = `https://cdn.example.com/${ownerKey}`
    state.replaceOwnerAvatar.mockResolvedValue({
      avatar: {
        ...newAsset,
        name: file.originalname,
        storageKey: ownerKey,
        url: ownerUrl,
      },
      previousAvatar: storedPreviousAsset,
    })

    await expect(upload.execute(ownerPayload, file)).resolves.toEqual({ avatar: ownerUrl })

    expect(filesService.buildAvatarKey).toHaveBeenCalledWith(OWNER_DOCUMENT_ID)
    expect(filesService.uploadAvatarWithKey).toHaveBeenCalledWith(file, ownerKey)
    expect(state.replaceOwnerAvatar).toHaveBeenCalledWith(OWNER_DOCUMENT_ID, {
      name: file.originalname,
      url: ownerUrl,
      storageKey: ownerKey,
      type: ASSET_TYPE.IMG,
    })
    expect(state.replaceUserAvatar).not.toHaveBeenCalled()
    expect(filesService.deleteImages).toHaveBeenCalledWith([storedPreviousAsset.storageKey])
    expect(state.replaceOwnerAvatar.mock.invocationCallOrder[0]).toBeLessThan(
      filesService.deleteImages.mock.invocationCallOrder[0]!
    )
  })

  test('unlinks a previous Google avatar without attempting an R2 delete', async () => {
    resetState()
    const { upload, filesService } = createUseCases()
    state.replaceUserAvatar.mockResolvedValue({
      avatar: newAsset,
      previousAvatar: googlePreviousAsset,
    })

    await expect(upload.execute(userPayload, createFile())).resolves.toEqual({
      avatar: NEW_URL,
    })

    expect(filesService.deleteImages).not.toHaveBeenCalled()
  })

  test('keeps a successful replacement result when best-effort old-object cleanup fails', async () => {
    resetState()
    const { upload, filesService } = createUseCases()
    state.replaceUserAvatar.mockResolvedValue({
      avatar: newAsset,
      previousAvatar: storedPreviousAsset,
    })
    filesService.deleteImages.mockRejectedValueOnce(new Error('R2 unavailable'))

    await expect(upload.execute(userPayload, createFile())).resolves.toEqual({
      avatar: NEW_URL,
    })

    expect(filesService.deleteImages).toHaveBeenCalledWith([storedPreviousAsset.storageKey])
  })

  test('rolls back the newly uploaded object when DB replacement fails', async () => {
    resetState()
    const { upload, filesService } = createUseCases()
    state.replaceUserAvatar.mockRejectedValueOnce(new Error('db unavailable'))

    await expect(upload.execute(userPayload, createFile())).rejects.toThrow('db unavailable')

    expect(filesService.deleteImages).toHaveBeenCalledWith([NEW_KEY])
  })

  test('rejects STAFF before building a key, uploading, or changing DB state', async () => {
    resetState()
    const { upload, filesService } = createUseCases()

    await expect(upload.execute(staffPayload, createFile())).rejects.toBeInstanceOf(
      ForbiddenException
    )

    expect(filesService.buildAvatarKey).not.toHaveBeenCalled()
    expect(filesService.uploadAvatarWithKey).not.toHaveBeenCalled()
    expect(state.replaceUserAvatar).not.toHaveBeenCalled()
    expect(state.replaceOwnerAvatar).not.toHaveBeenCalled()
  })

  test('rejects a missing file with FILE_REQUIRED before side effects', async () => {
    resetState()
    const { upload, filesService } = createUseCases()

    await expect(upload.execute(userPayload, undefined as never)).rejects.toMatchObject({
      name: 'BadRequestException',
      message: FILE_ERROR_CODE.FILE_REQUIRED,
    })

    expect(filesService.buildAvatarKey).not.toHaveBeenCalled()
    expect(filesService.uploadAvatarWithKey).not.toHaveBeenCalled()
    expect(state.replaceUserAvatar).not.toHaveBeenCalled()
  })

  test('rejects an unsupported MIME type with INVALID_IMAGE_TYPE before side effects', async () => {
    resetState()
    const { upload, filesService } = createUseCases()

    await expect(
      upload.execute(userPayload, createFile({ originalname: 'avatar.gif', mimetype: 'image/gif' }))
    ).rejects.toMatchObject({
      name: 'BadRequestException',
      message: FILE_ERROR_CODE.INVALID_IMAGE_TYPE,
    })

    expect(filesService.buildAvatarKey).not.toHaveBeenCalled()
    expect(filesService.uploadAvatarWithKey).not.toHaveBeenCalled()
    expect(state.replaceUserAvatar).not.toHaveBeenCalled()
  })

  test('enforces the dedicated 2 MiB avatar limit before side effects', async () => {
    resetState()
    const { upload, filesService } = createUseCases()

    await expect(
      upload.execute(userPayload, createFile({ size: AVATAR_UPLOAD_MAX_BYTES + 1 }))
    ).rejects.toMatchObject({
      name: 'BadRequestException',
      message: FILE_ERROR_CODE.FILE_TOO_LARGE,
    })

    expect(filesService.buildAvatarKey).not.toHaveBeenCalled()
    expect(filesService.uploadAvatarWithKey).not.toHaveBeenCalled()
    expect(state.replaceUserAvatar).not.toHaveBeenCalled()
  })
})

describe('RemoveAvatarUseCase', () => {
  test('clears a USER avatar and deletes its stored object after the DB mutation', async () => {
    resetState()
    const { remove, filesService } = createUseCases()
    state.clearUserAvatar.mockResolvedValue(storedPreviousAsset)

    await expect(remove.execute(userPayload)).resolves.toEqual({ avatar: null })

    expect(state.clearUserAvatar).toHaveBeenCalledWith(USER_DOCUMENT_ID)
    expect(state.clearOwnerAvatar).not.toHaveBeenCalled()
    expect(filesService.deleteImages).toHaveBeenCalledWith([storedPreviousAsset.storageKey])
    expect(state.clearUserAvatar.mock.invocationCallOrder[0]).toBeLessThan(
      filesService.deleteImages.mock.invocationCallOrder[0]!
    )
  })

  test('clears an OWNER external Google avatar without attempting an R2 delete', async () => {
    resetState()
    const { remove, filesService } = createUseCases()
    state.clearOwnerAvatar.mockResolvedValue(googlePreviousAsset)

    await expect(remove.execute(ownerPayload)).resolves.toEqual({ avatar: null })

    expect(state.clearOwnerAvatar).toHaveBeenCalledWith(OWNER_DOCUMENT_ID)
    expect(state.clearUserAvatar).not.toHaveBeenCalled()
    expect(filesService.deleteImages).not.toHaveBeenCalled()
  })

  test('returns null without remote cleanup when the USER already has no avatar', async () => {
    resetState()
    const { remove, filesService } = createUseCases()

    await expect(remove.execute(userPayload)).resolves.toEqual({ avatar: null })

    expect(state.clearUserAvatar).toHaveBeenCalledWith(USER_DOCUMENT_ID)
    expect(filesService.deleteImages).not.toHaveBeenCalled()
  })

  test('keeps a successful remove result when best-effort old-object cleanup fails', async () => {
    resetState()
    const { remove, filesService } = createUseCases()
    state.clearUserAvatar.mockResolvedValue(storedPreviousAsset)
    filesService.deleteImages.mockRejectedValueOnce(new Error('R2 unavailable'))

    await expect(remove.execute(userPayload)).resolves.toEqual({ avatar: null })

    expect(filesService.deleteImages).toHaveBeenCalledWith([storedPreviousAsset.storageKey])
  })

  test('rejects STAFF before changing DB state or deleting objects', async () => {
    resetState()
    const { remove, filesService } = createUseCases()

    await expect(remove.execute(staffPayload)).rejects.toBeInstanceOf(ForbiddenException)

    expect(state.clearUserAvatar).not.toHaveBeenCalled()
    expect(state.clearOwnerAvatar).not.toHaveBeenCalled()
    expect(filesService.deleteImages).not.toHaveBeenCalled()
  })
})
