import { Inject, Injectable } from '@nestjs/common'
import { USER_ROLE, type RegisterResponse } from '@repo/types'
import type { RegisterOwnerInput } from '@repo/validators'
import { AuthAccountService } from './services/auth-account.service'

@Injectable()
export class RegisterOwnerUseCase {
  constructor(@Inject(AuthAccountService) private readonly accounts: AuthAccountService) {}

  async execute(input: RegisterOwnerInput): Promise<RegisterResponse> {
    return this.accounts.register(input, USER_ROLE.OWNER)
  }
}
