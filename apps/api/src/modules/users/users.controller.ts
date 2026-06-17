import { Controller, Get, Inject, UseGuards } from '@nestjs/common'
import type { CurrentUserResponse, JwtPayload } from '@afterdark/types'
import { CurrentUser } from '../../shared/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: JwtPayload): Promise<CurrentUserResponse> {
    return this.usersService.getCurrentUser(user.sub)
  }
}
