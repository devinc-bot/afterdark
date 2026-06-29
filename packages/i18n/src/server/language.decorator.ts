import { createParamDecorator } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import { getCurrentRequestLanguage } from './language.context.ts'

export const Language = createParamDecorator((_data: unknown, _ctx: ExecutionContext) => {
  return getCurrentRequestLanguage()
})
