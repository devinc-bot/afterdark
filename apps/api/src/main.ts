import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ENV } from './config/env'
import { API_PREFIX } from '@repo/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableShutdownHooks()
  const express = app.getHttpAdapter().getInstance()
  express.disable('x-powered-by')
  express.set('trust proxy', ENV.TRUST_PROXY_HOPS)
  app.enableCors({
    origin: ENV.CORS_ALLOWED_ORIGINS,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
  app.setGlobalPrefix(API_PREFIX)
  await app.listen(ENV.PORT, '0.0.0.0')
}

bootstrap()
