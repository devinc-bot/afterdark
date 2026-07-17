import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { IpQueryLocatorAdapter } from './adapters/ipquery.locator'
import { LocateByIpUseCase } from './application/locate-by-ip.use-case'
import { GeoRateLimitService } from './application/services/geo-rate-limit.service'
import { GeoController } from './presentation/geo.controller'

@Module({
  imports: [AuthModule],
  controllers: [GeoController],
  providers: [
    LocateByIpUseCase,
    GeoRateLimitService,
    IpQueryLocatorAdapter,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class GeoModule {}
