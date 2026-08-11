import { Module } from '@nestjs/common'
import { MercadoPagoCheckoutProSdkAdapter } from './adapters/mercado-pago-checkout-pro.sdk-adapter'
import { ReconcileMercadoPagoWebhookUseCase } from './application/reconcile-webhook.use-case'
import { MERCADO_PAGO_CHECKOUT_PRO_PORT } from './mercado-pago.tokens'
import { MercadoPagoController } from './presentation/mercado-pago.controller'

@Module({
  controllers: [MercadoPagoController],
  providers: [
    MercadoPagoCheckoutProSdkAdapter,
    {
      provide: MERCADO_PAGO_CHECKOUT_PRO_PORT,
      useExisting: MercadoPagoCheckoutProSdkAdapter,
    },
    ReconcileMercadoPagoWebhookUseCase,
  ],
  exports: [MERCADO_PAGO_CHECKOUT_PRO_PORT],
})
export class MercadoPagoModule {}
