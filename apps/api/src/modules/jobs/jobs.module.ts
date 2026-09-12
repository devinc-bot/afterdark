import { Module } from '@nestjs/common'
import { AccountSessionCleanupScheduler } from './schedulers/account-session-cleanup.scheduler'
import { ApiErrorRetentionScheduler } from './schedulers/api-error-retention.scheduler'
import { InvitationsCleanupScheduler } from './schedulers/invitations-cleanup.scheduler'
import { OwnerRegistrationCleanupScheduler } from './schedulers/owner-registration-cleanup.scheduler'
import { PasswordResetCleanupScheduler } from './schedulers/password-reset-cleanup.scheduler'
import { PendingOrderCleanupScheduler } from './schedulers/pending-order-cleanup.scheduler'
import { PurchaseExpiryScheduler } from './schedulers/purchase-expiry.scheduler'
import { UserRegistrationCleanupScheduler } from './schedulers/user-registration-cleanup.scheduler'

@Module({
  providers: [
    PurchaseExpiryScheduler,
    PendingOrderCleanupScheduler,
    ApiErrorRetentionScheduler,
    UserRegistrationCleanupScheduler,
    OwnerRegistrationCleanupScheduler,
    PasswordResetCleanupScheduler,
    AccountSessionCleanupScheduler,
    InvitationsCleanupScheduler,
  ],
})
export class JobsModule {}
