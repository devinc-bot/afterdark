import { NestFactory } from '@nestjs/core'
import { AppModule } from '../../../app.module'
import { SendSmokeUseCase } from '../application/send-smoke.use-case'

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  })

  try {
    const sendSmoke = app.get(SendSmokeUseCase)
    const result = await sendSmoke.execute()
    // eslint-disable-next-line no-console
    console.log(`Smoke mail sent: ${result.id}`)
  } finally {
    await app.close()
  }
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exitCode = 1
})
