export type CreateMercadoPagoPreferenceInput = {
  externalReference: string
  title: string
  quantity: number
  unitPrice: number
  notificationUrl: string
  expiresAt: Date
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
  amount: number
  currency: string
}

export interface MercadoPagoCheckoutProPort {
  createPreference(input: CreateMercadoPagoPreferenceInput): Promise<MercadoPagoPreferenceResult>
  expirePreference(preferenceId: string): Promise<void>
  getPayment(paymentId: string): Promise<MercadoPagoPaymentResult>
}
