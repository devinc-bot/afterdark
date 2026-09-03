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
import { API_ROUTES } from '@repo/common'
import type { JwtPayload } from '@repo/types'
import { USER_ROLE } from '@repo/types'
import {
  LOCATION_IMAGE_MAX_COUNT,
  createLocationSchema,
  updateLocationMultipartSchema,
  uuidSchema,
  type CreateLocationInput,
  type UpdateLocationMultipartInput,
} from '@repo/validators'
import { ApiRateLimit } from '../../common/decorators/api-rate-limit.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { RATE_LIMIT_PROFILE } from '../../../config/rate-limit.policy'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { imageUploadOptions } from '../../files/image-upload.options'
import { CreateLocationUseCase } from '../application/create-location.use-case'
import { DeleteLocationUseCase } from '../application/delete-location.use-case'
import { ListMyLocationsUseCase } from '../application/list-my-locations.use-case'
import { UpdateLocationUseCase } from '../application/update-location.use-case'

@Controller(API_ROUTES.locations.prefix)
@ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
export class LocationsController {
  constructor(
    @Inject(ListMyLocationsUseCase) private readonly listMyLocationsUseCase: ListMyLocationsUseCase,
    @Inject(CreateLocationUseCase) private readonly createLocationUseCase: CreateLocationUseCase,
    @Inject(UpdateLocationUseCase) private readonly updateLocationUseCase: UpdateLocationUseCase,
    @Inject(DeleteLocationUseCase) private readonly deleteLocationUseCase: DeleteLocationUseCase
  ) {}

  @Get(API_ROUTES.locations.path.list())
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  listMyLocations(@CurrentUser() user: JwtPayload) {
    return this.listMyLocationsUseCase.execute(user.sub)
  }

  @Post(API_ROUTES.locations.path.create())
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', LOCATION_IMAGE_MAX_COUNT, imageUploadOptions))
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createLocationSchema)) body: CreateLocationInput,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    return this.createLocationUseCase.execute(user.sub, body, files ?? [])
  }

  @Patch(API_ROUTES.locations.path.update(':documentId'))
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', LOCATION_IMAGE_MAX_COUNT, imageUploadOptions))
  update(
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string,
    @Body(new ZodValidationPipe(updateLocationMultipartSchema)) body: UpdateLocationMultipartInput,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    const { keepImageIds, ...locationInput } = body
    return this.updateLocationUseCase.execute(documentId, locationInput, files ?? [], keepImageIds)
  }

  @Delete(API_ROUTES.locations.path.delete(':documentId'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  delete(@Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string) {
    return this.deleteLocationUseCase.execute(documentId)
  }
}
