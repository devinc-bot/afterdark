import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { ClubsController } from './clubs.controller'
import { ClubsService } from './clubs.service'

@Module({
  imports: [AuthModule],
  controllers: [ClubsController],
  providers: [ClubsService, JwtAuthGuard],
  exports: [ClubsService],
})
export class ClubsModule {}
