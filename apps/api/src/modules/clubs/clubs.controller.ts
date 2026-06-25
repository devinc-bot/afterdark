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
  UseGuards,
} from '@nestjs/common'
import type { JwtPayload } from '@afterdark/types'
import {
  createClubSchema,
  updateClubSchema,
  uuidSchema,
  type CreateClubInput,
  type UpdateClubInput,
} from '@afterdark/validators'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { OwnerRoleGuard } from '../common/guards/owner-role.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { ClubsService } from './clubs.service'

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
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createClubSchema)) body: CreateClubInput
  ) {
    return this.clubsService.createClub(user.sub, body)
  }

  @Patch(':documentId')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string,
    @Body(new ZodValidationPipe(updateClubSchema)) body: UpdateClubInput
  ) {
    return this.clubsService.updateClub(documentId, body)
  }

  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  delete(@Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string) {
    return this.clubsService.deleteClub(documentId)
  }
}
