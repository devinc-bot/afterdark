## 1. Database Model And Access

- [x] 1.1 Add the non-null API error fingerprint schema field and composite fingerprint/created_at lookup index; generate and review the timestamp-prefixed migration with safe backfill for existing records, then pass DB checks.
- [x] 1.2 Add and export the repository operation that conditionally inserts a sanitized API error record when no equivalent fingerprint exists from the supplied cutoff; cover duplicate, expired-window, and distinct-fingerprint behavior with tests.

## 2. API Deduplication

- [x] 2.1 Compute the stable SHA-256 fingerprint from the six sanitized diagnostic fields in the API recorder and use the conditional repository operation; cover fingerprint stability, stack participation, and five-minute suppression with unit tests and pass API checks.

## 3. Verification And Documentation

- [x] 3.1 Update `packages/db/DATABASE.md` for fingerprints and the deduplicating repository operation, then run targeted tests, `pnpm type-check`, `pnpm lint`, and `pnpm format:check`.
