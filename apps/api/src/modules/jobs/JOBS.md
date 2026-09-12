# API Jobs Catalog

In-process Nest schedulers owned by `JobsModule` live under `apps/api/src/modules/jobs/schedulers/`.
This catalog is the source of truth for stable names, schedules, and purpose.

| Name                                | Schedule                    | What it does                                                                                                |
| ----------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `expire-purchase-reservations`      | Every minute                | Finds up to 100 expired active inventory reservations and releases each (purchase + reservation → expired). |
| `cleanup-stale-pending-orders`      | 1st of month, midnight      | Deletes stale pending legacy orders older than the start of the previous month.                             |
| `cleanup-api-error-records`         | Daily midnight              | Deletes API error records older than 30 days.                                                               |
| `cleanup-user-registration-tokens`  | Daily midnight              | Deletes expired user registration tokens.                                                                   |
| `cleanup-owner-registration-tokens` | Daily midnight              | Deletes expired owner registration tokens.                                                                  |
| `cleanup-password-reset-tokens`     | Daily midnight              | Deletes expired password-reset tokens.                                                                      |
| `cleanup-account-sessions`          | Every 14 days (`@Interval`) | Deletes expired or revoked account sessions older than 7 days.                                              |
| `cleanup-staff-invitations`         | Daily midnight              | Deletes expired and cancelled staff invitations.                                                            |

Catalog names are kebab-case documentation identifiers. Nest class names remain PascalCase
(e.g. `PurchaseExpiryScheduler`) unless a later feature renames them.
