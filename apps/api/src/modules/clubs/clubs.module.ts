import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { FilesModule } from '../files/files.module'
import { CreateClubUseCase } from './application/create-club.use-case'
import { DeleteClubUseCase } from './application/delete-club.use-case'
import { ListMyClubsUseCase } from './application/list-my-clubs.use-case'
import { UpdateClubUseCase } from './application/update-club.use-case'
import { ClubImagesService } from './application/services/club-images.service'
import { ClubLookupService } from './application/services/club-lookup.service'
import { ClubsController } from './presentation/clubs.controller'

@Module({
  imports: [AuthModule, FilesModule],
  controllers: [ClubsController],
  providers: [
    ListMyClubsUseCase,
    CreateClubUseCase,
    UpdateClubUseCase,
    DeleteClubUseCase,
    ClubImagesService,
    ClubLookupService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class ClubsModule {}
