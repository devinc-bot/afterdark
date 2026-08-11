## Context

`ScheduleModule.forRoot()` is already configured in the API and its auth and invitation modules use injectable `@Cron` schedulers. Orders are persisted through `@repo/db` repositories; no order retention job exists. Pending orders do not issue `tickets_sold` rows, so eligible records have no fulfilled-ticket records to retain.

## Goals / Non-Goals

**Goals:**
- Delete only pending orders that are older than one calendar month.
- Run the cleanup monthly in the API process and report its result through structured application logging.
- Keep persistence logic in `packages/db` and orchestration in the orders module.

**Non-Goals:**
- Canceling remote Mercado Pago preferences or payments.
- Deleting any non-pending order or exposing manual cleanup controls.
- Adding schema fields, migrations, API routes, UI copy, or i18n keys.

## Decisions

### Use a repository delete bounded by status and creation timestamp

The repository will issue one delete query constrained to `orders.status = PAYMENT_STATUS.PENDING` and `orders.createdAt < cutoff`, returning the number of rows deleted. This keeps the destructive operation atomic and makes a concurrent webhook that changes an order status ineligible for deletion.

Deleting after selecting rows was considered, but it introduces a race window and unnecessary application-memory work.

### Run on the first day of each month at midnight in the process timezone

An injectable `PendingOrderCleanupScheduler` in the orders module will use Nest's monthly cron expression. On each execution it derives the first day of the preceding calendar month as the cutoff. For example, a run on 1 September deletes pending orders created before 1 August.

A daily 30-day cleanup was considered, but it does not match the selected calendar-month retention rule or requested monthly cadence. A fixed 30-day duration was rejected because the business decision is calendar-month based.

### Continue existing scheduler failure handling

The scheduler will log a count only when rows are deleted and log failures without allowing an unhandled rejection to disrupt the API process. This follows the existing cleanup scheduler convention.

## Risks / Trade-offs

- [A payment webhook can arrive near the cleanup boundary] → The single delete predicate requires the order to remain pending at execution time; later provider notifications for a deleted checkout reference are ignored under the existing unknown-order behavior.
- [The process is unavailable at the scheduled time] → The job runs on the next scheduled monthly execution; no catch-up worker is introduced in this scoped change.
- [Server timezone differs from business expectations] → The current API schedulers already use process time; deployment must keep its configured timezone consistent with operational expectations.

## Migration Plan

1. Deploy the repository and scheduler with no schema migration.
2. Verify the monthly scheduler logs and deleted count after its first run.
3. Roll back by removing the scheduler provider; deleted pending orders cannot be restored from the application database.

## Open Questions

None.
