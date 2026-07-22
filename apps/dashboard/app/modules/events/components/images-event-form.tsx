import type { EventImageResponse } from '@afterdark/types'
import { EVENT_IMAGE_MAX_COUNT } from '@afterdark/validators'
import { useTranslation } from 'react-i18next'
import { ImageUploadField } from '~/modules/common/components/image-upload-field'

type ImagesEventFormProps = {
  existingImages: EventImageResponse[]
  onExistingImagesChange: (images: EventImageResponse[]) => void
  newImages: File[]
  onNewImagesChange: (files: File[]) => void
}

export function ImagesEventForm({
  existingImages,
  onExistingImagesChange,
  newImages,
  onNewImagesChange,
}: ImagesEventFormProps) {
  const { t } = useTranslation('events')

  return (
    <ImageUploadField
      maxCount={EVENT_IMAGE_MAX_COUNT}
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
