import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common'
import { createClubSchema, type CreateClubInput } from '@afterdark/validators'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { ClubsService } from './clubs.service'

@Controller('clubs')
export class ClubsController {
  constructor(@Inject(ClubsService) private readonly clubsService: ClubsService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  create(@Body(new ZodValidationPipe(createClubSchema)) body: CreateClubInput) {
    return this.clubsService.createClub(body)
  }
}
