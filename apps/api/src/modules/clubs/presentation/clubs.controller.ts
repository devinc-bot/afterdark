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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { API_ROUTES } from '@afterdark/common'
import type { JwtPayload } from '@afterdark/types'
import { USER_ROLE } from '@afterdark/types'
import {
  CLUB_IMAGE_MAX_COUNT,
  createClubSchema,
  updateClubMultipartSchema,
  uuidSchema,
  type CreateClubInput,
  type UpdateClubMultipartInput,
} from '@afterdark/validators'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { imageUploadOptions } from '../../files/image-upload.options'
import { CreateClubUseCase } from '../application/create-club.use-case'
import { DeleteClubUseCase } from '../application/delete-club.use-case'
import { ListMyClubsUseCase } from '../application/list-my-clubs.use-case'
import { UpdateClubUseCase } from '../application/update-club.use-case'

@Controller(API_ROUTES.clubs.prefix)
export class ClubsController {
  constructor(
    @Inject(ListMyClubsUseCase) private readonly listMyClubsUseCase: ListMyClubsUseCase,
    @Inject(CreateClubUseCase) private readonly createClubUseCase: CreateClubUseCase,
    @Inject(UpdateClubUseCase) private readonly updateClubUseCase: UpdateClubUseCase,
    @Inject(DeleteClubUseCase) private readonly deleteClubUseCase: DeleteClubUseCase
  ) {}

  @Get(API_ROUTES.clubs.path.list())
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  listMyClubs(@CurrentUser() user: JwtPayload) {
    return this.listMyClubsUseCase.execute(user.sub)
  }

  @Post(API_ROUTES.clubs.path.create())
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', CLUB_IMAGE_MAX_COUNT, imageUploadOptions))
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createClubSchema)) body: CreateClubInput,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    return this.createClubUseCase.execute(user.sub, body, files ?? [])
  }

  @Patch(API_ROUTES.clubs.path.update(':documentId'))
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', CLUB_IMAGE_MAX_COUNT, imageUploadOptions))
  update(
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string,
    @Body(new ZodValidationPipe(updateClubMultipartSchema)) body: UpdateClubMultipartInput,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    const { keepImageIds, ...clubInput } = body
    return this.updateClubUseCase.execute(documentId, clubInput, files ?? [], keepImageIds)
  }

  @Delete(API_ROUTES.clubs.path.delete(':documentId'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  delete(@Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string) {
    return this.deleteClubUseCase.execute(documentId)
  }
}
