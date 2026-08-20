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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { API_ROUTES } from '@repo/common'
import type {
  EventResponse,
  JwtPayload,
  PaginatedResponse,
  PublicEventDetailResponse,
  PublicEventResponse,
} from '@repo/types'
import { USER_ROLE } from '@repo/types'
import {
  EVENT_IMAGE_MAX_COUNT,
  createEventSchema,
  listEventsQuerySchema,
  listPublicEventsQuerySchema,
  updateEventMultipartSchema,
  uuidSchema,
  type CreateEventInput,
  type ListEventsQueryInput,
  type ListPublicEventsQueryInput,
  type UpdateEventMultipartInput,
} from '@repo/validators'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { imageUploadOptions } from '../../files/image-upload.options'
import { CreateEventUseCase } from '../application/create-event.use-case'
import { DeleteEventUseCase } from '../application/delete-event.use-case'
import { GetEventByDocumentIdUseCase } from '../application/get-event-by-document-id.use-case'
import { GetPublicEventByDocumentIdUseCase } from '../application/get-public-event-by-document-id.use-case'
import { ListMyEventsUseCase } from '../application/list-my-events.use-case'
import { ListPublicEventsUseCase } from '../application/list-public-events.use-case'
import { UpdateEventUseCase } from '../application/update-event.use-case'

@Controller(API_ROUTES.events.prefix)
export class EventsController {
  constructor(
    @Inject(ListPublicEventsUseCase)
    private readonly listPublicEventsUseCase: ListPublicEventsUseCase,
    @Inject(GetPublicEventByDocumentIdUseCase)
    private readonly getPublicEventByDocumentIdUseCase: GetPublicEventByDocumentIdUseCase,
    @Inject(ListMyEventsUseCase) private readonly listMyEventsUseCase: ListMyEventsUseCase,
    @Inject(GetEventByDocumentIdUseCase)
    private readonly getEventByDocumentIdUseCase: GetEventByDocumentIdUseCase,
    @Inject(CreateEventUseCase) private readonly createEventUseCase: CreateEventUseCase,
    @Inject(UpdateEventUseCase) private readonly updateEventUseCase: UpdateEventUseCase,
    @Inject(DeleteEventUseCase) private readonly deleteEventUseCase: DeleteEventUseCase
  ) {}

  @Get(API_ROUTES.events.path.listPublic())
  listPublic(
    @Query(new ZodValidationPipe(listPublicEventsQuerySchema)) query: ListPublicEventsQueryInput
  ): Promise<PaginatedResponse<PublicEventResponse>> {
    return this.listPublicEventsUseCase.execute(query)
  }

  @Get(API_ROUTES.events.path.getPublic(':documentId'))
  getPublicByDocumentId(
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<PublicEventDetailResponse> {
    return this.getPublicEventByDocumentIdUseCase.execute(documentId)
  }

  @Get(API_ROUTES.events.path.list())
  @Roles([USER_ROLE.OWNER, USER_ROLE.STAFF])
  @UseGuards(JwtAuthGuard, RolesGuard)
  listMyEvents(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(listEventsQuerySchema)) query: ListEventsQueryInput
  ): Promise<PaginatedResponse<EventResponse>> {
    return this.listMyEventsUseCase.execute(user.sub, user.role, query)
  }

  @Get(API_ROUTES.events.path.get(':documentId'))
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  getByDocumentId(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<EventResponse> {
    return this.getEventByDocumentIdUseCase.execute(user.sub, documentId)
  }

  @Post(API_ROUTES.events.path.create())
  @HttpCode(HttpStatus.CREATED)
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('images', EVENT_IMAGE_MAX_COUNT, imageUploadOptions))
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createEventSchema)) body: CreateEventInput,
    @UploadedFiles() files?: Express.Multer.File[]
  ): Promise<EventResponse> {
    return this.createEventUseCase.execute(user.sub, body, files ?? [])
  }

  @Patch(API_ROUTES.events.path.update(':documentId'))
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('images', EVENT_IMAGE_MAX_COUNT, imageUploadOptions))
  update(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string,
    @Body(new ZodValidationPipe(updateEventMultipartSchema)) body: UpdateEventMultipartInput,
    @UploadedFiles() files?: Express.Multer.File[]
  ): Promise<EventResponse> {
    const { keepImageIds, ...eventInput } = body
    return this.updateEventUseCase.execute(
      user.sub,
      documentId,
      eventInput,
      files ?? [],
      keepImageIds
    )
  }

  @Delete(API_ROUTES.events.path.delete(':documentId'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  delete(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<void> {
    return this.deleteEventUseCase.execute(user.sub, documentId)
  }
}
