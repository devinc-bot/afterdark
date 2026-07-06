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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { OwnerRoleGuard } from '../common/guards/owner-role.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { EventsService } from './events.service'

@Controller('events')
export class EventsController {
  constructor(@Inject(EventsService) private readonly eventsService: EventsService) {}

  @Get('my-events')
  @UseGuards(JwtAuthGuard, OwnerRoleGuard)
  listMyEvents(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(listEventsQuerySchema)) query: ListEventsQueryInput
  ): Promise<PaginatedResponse<EventResponse>> {
    return this.eventsService.listMyEvents(user.sub, query)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, OwnerRoleGuard)
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createEventSchema)) body: CreateEventInput
  ): Promise<EventResponse> {
    return this.eventsService.createEvent(user.sub, body)
  }

  @Patch(':documentId')
  @UseGuards(JwtAuthGuard, OwnerRoleGuard)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string,
    @Body(new ZodValidationPipe(updateEventSchema)) body: UpdateEventInput
  ): Promise<EventResponse> {
    return this.eventsService.updateEvent(user.sub, documentId, body)
  }

  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, OwnerRoleGuard)
  delete(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<void> {
    return this.eventsService.deleteEvent(user.sub, documentId)
  }
}
