import { useEffect, useRef, useState, type ChangeEvent, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { AVATAR_UPLOAD_MAX_BYTES, isAllowedImageMimeType } from '@repo/validators'
import { toast } from '@repo/ui'
import {
  useRemoveMyAvatar,
  useUploadMyAvatar,
} from '~/modules/settings/mutations/use-avatar-mutations'

export function useProfileAvatar(): {
  fileInputRef: RefObject<HTMLInputElement | null>
  cropImageSrc: string | null
  removeDialogOpen: boolean
  setRemoveDialogOpen: (open: boolean) => void
  closeCrop: () => void
  isAvatarBusy: boolean
  isUploading: boolean
  isRemoving: boolean
  handleAvatarSelection: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  handleAvatarConfirm: (avatar: Blob) => Promise<void>
  handleAvatarRemove: () => Promise<void>
} {
  const { t } = useTranslation('settings')
  const uploadAvatar = useUploadMyAvatar()
  const removeAvatar = useRemoveMyAvatar()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const isUploading = uploadAvatar.isPending
  const isRemoving = removeAvatar.isPending
  const isAvatarBusy = isUploading || isRemoving

  useEffect(
    () => () => {
      if (cropImageSrc) {
        URL.revokeObjectURL(cropImageSrc)
      }
    },
    [cropImageSrc]
  )

  function closeCrop() {
    setCropImageSrc(null)
  }

  async function handleAvatarSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''

    if (!file) {
      return
    }

    if (!isAllowedImageMimeType(file.type)) {
      toast.error(t('owner.profile.invalidType'))
      return
    }

    if (file.size > AVATAR_UPLOAD_MAX_BYTES) {
      toast.error(t('owner.profile.fileTooLarge'))
      return
    }

    uploadAvatar.reset()
    const imageSrc = URL.createObjectURL(file)

    try {
      const image = new Image()
      image.src = imageSrc
      await image.decode()
      setCropImageSrc(imageSrc)
    } catch {
      URL.revokeObjectURL(imageSrc)
      toast.error(t('owner.profile.uploadError'))
    }
  }

  async function handleAvatarConfirm(avatar: Blob) {
    try {
      await uploadAvatar.mutateAsync(avatar)
      setCropImageSrc(null)
      toast.success(t('owner.profile.uploadSuccess'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('owner.profile.uploadError'))
    }
  }

  async function handleAvatarRemove() {
    try {
      await removeAvatar.mutateAsync()
      setRemoveDialogOpen(false)
      toast.success(t('owner.profile.removeSuccess'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('owner.profile.removeError'))
    }
  }

  return {
    fileInputRef,
    cropImageSrc,
    removeDialogOpen,
    setRemoveDialogOpen,
    closeCrop,
    isAvatarBusy,
    isUploading,
    isRemoving,
    handleAvatarSelection,
    handleAvatarConfirm,
    handleAvatarRemove,
  }
}
