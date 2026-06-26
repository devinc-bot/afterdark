import type { ClubImageResponse } from '@afterdark/types'
import {
  ALLOWED_IMAGE_MIME_TYPES,
  CLUB_IMAGE_MAX_COUNT,
  IMAGE_UPLOAD_MAX_BYTES,
  IMAGE_UPLOAD_MAX_MEGABYTES,
  isAllowedImageMimeType,
} from '@afterdark/validators'
import { Button, Dropzone, DropzoneEmptyState, FilePreview, toast } from '@afterdark/ui'
import { X } from 'lucide-react'
import { useCallback } from 'react'

const IMAGE_ACCEPT = ALLOWED_IMAGE_MIME_TYPES.join(',')

type ImagesClubFormProps = {
  existingImages: ClubImageResponse[]
  onExistingImagesChange: (images: ClubImageResponse[]) => void
  newImages: File[]
  onNewImagesChange: (files: File[]) => void
}

function isValidImageFile(file: File): string | null {
  if (!isAllowedImageMimeType(file.type)) {
    return 'El archivo debe ser una imagen JPG, PNG o WEBP.'
  }
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    return `La imagen supera el tamaño máximo de ${IMAGE_UPLOAD_MAX_MEGABYTES} MB.`
  }
  return null
}

function fileKey(file: File, index: number): string {
  return `${file.name}-${file.size}-${file.lastModified}-${index}`
}

function ExistingClubImagePreview({ image }: { image: ClubImageResponse }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex min-h-40 items-center justify-center bg-muted/30 p-4">
        <img alt={image.name} className="max-h-72 w-auto rounded object-contain" src={image.url} />
      </div>
      <figcaption className="border-border border-t px-3 py-2">
        <p className="truncate font-medium text-sm">{image.name}</p>
        <p className="text-muted-foreground text-xs">Imagen guardada</p>
      </figcaption>
    </figure>
  )
}

export function ImagesClubForm({
  existingImages,
  onExistingImagesChange,
  newImages,
  onNewImagesChange,
}: ImagesClubFormProps) {
  const totalImages = existingImages.length + newImages.length
  const remainingSlots = Math.max(0, CLUB_IMAGE_MAX_COUNT - totalImages)

  const handleSelect = useCallback(
    (selected: File[]) => {
      const next = [...newImages]

      for (const file of selected) {
        if (existingImages.length + next.length >= CLUB_IMAGE_MAX_COUNT) {
          break
        }

        const validationError = isValidImageFile(file)
        if (validationError) {
          toast.error(validationError)
          continue
        }

        next.push(file)
      }

      if (next.length !== newImages.length) {
        onNewImagesChange(next)
      }
    },
    [existingImages.length, newImages, onNewImagesChange]
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
        {totalImages} de {CLUB_IMAGE_MAX_COUNT} imágenes
      </p>

      {existingImages.length > 0 || newImages.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {existingImages.map((image) => (
            <li key={image.documentId} className="relative">
              <ExistingClubImagePreview image={image} />
              <Button
                aria-label={`Quitar ${image.name}`}
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
                aria-label={`Quitar ${file.name}`}
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
            <p className="font-medium text-sm">Arrastrá o hacé clic para seleccionar imágenes</p>
            <p className="text-muted-foreground text-xs">
              JPG, PNG o WEBP · hasta {remainingSlots}{' '}
              {remainingSlots === 1 ? 'imagen' : 'imágenes'} · máx. {IMAGE_UPLOAD_MAX_MEGABYTES} MB
              c/u
            </p>
          </DropzoneEmptyState>
        </Dropzone>
      ) : (
        <p className="rounded-lg border border-hairline bg-surface-container px-4 py-3 text-sm text-ink-muted">
          Alcanzaste el máximo de {CLUB_IMAGE_MAX_COUNT} imágenes.
        </p>
      )}
    </div>
  )
}
