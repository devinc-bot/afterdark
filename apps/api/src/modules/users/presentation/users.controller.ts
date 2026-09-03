import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common'
import { API_ROUTES } from '@repo/common'
import {
  listAdminUsersQuerySchema,
  updateAdminUserStatusSchema,
  type ListAdminUsersQueryInput,
  type UpdateAdminUserStatusInput,
} from '@repo/validators'
import { uuidSchema } from '@repo/validators'
import type {
  AdminUserDetailResponse,
  AdminUserListItemResponse,
  PaginatedResponse,
} from '@repo/types'
import { USER_ROLE } from '@repo/types'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { ApiRateLimit } from '../../common/decorators/api-rate-limit.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { RATE_LIMIT_PROFILE } from '../../../config/rate-limit.policy'
import { RolesGuard } from '../../common/guards/roles.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { GetAdminUserDetailUseCase } from '../application/get-admin-user-detail.use-case'
import { ListAdminUsersUseCase } from '../application/list-admin-users.use-case'
import { UpdateAdminUserStatusUseCase } from '../application/update-admin-user-status.use-case'

@Controller(API_ROUTES.users.prefix)
@ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
export class UsersController {
  constructor(
    @Inject(ListAdminUsersUseCase) private readonly listAdminUsers: ListAdminUsersUseCase,
    @Inject(GetAdminUserDetailUseCase)
    private readonly getAdminUserDetail: GetAdminUserDetailUseCase,
    @Inject(UpdateAdminUserStatusUseCase)
    private readonly updateAdminUserStatus: UpdateAdminUserStatusUseCase
  ) {}

  @Get(API_ROUTES.users.path.list())
  @Roles([USER_ROLE.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  list(
    @Query(new ZodValidationPipe(listAdminUsersQuerySchema)) query: ListAdminUsersQueryInput
  ): Promise<PaginatedResponse<AdminUserListItemResponse>> {
    return this.listAdminUsers.execute(query)
  }

  @Get(API_ROUTES.users.path.get(':documentId'))
  @Roles([USER_ROLE.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  get(
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<AdminUserDetailResponse> {
    return this.getAdminUserDetail.execute(documentId)
  }

  @Patch(API_ROUTES.users.path.updateStatus(':documentId'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles([USER_ROLE.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateStatus(
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string,
    @Body(new ZodValidationPipe(updateAdminUserStatusSchema)) body: UpdateAdminUserStatusInput
  ): Promise<void> {
    return this.updateAdminUserStatus.execute(documentId, body.status)
  }
}
