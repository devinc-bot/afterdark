import type { LocationImageResponse } from '@afterdark/types'
import {
  ALLOWED_IMAGE_MIME_TYPES,
  LOCATION_IMAGE_MAX_COUNT,
  IMAGE_UPLOAD_MAX_BYTES,
  IMAGE_UPLOAD_MAX_MEGABYTES,
  isAllowedImageMimeType,
} from '@afterdark/validators'
import { Button, Dropzone, DropzoneEmptyState, FilePreview, toast } from '@afterdark/ui'
import { X } from 'lucide-react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

const IMAGE_ACCEPT = ALLOWED_IMAGE_MIME_TYPES.join(',')

type ImagesLocationFormProps = {
  existingImages: LocationImageResponse[]
  onExistingImagesChange: (images: LocationImageResponse[]) => void
  newImages: File[]
  onNewImagesChange: (files: File[]) => void
}

type ImageValidationError = 'invalidType' | 'tooLarge'

function getImageValidationError(file: File): ImageValidationError | null {
  if (!isAllowedImageMimeType(file.type)) {
    return 'invalidType'
  }
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    return 'tooLarge'
  }
  return null
}

function fileKey(file: File, index: number): string {
  return `${file.name}-${file.size}-${file.lastModified}-${index}`
}

function ExistingLocationImagePreview({ image }: { image: LocationImageResponse }) {
  const { t } = useTranslation('locations')

  return (
    <figure className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted/30">
        <img
          alt={image.name}
          className="absolute inset-0 h-full w-full object-cover"
          src={image.url}
        />
      </div>
      <figcaption className="border-border border-t px-3 py-2">
        <p className="truncate font-medium text-sm">{image.name}</p>
        <p className="text-muted-foreground text-xs">{t('images.saved')}</p>
      </figcaption>
    </figure>
  )
}

export function ImagesLocationForm({
  existingImages,
  onExistingImagesChange,
  newImages,
  onNewImagesChange,
}: ImagesLocationFormProps) {
  const { t } = useTranslation('locations')
  const totalImages = existingImages.length + newImages.length
  const remainingSlots = Math.max(0, LOCATION_IMAGE_MAX_COUNT - totalImages)

  const handleSelect = useCallback(
    (selected: File[]) => {
      const next = [...newImages]

      for (const file of selected) {
        if (existingImages.length + next.length >= LOCATION_IMAGE_MAX_COUNT) {
          break
        }

        const validationError = getImageValidationError(file)
        if (validationError === 'invalidType') {
          toast.error(t('images.invalidType'))
          continue
        }
        if (validationError === 'tooLarge') {
          toast.error(t('images.tooLarge', { maxMb: IMAGE_UPLOAD_MAX_MEGABYTES }))
          continue
        }

        next.push(file)
      }

      if (next.length !== newImages.length) {
        onNewImagesChange(next)
      }
    },
    [existingImages.length, newImages, onNewImagesChange, t]
  )

  const handleRemoveNew = useCallback(
    (index: number) => {
      onNewImagesChange(newImages.filter((_, fileIndex) => fileIndex !== index))
    },
    [newImages, onNewImagesChange]
  )

  const handleRemoveExisting = useCallback(
    (documentId: string) => {
      onExistingImagesChange(existingImages.filter((image) => image.documentId !== documentId))
    },
    [existingImages, onExistingImagesChange]
  )

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-muted">
        {t('images.count', { current: totalImages, max: LOCATION_IMAGE_MAX_COUNT })}
      </p>

      {existingImages.length > 0 || newImages.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {existingImages.map((image) => (
            <li key={image.documentId} className="relative">
              <ExistingLocationImagePreview image={image} />
              <Button
                aria-label={t('images.remove', { name: image.name })}
                className="absolute top-2 right-2 text-ink-muted hover:text-ink"
                onClick={() => handleRemoveExisting(image.documentId)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}

          {newImages.map((file, index) => (
            <li key={fileKey(file, index)} className="relative">
              <FilePreview file={file} />
              <Button
                aria-label={t('images.remove', { name: file.name })}
                className="absolute top-2 right-2 text-ink-muted hover:text-ink"
                onClick={() => handleRemoveNew(index)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {remainingSlots > 0 ? (
        <Dropzone
          accept={IMAGE_ACCEPT}
          local
          maxFiles={remainingSlots}
          maxSize={IMAGE_UPLOAD_MAX_BYTES}
          onSelect={handleSelect}
        >
          <DropzoneEmptyState>
            <p className="font-medium text-sm">{t('images.dropzoneTitle')}</p>
            <p className="text-muted-foreground text-xs">
              {t('images.dropzoneHint', {
                count: remainingSlots,
                maxMb: IMAGE_UPLOAD_MAX_MEGABYTES,
              })}
            </p>
          </DropzoneEmptyState>
        </Dropzone>
      ) : (
        <p className="rounded-lg border border-hairline bg-surface-container px-4 py-3 text-sm text-ink-muted">
          {t('images.maxReached', { max: LOCATION_IMAGE_MAX_COUNT })}
        </p>
      )}
    </div>
  )
}
