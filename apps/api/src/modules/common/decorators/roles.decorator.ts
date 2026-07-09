import { Reflector } from '@nestjs/core'
import type { UserRole } from '@afterdark/types'

export const Roles = Reflector.createDecorator<UserRole[]>()
