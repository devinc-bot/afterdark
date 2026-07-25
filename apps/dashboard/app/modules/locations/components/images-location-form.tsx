import type { LocationImageResponse } from '@repo/types'
import { LOCATION_IMAGE_MAX_COUNT } from '@repo/validators'
import { useTranslation } from 'react-i18next'
import { ImageUploadField } from '~/modules/common/components/image-upload-field'

type ImagesLocationFormProps = {
  existingImages: LocationImageResponse[]
  onExistingImagesChange: (images: LocationImageResponse[]) => void
  newImages: File[]
  onNewImagesChange: (files: File[]) => void
}

export function ImagesLocationForm({
  existingImages,
  onExistingImagesChange,
  newImages,
  onNewImagesChange,
}: ImagesLocationFormProps) {
  const { t } = useTranslation('locations')

  return (
    <ImageUploadField
      maxCount={LOCATION_IMAGE_MAX_COUNT}
      existingImages={existingImages}
      onExistingImagesChange={onExistingImagesChange}
      newImages={newImages}
      onNewImagesChange={onNewImagesChange}
      texts={{
        count: (current, max) => t('images.count', { current, max }),
        saved: t('images.saved'),
        remove: (name) => t('images.remove', { name }),
        dropzoneTitle: t('images.dropzoneTitle'),
        dropzoneHint: (count, maxMb) => t('images.dropzoneHint', { count, maxMb }),
        maxReached: (max) => t('images.maxReached', { max }),
        invalidType: t('images.invalidType'),
        tooLarge: (maxMb) => t('images.tooLarge', { maxMb }),
      }}
    />
  )
}
