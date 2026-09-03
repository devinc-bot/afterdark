import { Injectable } from '@nestjs/common'
import { checkDatabaseConnection } from '@repo/db'

@Injectable()
export class CheckApiReadinessUseCase {
  async execute() {
    await checkDatabaseConnection()
    return { status: 'ok' }
  }
}
