import { Module } from '@nestjs/common'
import { OwnerService } from './owner.service'

@Module({
  providers: [OwnerService],
  exports: [OwnerService],
})
export class OwnerModule {}
