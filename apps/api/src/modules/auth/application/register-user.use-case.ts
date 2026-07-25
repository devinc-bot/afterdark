import { Inject, Injectable } from '@nestjs/common'
import { USER_ROLE, type RegisterResponse } from '@repo/types'
import type { RegisterUserInput } from '@repo/validators'
import { AuthAccountService } from './services/auth-account.service'

@Injectable()
export class RegisterUserUseCase {
  constructor(@Inject(AuthAccountService) private readonly accounts: AuthAccountService) {}

  async execute(input: RegisterUserInput): Promise<RegisterResponse> {
    return this.accounts.register(input, USER_ROLE.USER)
  }
}
