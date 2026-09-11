import { createSessionCleanup } from '@repo/common'
import { clearAuthSession } from '~/modules/auth/utils/auth-storage.utils'

const cleanup = createSessionCleanup({ clearAuthSession })

export const registerSessionStateCleanup = cleanup.registerSessionStateCleanup
export const clearLocalSession = cleanup.clearLocalSession
