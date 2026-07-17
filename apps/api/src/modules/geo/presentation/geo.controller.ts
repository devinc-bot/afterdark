import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { API_ROUTES } from '@afterdark/common'
import type { GeoIpLocateResult, JwtPayload } from '@afterdark/types'
import { USER_ROLE } from '@afterdark/types'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { LocateByIpUseCase } from '../application/locate-by-ip.use-case'
import { resolvePublicClientIp } from '../utils/client-ip'

@Controller(API_ROUTES.geo.prefix)
export class GeoController {
  constructor(
    @Inject(LocateByIpUseCase)
    private readonly locateByIpUseCase: LocateByIpUseCase
  ) {}

  @Get(API_ROUTES.geo.path.ipLocate())
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  ipLocate(@CurrentUser() user: JwtPayload, @Req() req: Request): Promise<GeoIpLocateResult> {
    return this.locateByIpUseCase.execute(user.sub, resolvePublicClientIp(req))
  }
}
