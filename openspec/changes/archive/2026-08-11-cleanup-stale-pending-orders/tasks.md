## 1. Order persistence

- [x] 1.1 Add and export an order repository operation that atomically deletes pending orders created before a supplied calendar cutoff and returns the deleted count.

## 2. Monthly cleanup scheduler

- [x] 2.1 Add the orders-module scheduler that derives the prior calendar-month cutoff, runs monthly at midnight, and logs deleted records or failures.

## 3. Verification

- [x] 3.1 Add focused tests for the status and cutoff boundaries, scheduler cutoff calculation, and failure handling; run `pnpm type-check`, `pnpm lint`, `pnpm format:check`, and `pnpm openspec validate`.
