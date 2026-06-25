import { Body, Controller, Get, Inject, Patch, UseGuards } from '@nestjs/common'
import type { CurrentOwnerResponse, JwtPayload } from '@afterdark/types'
import { updateCurrentOwnerSchema, type UpdateCurrentOwnerInput } from '@afterdark/validators'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { OwnerService } from './owner.service'

@Controller('owners')
export class OwnerController {
  constructor(@Inject(OwnerService) private readonly ownerService: OwnerService) {}

  @Get('details')
  @UseGuards(JwtAuthGuard)
  getDetails(@CurrentUser() user: JwtPayload): Promise<CurrentOwnerResponse> {
    return this.ownerService.getCurrentOwner(user.sub)
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(updateCurrentOwnerSchema)) body: UpdateCurrentOwnerInput
  ): Promise<CurrentOwnerResponse> {
    return this.ownerService.updateCurrentOwner(user.sub, body)
  }
}
