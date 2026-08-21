import { Module } from '@nestjs/common'
import { GetPublicOrganizationProfileUseCase } from './application/get-public-organization-profile.use-case'
import { OrganizationsController } from './presentation/organizations.controller'

@Module({
  controllers: [OrganizationsController],
  providers: [GetPublicOrganizationProfileUseCase],
})
export class OrganizationsModule {}
