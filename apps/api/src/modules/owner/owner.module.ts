import { Module } from '@nestjs/common'
import { GetCurrentOwnerUseCase } from './application/get-current-owner.use-case'
import { UpdateCurrentOwnerUseCase } from './application/update-current-owner.use-case'

@Module({
  providers: [GetCurrentOwnerUseCase, UpdateCurrentOwnerUseCase],
  exports: [GetCurrentOwnerUseCase, UpdateCurrentOwnerUseCase],
})
export class OwnerModule {}
