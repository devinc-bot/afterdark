import { Module } from '@nestjs/common'
import { GetCurrentUserUseCase } from './application/get-current-user.use-case'
import { UpdateCurrentUserUseCase } from './application/update-current-user.use-case'

@Module({
  providers: [GetCurrentUserUseCase, UpdateCurrentUserUseCase],
  exports: [GetCurrentUserUseCase, UpdateCurrentUserUseCase],
})
export class UsersModule {}
