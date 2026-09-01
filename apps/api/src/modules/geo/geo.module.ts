import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ENV } from '../../config/env'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { IpQueryLocatorAdapter } from './adapters/ipquery.locator'
import { LocateByIpUseCase } from './application/locate-by-ip.use-case'
import { GeoRateLimitService } from './application/services/geo-rate-limit.service'
import { GEO_IP_LOCATOR } from './geo.tokens'
import { GeoController } from './presentation/geo.controller'

@Module({
  imports: [JwtModule.register({ secret: ENV.JWT_SECRET })],
  controllers: [GeoController],
  providers: [
    LocateByIpUseCase,
    GeoRateLimitService,
    IpQueryLocatorAdapter,
    {
      provide: GEO_IP_LOCATOR,
      useExisting: IpQueryLocatorAdapter,
    },
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [GEO_IP_LOCATOR],
})
export class GeoModule {}
