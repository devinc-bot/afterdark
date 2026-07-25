import { Reflector } from '@nestjs/core'
import type { UserRole } from '@repo/types'

export const Roles = Reflector.createDecorator<UserRole[]>()
