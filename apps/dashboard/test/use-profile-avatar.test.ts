// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { AVATAR_UPLOAD_MAX_BYTES } from '@repo/validators'

const mutationMocks = vi.hoisted(() => ({
  upload: {
    isPending: false,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  },
  remove: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
}))

const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}))

const imageMocks = vi.hoisted(() => ({
  decode: vi.fn(),
}))

vi.mock('~/modules/settings/mutations/use-avatar-mutations', () => ({
  useRemoveMyAvatar: () => mutationMocks.remove,
  useUploadMyAvatar: () => mutationMocks.upload,
}))

vi.mock('@repo/ui', () => ({
  toast: toastMocks,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

import { useProfileAvatar } from '../app/modules/owner/hooks/use-profile-avatar'

class MockImage {
  src = ''
  decode = imageMocks.decode
}

function selectionEvent(file: File | undefined) {
  const input = document.createElement('input')
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: file ? [file] : [],
  })
  input.value = 'selected-file'

  return { currentTarget: input } as React.ChangeEvent<HTMLInputElement>
}

function imageFile({ type = 'image/png', size = 1 } = {}) {
  return new File([new Uint8Array(size)], 'avatar.png', { type })
}

describe('useProfileAvatar', () => {
  const createObjectURL = vi.fn()
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    mutationMocks.upload.isPending = false
    mutationMocks.remove.isPending = false
    mutationMocks.upload.mutateAsync.mockResolvedValue(undefined)
    mutationMocks.remove.mutateAsync.mockResolvedValue(undefined)
    imageMocks.decode.mockResolvedValue(undefined)
    createObjectURL.mockReturnValue('blob:avatar')

    vi.stubGlobal('Image', MockImage)
    Object.assign(URL, { createObjectURL, revokeObjectURL })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  test('ignores an empty selection and clears the input', async () => {
    const { result } = renderHook(() => useProfileAvatar())
    const event = selectionEvent(undefined)

    await act(() => result.current.handleAvatarSelection(event))

    expect(event.currentTarget.value).toBe('')
    expect(createObjectURL).not.toHaveBeenCalled()
    expect(mutationMocks.upload.reset).not.toHaveBeenCalled()
    expect(toastMocks.error).not.toHaveBeenCalled()
  })

  test('rejects invalid avatar types and files exceeding the size limit', async () => {
    const { result } = renderHook(() => useProfileAvatar())

    await act(() =>
      result.current.handleAvatarSelection(selectionEvent(imageFile({ type: 'application/pdf' })))
    )
    await act(() =>
      result.current.handleAvatarSelection(
        selectionEvent(imageFile({ size: AVATAR_UPLOAD_MAX_BYTES + 1 }))
      )
    )

    expect(toastMocks.error).toHaveBeenNthCalledWith(1, 'owner.profile.invalidType')
    expect(toastMocks.error).toHaveBeenNthCalledWith(2, 'owner.profile.fileTooLarge')
    expect(createObjectURL).not.toHaveBeenCalled()
    expect(mutationMocks.upload.reset).not.toHaveBeenCalled()
  })

  test('opens the crop dialog only after decoding a valid selected image', async () => {
    const { result } = renderHook(() => useProfileAvatar())

    await act(() => result.current.handleAvatarSelection(selectionEvent(imageFile())))

    expect(mutationMocks.upload.reset).toHaveBeenCalledOnce()
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(imageMocks.decode).toHaveBeenCalledOnce()
    expect(result.current.cropImageSrc).toBe('blob:avatar')

    act(() => result.current.closeCrop())
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:avatar')
  })

  test('revokes an undecodable image and reports an upload error', async () => {
    imageMocks.decode.mockRejectedValueOnce(new Error('decode failed'))
    const { result } = renderHook(() => useProfileAvatar())

    await act(() => result.current.handleAvatarSelection(selectionEvent(imageFile())))

    expect(result.current.cropImageSrc).toBeNull()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:avatar')
    expect(toastMocks.error).toHaveBeenCalledWith('owner.profile.uploadError')
  })

  test('revokes the previous crop URL when it changes and on unmount', async () => {
    createObjectURL.mockReturnValueOnce('blob:first').mockReturnValueOnce('blob:second')
    const { result, unmount } = renderHook(() => useProfileAvatar())

    await act(() => result.current.handleAvatarSelection(selectionEvent(imageFile())))
    await act(() => result.current.handleAvatarSelection(selectionEvent(imageFile())))

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:first')
    unmount()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:second')
  })

  test('uploads the confirmed crop, closes it, and reports success', async () => {
    const { result } = renderHook(() => useProfileAvatar())
    const avatar = new Blob(['cropped'], { type: 'image/png' })

    await act(() => result.current.handleAvatarSelection(selectionEvent(imageFile())))
    await act(() => result.current.handleAvatarConfirm(avatar))

    expect(mutationMocks.upload.mutateAsync).toHaveBeenCalledWith(avatar)
    expect(result.current.cropImageSrc).toBeNull()
    expect(toastMocks.success).toHaveBeenCalledWith('owner.profile.uploadSuccess')
  })

  test('reports upload failures using the error message or translated fallback', async () => {
    mutationMocks.upload.mutateAsync.mockRejectedValueOnce(new Error('upload unavailable'))
    const { result } = renderHook(() => useProfileAvatar())

    await act(() => result.current.handleAvatarConfirm(new Blob()))
    mutationMocks.upload.mutateAsync.mockRejectedValueOnce('unknown failure')
    await act(() => result.current.handleAvatarConfirm(new Blob()))

    expect(toastMocks.error).toHaveBeenNthCalledWith(1, 'upload unavailable')
    expect(toastMocks.error).toHaveBeenNthCalledWith(2, 'owner.profile.uploadError')
  })

  test('removes an avatar, closes its dialog, and reports success', async () => {
    const { result } = renderHook(() => useProfileAvatar())
    act(() => result.current.setRemoveDialogOpen(true))

    await act(() => result.current.handleAvatarRemove())

    expect(mutationMocks.remove.mutateAsync).toHaveBeenCalledOnce()
    expect(result.current.removeDialogOpen).toBe(false)
    expect(toastMocks.success).toHaveBeenCalledWith('owner.profile.removeSuccess')
  })

  test('keeps the remove dialog open and reports mutation failures', async () => {
    mutationMocks.remove.mutateAsync.mockRejectedValueOnce(new Error('remove unavailable'))
    const { result } = renderHook(() => useProfileAvatar())
    act(() => result.current.setRemoveDialogOpen(true))

    await act(() => result.current.handleAvatarRemove())
    mutationMocks.remove.mutateAsync.mockRejectedValueOnce('unknown failure')
    await act(() => result.current.handleAvatarRemove())

    expect(result.current.removeDialogOpen).toBe(true)
    expect(toastMocks.error).toHaveBeenNthCalledWith(1, 'remove unavailable')
    expect(toastMocks.error).toHaveBeenNthCalledWith(2, 'owner.profile.removeError')
  })

  test('exposes the mutation pending states through avatar busy flags', () => {
    mutationMocks.upload.isPending = true
    mutationMocks.remove.isPending = true

    const { result } = renderHook(() => useProfileAvatar())

    expect(result.current.isUploading).toBe(true)
    expect(result.current.isRemoving).toBe(true)
    expect(result.current.isAvatarBusy).toBe(true)
  })
})
