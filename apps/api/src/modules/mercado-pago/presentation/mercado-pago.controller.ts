import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
} from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { API_ROUTES } from '@repo/common'
import { ReconcileMercadoPagoWebhookUseCase } from '../application/reconcile-webhook.use-case'

@Controller(API_ROUTES.mercadoPago.prefix)
export class MercadoPagoController {
  constructor(
    @Inject(ReconcileMercadoPagoWebhookUseCase)
    private readonly reconcileWebhookUseCase: ReconcileMercadoPagoWebhookUseCase
  ) {}

  @Post(API_ROUTES.mercadoPago.path.webhook())
  @HttpCode(HttpStatus.NO_CONTENT)
  @SkipThrottle()
  async webhook(
    @Body() body: unknown,
    @Headers('x-signature') signature: string | undefined,
    @Headers('x-request-id') requestId: string | undefined,
    @Query('data.id') dataId: string | undefined
  ): Promise<void> {
    await this.reconcileWebhookUseCase.execute(body, signature, requestId, dataId)
  }
}
