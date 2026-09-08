import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { GetLegalDocumentByTypeUseCase } from './application/get-legal-document-by-type.use-case'
import { GetPublishedLegalDocumentByTypeUseCase } from './application/get-published-legal-document-by-type.use-case'
import { ListLegalDocumentsUseCase } from './application/list-legal-documents.use-case'
import { PublishLegalDocumentUseCase } from './application/publish-legal-document.use-case'
import { SaveLegalDocumentDraftUseCase } from './application/save-legal-document-draft.use-case'
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
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class LegalDocumentsModule {}
