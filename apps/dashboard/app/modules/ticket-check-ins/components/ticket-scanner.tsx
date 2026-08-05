import {
  Scanner,
  type IDetectedBarcode,
  type IScannerError,
  type IScannerHandle,
} from '@yudiel/react-qr-scanner'
import { QueryFactoryError } from '@repo/common'
import { Button } from '@repo/ui'
import { CameraOff, Loader2, ScanLine } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TICKET_SCANNER_CONSTRAINTS,
  TICKET_SCANNER_FORMATS,
  TICKET_SCANNER_STATE,
  type TicketScannerState,
} from '../constants/ticket-check-in.constants'
import { useTicketCheckIn } from '../mutations/use-ticket-check-in'
import { TicketCheckInResult } from './ticket-check-in-result'

function getErrorState(error: Error): TicketScannerState {
  if (error instanceof QueryFactoryError) {
    if (error.status === 409) return TICKET_SCANNER_STATE.USED
    if (error.status === 410) return TICKET_SCANNER_STATE.EXPIRED
  }

  return TICKET_SCANNER_STATE.INVALID
}

export function TicketScanner() {
  const { t } = useTranslation('tickets')
  const scannerRef = useRef<IScannerHandle>(null)
  const scanLockedRef = useRef(false)
  const [scannerKey, setScannerKey] = useState(0)
  const [state, setState] = useState<TicketScannerState>(TICKET_SCANNER_STATE.REQUESTING_CAMERA)
  const checkInMutation = useTicketCheckIn()

  const isCameraActive =
    state === TICKET_SCANNER_STATE.REQUESTING_CAMERA || state === TICKET_SCANNER_STATE.SCANNING
  const isPaused = !isCameraActive

  useEffect(() => {
    if (state !== TICKET_SCANNER_STATE.REQUESTING_CAMERA) return

    let animationFrameId = 0
    const detectReadyVideo = () => {
      const video = scannerRef.current?.getVideoElement()

      if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        setState(TICKET_SCANNER_STATE.SCANNING)
        return
      }

      animationFrameId = window.requestAnimationFrame(detectReadyVideo)
    }

    animationFrameId = window.requestAnimationFrame(detectReadyVideo)
    return () => window.cancelAnimationFrame(animationFrameId)
  }, [scannerKey, state])

  const handleScan = useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      const token = detectedCodes[0]?.rawValue.trim()
      if (!token || scanLockedRef.current) return

      scanLockedRef.current = true
      setState(TICKET_SCANNER_STATE.SUBMITTING)
      checkInMutation.mutate(
        { token },
        {
          onSuccess: () => setState(TICKET_SCANNER_STATE.SUCCESS),
          onError: (error) => setState(getErrorState(error)),
        }
      )
    },
    [checkInMutation]
  )

  const handleCameraError = useCallback((_error: IScannerError) => {
    scanLockedRef.current = true
    setState(TICKET_SCANNER_STATE.CAMERA_ERROR)
  }, [])

  const handleRetry = useCallback(() => {
    checkInMutation.reset()
    scanLockedRef.current = false
    setState(TICKET_SCANNER_STATE.REQUESTING_CAMERA)
    setScannerKey((currentKey) => currentKey + 1)
  }, [checkInMutation])

  const isResultState =
    state === TICKET_SCANNER_STATE.SUCCESS ||
    state === TICKET_SCANNER_STATE.INVALID ||
    state === TICKET_SCANNER_STATE.EXPIRED ||
    state === TICKET_SCANNER_STATE.USED

  if (isResultState) {
    return (
      <TicketCheckInResult state={state} result={checkInMutation.data} onScanNext={handleRetry} />
    )
  }

  if (state === TICKET_SCANNER_STATE.CAMERA_ERROR) {
    return (
      <section
        className="flex min-h-80 flex-col items-center justify-center gap-5 rounded-app bg-surface-card px-6 py-10 text-center"
        role="alert"
      >
        <CameraOff className="size-10 text-error" aria-hidden="true" />
        <div className="max-w-md space-y-2">
          <h2 className="font-heading text-xl font-semibold text-ink">
            {t('checkIn.cameraErrorTitle')}
          </h2>
          <p className="text-base text-ink-muted">{t('checkIn.cameraErrorDescription')}</p>
        </div>
        <Button type="button" onClick={handleRetry} iconLeft={<ScanLine aria-hidden="true" />}>
          {t('checkIn.retry')}
        </Button>
      </section>
    )
  }

  return (
    <section className="space-y-4" aria-label={t('checkIn.cameraInstruction')}>
      <div className="relative aspect-square max-h-[min(70vh,42rem)] w-full overflow-hidden rounded-app bg-surface-container-lowest">
        <Scanner
          key={scannerKey}
          ref={scannerRef}
          onScan={handleScan}
          onError={handleCameraError}
          constraints={TICKET_SCANNER_CONSTRAINTS}
          formats={[...TICKET_SCANNER_FORMATS]}
          paused={isPaused}
          allowMultiple={false}
          sound={false}
          components={{ finder: false, torch: true, zoom: true }}
          styles={{
            container: { width: '100%', height: '100%' },
            video: { width: '100%', height: '100%', objectFit: 'cover' },
          }}
        />

        {isCameraActive ? (
          <div
            className="pointer-events-none absolute inset-0 grid place-items-center"
            aria-hidden="true"
          >
            <div className="size-[68%] rounded-app border-2 border-primary shadow-[0_0_0_999px_rgba(0,0,0,0.42)]" />
          </div>
        ) : null}

        {state === TICKET_SCANNER_STATE.REQUESTING_CAMERA ||
        state === TICKET_SCANNER_STATE.SUBMITTING ? (
          <div className="absolute inset-0 grid place-items-center bg-surface-strong">
            <div className="flex items-center gap-3 rounded-app bg-surface-card px-4 py-3 text-ink">
              <Loader2
                className="size-5 animate-spin text-primary motion-reduce:animate-none"
                aria-hidden="true"
              />
              <span className="text-sm font-medium">
                {state === TICKET_SCANNER_STATE.SUBMITTING
                  ? t('checkIn.submitting')
                  : t('checkIn.cameraLoading')}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <p className="text-center text-base text-ink-muted" role="status" aria-live="polite">
        {state === TICKET_SCANNER_STATE.SCANNING ? t('checkIn.cameraInstruction') : null}
      </p>
    </section>
  )
}
