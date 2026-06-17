import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.getHttpAdapter().getInstance().disable('x-powered-by')
  app.useGlobalFilters(new HttpExceptionFilter())
  app.setGlobalPrefix('api')
  await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
