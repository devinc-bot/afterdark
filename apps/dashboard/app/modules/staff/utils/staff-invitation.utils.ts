export function formatInvitationTimeRemaining(expiresAt: number, now = Date.now()): string {
  const remainingMs = Math.max(0, expiresAt - now)
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const minutes = Math.floor((totalSeconds / 60) % 60)
  const seconds = totalSeconds % 60
  const hours = Math.floor(totalSeconds / 3600)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
