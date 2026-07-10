import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import type { JwtPayload, PaginatedResponse, EventResponse } from '@afterdark/types'
import { USER_ROLE } from '@afterdark/types'
import {
  createEventSchema,
  listEventsQuerySchema,
  updateEventSchema,
  uuidSchema,
  type CreateEventInput,
  type ListEventsQueryInput,
  type UpdateEventInput,
} from '@afterdark/validators'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { EventsService } from './events.service'
import { API_ROUTES } from '@afterdark/common'

@Controller(API_ROUTES.events.prefix)
export class EventsController {
  constructor(@Inject(EventsService) private readonly eventsService: EventsService) {}

  @Get(API_ROUTES.events.path.list())
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  listMyEvents(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(listEventsQuerySchema)) query: ListEventsQueryInput
  ): Promise<PaginatedResponse<EventResponse>> {
    return this.eventsService.listMyEvents(user.sub, query)
  }

  @Post(API_ROUTES.events.path.create())
  @HttpCode(HttpStatus.CREATED)
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createEventSchema)) body: CreateEventInput
  ): Promise<EventResponse> {
    return this.eventsService.createEvent(user.sub, body)
  }

  @Patch(API_ROUTES.events.path.update(':documentId'))
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string,
    @Body(new ZodValidationPipe(updateEventSchema)) body: UpdateEventInput
  ): Promise<EventResponse> {
    return this.eventsService.updateEvent(user.sub, documentId, body)
  }

  @Delete(API_ROUTES.events.path.delete(':documentId'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  delete(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<void> {
    return this.eventsService.deleteEvent(user.sub, documentId)
  }
}
