import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { DeleteApiErrorRecordUseCase } from './application/delete-api-error-record.use-case'
import { ListApiErrorRecordsUseCase } from './application/list-api-error-records.use-case'
import { ErrorsController } from './presentation/errors.controller'

@Module({
  imports: [AuthModule],
  controllers: [ErrorsController],
  providers: [ListApiErrorRecordsUseCase, DeleteApiErrorRecordUseCase, JwtAuthGuard, RolesGuard],
})
export class ErrorsModule {}
