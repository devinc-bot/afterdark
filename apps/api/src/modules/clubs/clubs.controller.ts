import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  createClubSchema,
  updateClubSchema,
  uuidSchema,
  type CreateClubInput,
  type UpdateClubInput,
} from '@afterdark/validators'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { ClubsService } from './clubs.service'

@Controller('clubs')
export class ClubsController {
  constructor(@Inject(ClubsService) private readonly clubsService: ClubsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  list() {
    return this.clubsService.listClubs()
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  create(@Body(new ZodValidationPipe(createClubSchema)) body: CreateClubInput) {
    return this.clubsService.createClub(body)
  }

  @Patch(':documentId')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string,
    @Body(new ZodValidationPipe(updateClubSchema)) body: UpdateClubInput
  ) {
    return this.clubsService.updateClub(documentId, body)
  }
}
