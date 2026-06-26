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
import type { JwtPayload } from '@afterdark/types'
import {
  createClubSchema,
  updateClubMultipartSchema,
  uuidSchema,
  type CreateClubInput,
  type UpdateClubMultipartInput,
} from '@afterdark/validators'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { OwnerRoleGuard } from '../common/guards/owner-role.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { imageUploadOptions } from '../files/image-upload.options'
import { ClubsService } from './clubs.service'

import { CLUB_IMAGE_MAX_COUNT } from '@afterdark/validators'

@Controller('clubs')
export class ClubsController {
  constructor(@Inject(ClubsService) private readonly clubsService: ClubsService) {}

  @Get('my-clubs')
  @UseGuards(JwtAuthGuard, OwnerRoleGuard)
  listMyClubs(@CurrentUser() user: JwtPayload) {
    return this.clubsService.listMyClubs(user.sub)
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', CLUB_IMAGE_MAX_COUNT, imageUploadOptions))
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createClubSchema)) body: CreateClubInput,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    return this.clubsService.createClub(user.sub, body, files ?? [])
  }

  @Patch(':documentId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', CLUB_IMAGE_MAX_COUNT, imageUploadOptions))
  update(
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string,
    @Body(new ZodValidationPipe(updateClubMultipartSchema)) body: UpdateClubMultipartInput,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    const { keepImageIds, ...clubInput } = body
    return this.clubsService.updateClub(documentId, clubInput, files ?? [], keepImageIds)
  }

  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  delete(@Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string) {
    return this.clubsService.deleteClub(documentId)
  }
}
