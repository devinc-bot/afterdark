import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common'
import { API_ROUTES } from '@repo/common'
import { USER_ROLE, type JwtPayload, type TicketTypeResponse } from '@repo/types'
import { createTicketTypeSchema, type CreateTicketTypeInput } from '@repo/validators'
import { ApiRateLimit } from '../../common/decorators/api-rate-limit.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { RATE_LIMIT_PROFILE } from '../../../config/rate-limit.policy'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { CreateTicketTypeUseCase } from '../application/create-ticket-type.use-case'
import { ListTicketTypesUseCase } from '../application/list-ticket-types.use-case'

@Controller(API_ROUTES.ticketTypes.prefix)
@Roles([USER_ROLE.OWNER])
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
export class TicketTypesController {
  constructor(
    @Inject(ListTicketTypesUseCase) private readonly listTicketTypesUseCase: ListTicketTypesUseCase,
    @Inject(CreateTicketTypeUseCase)
    private readonly createTicketTypeUseCase: CreateTicketTypeUseCase
  ) {}

  @Get(API_ROUTES.ticketTypes.path.list())
  list(@CurrentUser() user: JwtPayload): Promise<TicketTypeResponse[]> {
    return this.listTicketTypesUseCase.execute(user.sub)
  }

  @Post(API_ROUTES.ticketTypes.path.create())
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createTicketTypeSchema)) body: CreateTicketTypeInput
  ): Promise<TicketTypeResponse> {
    return this.createTicketTypeUseCase.execute(user.sub, body)
  }
}
