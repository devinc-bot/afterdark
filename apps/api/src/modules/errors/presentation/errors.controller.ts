import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { API_ROUTES } from '@repo/common'
import { USER_ROLE, type ApiErrorRecordResponse, type PaginatedResponse } from '@repo/types'
import {
  listApiErrorRecordsQuerySchema,
  uuidSchema,
  type ListApiErrorRecordsQueryInput,
} from '@repo/validators'
import { ApiRateLimit } from '../../common/decorators/api-rate-limit.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { RATE_LIMIT_PROFILE } from '../../../config/rate-limit.policy'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { DeleteApiErrorRecordUseCase } from '../application/delete-api-error-record.use-case'
import { ListApiErrorRecordsUseCase } from '../application/list-api-error-records.use-case'

@Controller(API_ROUTES.errors.prefix)
@ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
export class ErrorsController {
  constructor(
    @Inject(ListApiErrorRecordsUseCase)
    private readonly listApiErrorRecords: ListApiErrorRecordsUseCase,
    @Inject(DeleteApiErrorRecordUseCase)
    private readonly deleteApiErrorRecord: DeleteApiErrorRecordUseCase
  ) {}

  @Get(API_ROUTES.errors.path.list())
  @Roles([USER_ROLE.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  list(
    @Query(new ZodValidationPipe(listApiErrorRecordsQuerySchema))
    query: ListApiErrorRecordsQueryInput
  ): Promise<PaginatedResponse<ApiErrorRecordResponse>> {
    return this.listApiErrorRecords.execute(query)
  }

  @Delete(API_ROUTES.errors.path.delete(':documentId'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles([USER_ROLE.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  delete(
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<void> {
    return this.deleteApiErrorRecord.execute(documentId)
  }
}
