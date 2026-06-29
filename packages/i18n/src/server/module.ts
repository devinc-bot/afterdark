import { Module, type MiddlewareConsumer, type NestModule, RequestMethod } from '@nestjs/common'
import { TranslationService } from './translator.service.ts'
import { LanguageMiddleware } from './language.middleware.ts'

@Module({
  providers: [TranslationService],
  exports: [TranslationService],
})
export class I18nModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LanguageMiddleware).forRoutes({ path: '*splat', method: RequestMethod.ALL })
  }
}
