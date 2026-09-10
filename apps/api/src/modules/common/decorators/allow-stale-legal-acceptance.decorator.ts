import { Reflector } from '@nestjs/core'

export const AllowStaleLegalAcceptance = Reflector.createDecorator<true>()
