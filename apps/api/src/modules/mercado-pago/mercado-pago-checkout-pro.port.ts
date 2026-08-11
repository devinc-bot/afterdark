export type CreateMercadoPagoPreferenceInput = {
  externalReference: string
  title: string
  quantity: number
  unitPrice: number
  notificationUrl: string
  backUrls: {
    success: string
    pending: string
    failure: string
  }
}

export type MercadoPagoPreferenceResult = {
  id: string
  initPoint: string
}

export type MercadoPagoPaymentResult = {
  id: string
  status: string
  externalReference: string | null
}

export interface MercadoPagoCheckoutProPort {
  createPreference(input: CreateMercadoPagoPreferenceInput): Promise<MercadoPagoPreferenceResult>
  getPayment(paymentId: string): Promise<MercadoPagoPaymentResult>
}
