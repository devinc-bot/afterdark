import { ForbiddenException, HttpException, Inject, Injectable, NestInterceptor } from '@nestjs/common'
import type { CallHandler, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { findStaleLegalDocumentTypesForAccount } from '@repo/db'
import { LEGAL_DOCUMENT_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import { USER_ROLE, type JwtPayload } from '@repo/types'
import type { Observable } from 'rxjs'
import { AllowStaleLegalAcceptance } from '../../common/decorators/allow-stale-legal-acceptance.decorator.ts'
import {
  findAccountIdForLegalAudience,
  legalDocumentTypesForRole,
} from '../application/legal-document-audience.ts'

@Injectable()
export class LegalAcceptanceInterceptor implements NestInterceptor {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    await this.assertCurrentAcceptance(context)
    return next.handle()
  }

  private async assertCurrentAcceptance(context: ExecutionContext): Promise<void> {
    const allowStale = this.reflector.getAllAndOverride(AllowStaleLegalAcceptance, [
      context.getHandler(),
      context.getClass(),
    ])
    if (allowStale) {
      return
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>()
    const user = request.user
    if (!user || (user.role !== USER_ROLE.USER && user.role !== USER_ROLE.OWNER)) {
      return
    }

    const types = legalDocumentTypesForRole(user.role)
    if (!types) {
      return
    }

    try {
      const accountId = await findAccountIdForLegalAudience(user.sub, user.role)
      if (accountId === null) {
        return
      }

      const staleTypes = await findStaleLegalDocumentTypesForAccount({ accountId, types })
      if (staleTypes.length > 0) {
        throw new ForbiddenException(
          this.ts.translateError(LEGAL_DOCUMENT_ERROR_CODE.ACCEPTANCE_REQUIRED)
        )
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }

      throw new ForbiddenException(
        this.ts.translateError(LEGAL_DOCUMENT_ERROR_CODE.ACCEPTANCE_REQUIRED)
      )
    }
  }
}
