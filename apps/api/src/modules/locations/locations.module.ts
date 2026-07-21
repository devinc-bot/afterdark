import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { FilesModule } from '../files/files.module'
import { CreateLocationUseCase } from './application/create-location.use-case'
import { DeleteLocationUseCase } from './application/delete-location.use-case'
import { ListMyLocationsUseCase } from './application/list-my-locations.use-case'
import { UpdateLocationUseCase } from './application/update-location.use-case'
import { LocationImagesService } from './application/services/location-images.service'
import { LocationLookupService } from './application/services/location-lookup.service'
import { LocationsController } from './presentation/locations.controller'

@Module({
  imports: [AuthModule, FilesModule],
  controllers: [LocationsController],
  providers: [
    ListMyLocationsUseCase,
    CreateLocationUseCase,
    UpdateLocationUseCase,
    DeleteLocationUseCase,
    LocationImagesService,
    LocationLookupService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class LocationsModule {}
