export type SendMailInput = {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export type SendMailResult = {
  id: string
}

export type RenderedMail = {
  subject: string
  html: string
  text: string
}
