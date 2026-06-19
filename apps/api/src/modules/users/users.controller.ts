import { Body, Controller, Get, Inject, Patch, UseGuards } from '@nestjs/common'
import type { CurrentUserResponse, JwtPayload } from '@afterdark/types'
import { updateCurrentUserSchema, type UpdateCurrentUserInput } from '@afterdark/validators'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: JwtPayload): Promise<CurrentUserResponse> {
    return this.usersService.getCurrentUser(user.sub)
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(updateCurrentUserSchema)) body: UpdateCurrentUserInput
  ): Promise<CurrentUserResponse> {
    return this.usersService.updateCurrentUser(user.sub, body)
  }
}
