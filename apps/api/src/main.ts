import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ENV } from './common/config/env'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.getHttpAdapter().getInstance().disable('x-powered-by')
  app.enableCors({
    origin: ENV.CORS_ALLOWED_ORIGINS,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
  app.useGlobalFilters(new HttpExceptionFilter())
  app.setGlobalPrefix('api')
  await app.listen(ENV.PORT)
}

bootstrap()
