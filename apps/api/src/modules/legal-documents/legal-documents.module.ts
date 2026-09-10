import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { AcceptLegalDocumentsUseCase } from './application/accept-legal-documents.use-case'
import { GetLegalDocumentByTypeUseCase } from './application/get-legal-document-by-type.use-case'
import { GetPendingLegalAcceptanceUseCase } from './application/get-pending-legal-acceptance.use-case'
import { GetPublishedLegalDocumentByTypeUseCase } from './application/get-published-legal-document-by-type.use-case'
import { ListLegalDocumentsUseCase } from './application/list-legal-documents.use-case'
import { PublishLegalDocumentUseCase } from './application/publish-legal-document.use-case'
import { SaveLegalDocumentDraftUseCase } from './application/save-legal-document-draft.use-case'
import { LegalAcceptanceInterceptor } from './presentation/legal-acceptance.interceptor'
import { LegalDocumentsController } from './presentation/legal-documents.controller'

@Module({
  imports: [AuthModule],
  controllers: [LegalDocumentsController],
  providers: [
    ListLegalDocumentsUseCase,
    GetLegalDocumentByTypeUseCase,
    SaveLegalDocumentDraftUseCase,
    PublishLegalDocumentUseCase,
    GetPublishedLegalDocumentByTypeUseCase,
    GetPendingLegalAcceptanceUseCase,
    AcceptLegalDocumentsUseCase,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: LegalAcceptanceInterceptor,
    },
  ],
})
export class LegalDocumentsModule {}
