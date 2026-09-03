import { Injectable, type OnApplicationShutdown } from '@nestjs/common'
import { closeDatabaseConnection } from '@repo/db'

@Injectable()
export class DatabaseLifecycleService implements OnApplicationShutdown {
  async onApplicationShutdown() {
    await closeDatabaseConnection()
  }
}
