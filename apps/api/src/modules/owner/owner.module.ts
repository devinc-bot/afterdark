import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { OwnerController } from './owner.controller'
import { OwnerService } from './owner.service'

@Module({
  imports: [AuthModule],
  controllers: [OwnerController],
  providers: [OwnerService, JwtAuthGuard],
  exports: [OwnerService],
})
export class OwnerModule {}
