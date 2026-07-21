import { useCallback } from 'react'
import { X } from 'lucide-react'
import {
  ALLOWED_IMAGE_MIME_TYPES,
  IMAGE_UPLOAD_MAX_BYTES,
  IMAGE_UPLOAD_MAX_MEGABYTES,
  isAllowedImageMimeType,
} from '@afterdark/validators'
import { Button, Dropzone, DropzoneEmptyState, FilePreview, toast } from '@afterdark/ui'

const IMAGE_ACCEPT = ALLOWED_IMAGE_MIME_TYPES.join(',')

export type UploadedImage = {
  documentId: string
  name: string
  url: string
}

export type ImageUploadFieldTexts = {
  count: (current: number, max: number) => string
  saved: string
  remove: (name: string) => string
  dropzoneTitle: string
  dropzoneHint: (remaining: number, maxMb: number) => string
  maxReached: (max: number) => string
  invalidType: string
  tooLarge: (maxMb: number) => string
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

function ExistingImagePreview({ image, savedLabel }: { image: UploadedImage; savedLabel: string }) {
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
        <p className="text-muted-foreground text-xs">{savedLabel}</p>
      </figcaption>
    </figure>
  )
}

type ImageUploadFieldProps<T extends UploadedImage> = {
  maxCount: number
  existingImages: T[]
  onExistingImagesChange: (images: T[]) => void
  newImages: File[]
  onNewImagesChange: (files: File[]) => void
  texts: ImageUploadFieldTexts
}

export function ImageUploadField<T extends UploadedImage>({
  maxCount,
  existingImages,
  onExistingImagesChange,
  newImages,
  onNewImagesChange,
  texts,
}: ImageUploadFieldProps<T>) {
  const totalImages = existingImages.length + newImages.length
  const remainingSlots = Math.max(0, maxCount - totalImages)

  const handleSelect = useCallback(
    (selected: File[]) => {
      const next = [...newImages]

      for (const file of selected) {
        if (existingImages.length + next.length >= maxCount) {
          break
        }

        const validationError = getImageValidationError(file)
        if (validationError === 'invalidType') {
          toast.error(texts.invalidType)
          continue
        }
        if (validationError === 'tooLarge') {
          toast.error(texts.tooLarge(IMAGE_UPLOAD_MAX_MEGABYTES))
          continue
        }

        next.push(file)
      }

      if (next.length !== newImages.length) {
        onNewImagesChange(next)
      }
    },
    [existingImages.length, maxCount, newImages, onNewImagesChange, texts]
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
      <p className="text-sm text-ink-muted">{texts.count(totalImages, maxCount)}</p>

      {existingImages.length > 0 || newImages.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {existingImages.map((image) => (
            <li key={image.documentId} className="relative">
              <ExistingImagePreview image={image} savedLabel={texts.saved} />
              <Button
                aria-label={texts.remove(image.name)}
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
                aria-label={texts.remove(file.name)}
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
            <p className="font-medium text-sm">{texts.dropzoneTitle}</p>
            <p className="text-muted-foreground text-xs">
              {texts.dropzoneHint(remainingSlots, IMAGE_UPLOAD_MAX_MEGABYTES)}
            </p>
          </DropzoneEmptyState>
        </Dropzone>
      ) : (
        <p className="rounded-lg border border-hairline bg-surface-container px-4 py-3 text-sm text-ink-muted">
          {texts.maxReached(maxCount)}
        </p>
      )}
    </div>
  )
}
