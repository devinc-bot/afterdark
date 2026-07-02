import type { StaffPersonnelItem, StaffStatus } from '@afterdark/types'
import { i18n } from '@afterdark/i18n/client'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { toApiServiceError } from '~/modules/common/utils/api-service-error.utils'

function staffApiPath(path: string) {
  return `${API_ROUTES.staff.prefix}${path}`
}

export async function fetchStaffPersonnel(): Promise<StaffPersonnelItem[]> {
  try {
    return await api.get<StaffPersonnelItem[]>(
      staffApiPath(API_ROUTES.staff.path.listMyPersonnel())
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('staff:table.loadError'))
  }
}

export async function deleteStaffUser(documentId: string): Promise<void> {
  try {
    await api.delete(staffApiPath(API_ROUTES.staff.path.delete(documentId)))
  } catch (error) {
    throw toApiServiceError(error, i18n.t('staff:table.deleteUserError'))
  }
}

export async function updateStaffUserStatus(
  documentId: string,
  status: StaffStatus
): Promise<void> {
  try {
    await api.patch(staffApiPath(API_ROUTES.staff.path.updateStatus(documentId)), { status })
  } catch (error) {
    throw toApiServiceError(error, i18n.t('staff:table.updateStatusError'))
  }
}
