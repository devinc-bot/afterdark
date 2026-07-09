import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { ClubsController } from './clubs.controller'
import { ClubsService } from './clubs.service'
import { FilesModule } from '../files/files.module'

@Module({
  imports: [AuthModule, FilesModule],
  controllers: [ClubsController],
  providers: [ClubsService, JwtAuthGuard, RolesGuard],
  exports: [ClubsService],
})
export class ClubsModule {}
