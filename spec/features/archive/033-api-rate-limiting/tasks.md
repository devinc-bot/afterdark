# Tasks 033 - API Rate Limiting

- [x] T1: Add typed `RATE_LIMIT_POLICY`, validated `RATE_LIMIT_*` env pairs with spec defaults, schema tests, `test/setup.ts` values, and development/staging/production runtime examples plus operational notes.
- [x] T2: Add `RATE_LIMIT_ERROR_CODE.TOO_MANY_REQUESTS` and Spanish/English `rateLimit.TOO_MANY_REQUESTS` copy; keep existing daily auth 429 codes unchanged.
- [x] T3: Pin `@nestjs/throttler` at `6.5.0`, register `ThrottlerModule` from policy, add `ApiThrottlerGuard` as `APP_GUARD` using `request.ip`, 429 headers, localized message, and skip health/readiness/webhook — with focused tests.
- [x] T4: Add `UserRateLimitGuard` plus `@ApiRateLimit` / `@UserRateLimit` decorators that key on `user.sub` after `JwtAuthGuard`, with tests for isolation, missing `sub`, and no second JWT verify.
- [x] T5: Annotate auth, public catalog, authenticated general, purchase, QR, check-in, Geo, and SSE handlers with the agreed profiles; remove `GeoRateLimitService` and its use-case/module wiring; prove overrides and Geo migration in tests.
- [x] T6: Verify daily registration/recovery limits still persist, then run `pnpm test`, `pnpm type-check`, `pnpm lint`, `pnpm format:check`, API build, and `git diff --check`; complete delegated test, implementation, and quality review.
