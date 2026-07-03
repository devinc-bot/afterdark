import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import {
  deleteStaffByDocumentId,
  findCurrentStaffByDocumentId,
  findPersonnelByOwnerDocumentId,
  updateStaffProfileByDocumentId,
  updateStaffStatusByDocumentId,
} from '@afterdark/db'
import {
  STAFF_STATUS,
  type CurrentStaffResponse,
  type StaffPersonnelItem,
  type StaffStatus,
} from '@afterdark/types'
import type { UpdateCurrentStaffInput } from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'
import { toCurrentStaffResponse, toStaffPersonnelItem } from './utils/staff.formatter'

@Injectable()
export class StaffService {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async getCurrentStaff(documentId: string): Promise<CurrentStaffResponse> {
    const row = await findCurrentStaffByDocumentId(documentId)

    if (!row) {
      throw new NotFoundException(this.ts.translateError('staff.NOT_FOUND'))
    }

    return toCurrentStaffResponse(row)
  }

  async updateCurrentStaff(
    documentId: string,
    input: UpdateCurrentStaffInput
  ): Promise<CurrentStaffResponse> {
    const row = await findCurrentStaffByDocumentId(documentId)

    if (!row) {
      throw new NotFoundException(this.ts.translateError('staff.NOT_FOUND'))
    }

    if (row.status !== STAFF_STATUS.ACTIVE) {
      throw new ForbiddenException(this.ts.translateError('staff.INACTIVE'))
    }

    await updateStaffProfileByDocumentId(documentId, {
      name: input.name,
      lastName: input.lastName,
      phone: input.phone,
    })

    return this.getCurrentStaff(documentId)
  }

  async listPersonnelForOwner(ownerDocumentId: string): Promise<StaffPersonnelItem[]> {
    try {
      const rows = await findPersonnelByOwnerDocumentId(ownerDocumentId)
      return rows.map(toStaffPersonnelItem)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('staff.LIST_FAILED'))
    }
  }

  async deleteStaff(ownerDocumentId: string, staffDocumentId: string): Promise<void> {
    let deleted: boolean

    try {
      deleted = await deleteStaffByDocumentId(staffDocumentId, ownerDocumentId)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('staff.DELETE_FAILED'))
    }

    if (!deleted) {
      throw new NotFoundException(this.ts.translateError('staff.NOT_FOUND'))
    }
  }

  async updateStaffStatus(
    ownerDocumentId: string,
    staffDocumentId: string,
    status: StaffStatus
  ): Promise<void> {
    let updated: boolean

    try {
      updated = await updateStaffStatusByDocumentId(staffDocumentId, ownerDocumentId, status)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('staff.UPDATE_FAILED'))
    }

    if (!updated) {
      throw new NotFoundException(this.ts.translateError('staff.NOT_FOUND'))
    }
  }
}
