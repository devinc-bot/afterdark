import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common'
import { API_ROUTES } from '@repo/common'
import { USER_ROLE, type ApiErrorRecordResponse, type PaginatedResponse } from '@repo/types'
import {
  listApiErrorRecordsQuerySchema,
  type ListApiErrorRecordsQueryInput,
} from '@repo/validators'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { ListApiErrorRecordsUseCase } from '../application/list-api-error-records.use-case'

@Controller(API_ROUTES.errors.prefix)
export class ErrorsController {
  constructor(
    @Inject(ListApiErrorRecordsUseCase)
    private readonly listApiErrorRecords: ListApiErrorRecordsUseCase
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
}
