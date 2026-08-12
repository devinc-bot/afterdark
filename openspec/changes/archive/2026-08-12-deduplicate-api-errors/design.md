## Context

`api_error_records` currently stores every eligible 5xx failure after the API recorder sanitizes its allowlisted context. Repeated identical failures can generate many rows in a short period. The agreed policy suppresses duplicates for five minutes, comparing the sanitized method, path, status code, error name, message, and stack trace.

## Goals / Non-Goals

**Goals:**

- Persist at most one equivalent diagnostic record during a five-minute window.
- Keep the comparison fast without querying or indexing long diagnostic texts directly.
- Preserve the existing best-effort recording behavior and HTTP response contract.

**Non-Goals:**

- Count suppressed occurrences or update existing rows.
- Deduplicate across distinct sanitized diagnostics.
- Use the correlation ID as part of equivalence.
- Add UI, API endpoints, alerts, or external observability dependencies.

## Decisions

### Persist a SHA-256 fingerprint of normalized diagnostics

The API recorder will compute a SHA-256 fingerprint after it has removed query strings, scrubbed credentials, normalized whitespace, and applied field limits. It will concatenate method, path, status code, error name, message, and a stable representation of the nullable stack trace using an unambiguous delimiter before hashing. The database will persist this fingerprint with each record.

A fixed-length fingerprint avoids expensive equality predicates over long message and stack text. Direct comparison of all six text fields was rejected because it would require a wider index, handle nullable stack comparison explicitly, and perform worse as diagnostic records grow.

### Query a five-minute fingerprint window before inserting

`@repo/db` will expose one repository operation that receives a sanitized record and its fingerprint. It will determine whether a row with that fingerprint has `created_at` at or after the supplied five-minute cutoff; it inserts and returns the new row only when absent. A `fingerprint, created_at` index supports this lookup.

The check-and-insert is intentionally best-effort rather than globally serialized. Concurrent duplicate requests can both pass the check and insert, which is acceptable for this operational noise-reduction feature. A unique constraint cannot express a rolling time window in SQLite/libSQL.

### Keep the existing record creation operation out of the request path

The existing general insert function will remain available for explicit repository tests or future operational tooling. The API recorder will use the new deduplicating operation exclusively. This limits the behavior change to API exception capture and keeps repository responsibilities explicit.

## Risks / Trade-offs

- [Concurrent identical requests can both insert] -> Accept a small race because SQLite cannot enforce a rolling uniqueness constraint; no response behavior changes.
- [Hash input ambiguity could produce incorrect grouping] -> Use a stable delimiter and a specific nullable-stack representation before hashing.
- [Fingerprint does not reveal diagnostics to operators] -> Retain the existing sanitized diagnostic fields alongside the fingerprint.
- [Additional lookup adds exceptional-path latency] -> Use a narrow composite index and only run it for 5xx failures.

## Migration Plan

1. Add the non-null fingerprint schema column and composite index.
2. Generate a timestamp-prefixed migration. Because existing rows have no fingerprint, backfill them with a stable placeholder that cannot match newly computed SHA-256 values.
3. Add and test the repository deduplication operation.
4. Compute the fingerprint in the API recorder and use the new operation.
5. Deploy the migration before or together with the API version using the new repository function.

Rollback the API code first. The extra column and index may remain safely unused; remove them in a forward migration only if the feature is later removed.

## Open Questions

None.
