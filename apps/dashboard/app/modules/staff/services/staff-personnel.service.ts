import type { StaffPersonnelItem, StaffStatus } from '@repo/types'
import { i18n } from '@repo/i18n/client'
import { api, API_ROUTES } from '~/config/api'
import { buildApiPath, toApiServiceError } from '@repo/common'

export async function fetchStaffPersonnel(): Promise<StaffPersonnelItem[]> {
  try {
    return await api.get<StaffPersonnelItem[]>(
      buildApiPath(API_ROUTES.staff, API_ROUTES.staff.path.listMyPersonnel())
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('staff:table.loadError'))
  }
}

export async function deleteStaffUser(documentId: string): Promise<void> {
  try {
    await api.delete(buildApiPath(API_ROUTES.staff, API_ROUTES.staff.path.delete(documentId)))
  } catch (error) {
    throw toApiServiceError(error, i18n.t('staff:table.deleteUserError'))
  }
}

export async function updateStaffUserStatus(
  documentId: string,
  status: StaffStatus
): Promise<void> {
  try {
    await api.patch(
      buildApiPath(API_ROUTES.staff, API_ROUTES.staff.path.updateStatus(documentId)),
      {
        status,
      }
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('staff:table.updateStatusError'))
  }
}
