export const TICKET_SCANNER_STATE = {
  IDLE: 'idle',
  REQUESTING_CAMERA: 'requesting_camera',
  SCANNING: 'scanning',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  INVALID: 'invalid',
  EXPIRED: 'expired',
  USED: 'used',
  CAMERA_ERROR: 'camera_error',
} as const

export type TicketScannerState = (typeof TICKET_SCANNER_STATE)[keyof typeof TICKET_SCANNER_STATE]

export const TICKET_SCANNER_FORMATS = ['qr_code'] as const

export const TICKET_SCANNER_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: { ideal: 'environment' },
  width: { ideal: 1920 },
  height: { ideal: 1920 },
}
