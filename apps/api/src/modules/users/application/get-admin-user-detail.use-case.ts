import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { findAdminUserDetailByAccountDocumentId, type AdminUserDetailRow } from '@repo/db'
import type { AdminUserDetailResponse, AdminUserStatus, AuthProvider, UserRole } from '@repo/types'
import { TranslationService } from '@repo/i18n/server'

@Injectable()
export class GetAdminUserDetailUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(accountDocumentId: string): Promise<AdminUserDetailResponse> {
    let row: AdminUserDetailRow | null

    try {
      row = await findAdminUserDetailByAccountDocumentId(accountDocumentId)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('admin.USERS_DETAIL_FAILED'))
    }

    if (!row) {
      throw new NotFoundException(this.ts.translateError('admin.USERS_DETAIL_NOT_FOUND'))
    }

    return {
      documentId: row.documentId,
      email: row.email,
      provider: row.provider as AuthProvider,
      role: row.roleName as UserRole,
      createdAt: row.createdAt.toISOString(),
      name: row.name,
      lastName: row.lastName,
      phone: row.phone,
      birthday: row.birthday,
      nationalId: row.nationalId,
      status: row.status as AdminUserStatus | null,
      organizationName: row.organizationName,
      taxId: row.taxId,
      address: row.address,
    }
  }
}
