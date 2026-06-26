import type { StaffPersonnelItem } from '@afterdark/types'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { toApiServiceError } from '~/modules/common/utils/api-service-error.utils'

const LIST_STAFF_PERSONNEL_FALLBACK_ERROR =
  'No pudimos cargar el personal. Intentá de nuevo en unos minutos.'

function staffApiPath(path: string) {
  return `${API_ROUTES.staff.prefix}${path}`
}

export async function fetchStaffPersonnel(): Promise<StaffPersonnelItem[]> {
  try {
    return await api.get<StaffPersonnelItem[]>(
      staffApiPath(API_ROUTES.staff.path.listMyPersonnel())
    )
  } catch (error) {
    throw toApiServiceError(error, LIST_STAFF_PERSONNEL_FALLBACK_ERROR)
  }
}
