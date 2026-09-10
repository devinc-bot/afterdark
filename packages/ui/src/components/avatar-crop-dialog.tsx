import { useCallback, useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Label } from './ui/label'

export type AvatarCropDialogLabels = {
  title: string
  description: string
  confirm: string
  cancel: string
  zoom: string
  cropArea: string
  cropError: string
}

export type AvatarCropDialogProps = {
  open: boolean
  imageSrc: string
  onOpenChange: (open: boolean) => void
  onConfirm: (blob: Blob) => void | Promise<void>
  onCancel: () => void
  labels: AvatarCropDialogLabels
  isConfirming?: boolean
}

const INITIAL_CROP: Point = { x: 0, y: 0 }
const INITIAL_ZOOM = 1
const MIN_ZOOM = 1
const MAX_ZOOM = 3
const ZOOM_STEP = 0.05
const WEBP_QUALITY = 0.82

function loadImage(imageSrc: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Unable to decode the selected image'))
    image.src = imageSrc
  })
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
          return
        }

        reject(new Error('Unable to create the cropped image'))
      },
      'image/webp',
      WEBP_QUALITY
    )
  })
}

export async function cropImageToBlob(
  imageSrc: string,
  croppedAreaPixels: Area,
  size = 256
): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas is not available')
  }

  canvas.width = size
  canvas.height = size
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    size,
    size
  )

  return canvasToBlob(canvas)
}

export function AvatarCropDialog({
  open,
  imageSrc,
  onOpenChange,
  onConfirm,
  onCancel,
  labels,
  isConfirming = false,
}: AvatarCropDialogProps) {
  const [crop, setCrop] = useState<Point>(INITIAL_CROP)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [cropError, setCropError] = useState<string | null>(null)

  const handleCropComplete = useCallback((_croppedArea: Area, nextCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(nextCroppedAreaPixels)
  }, [])

  const resetCrop = useCallback(() => {
    setCrop(INITIAL_CROP)
    setZoom(INITIAL_ZOOM)
    setCroppedAreaPixels(null)
    setCropError(null)
  }, [])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isConfirming) {
      return
    }

    if (!nextOpen) {
      resetCrop()
      onCancel()
    }
    onOpenChange(nextOpen)
  }

  async function handleConfirm() {
    if (!croppedAreaPixels || isConfirming) {
      return
    }

    try {
      setCropError(null)
      const blob = await cropImageToBlob(imageSrc, croppedAreaPixels)
      await onConfirm(blob)
    } catch {
      setCropError(labels.cropError)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        size="md"
        persistent={isConfirming}
        closeLabel={labels.cancel}
        aria-busy={isConfirming}
        className="max-h-[min(92dvh,40rem)] overflow-y-auto data-[state=open]:animate-none data-[state=closed]:animate-none"
      >
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>

        <div
          className="relative mx-auto aspect-square w-full max-h-[min(70vw,22rem)] max-w-88 overflow-hidden rounded-app-md bg-surface-container-low"
          role="group"
          aria-label={labels.cropArea}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            aspect={1}
            cropShape="rect"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
            classes={{
              containerClassName: 'outline-none',
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar-crop-zoom" variant="field">
            {labels.zoom}
          </Label>
          <input
            id="avatar-crop-zoom"
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={ZOOM_STEP}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            disabled={isConfirming}
            aria-valuemin={MIN_ZOOM}
            aria-valuemax={MAX_ZOOM}
            aria-valuenow={zoom}
            className="h-11 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {cropError ? (
          <p role="alert" className="text-sm text-error">
            {cropError}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isConfirming}
          >
            {labels.cancel}
          </Button>
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            loading={isConfirming}
            disabled={!croppedAreaPixels || isConfirming}
          >
            {labels.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
