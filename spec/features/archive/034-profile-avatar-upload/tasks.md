# Tasks 034 - Profile Avatar Upload and R2 Layout

- [x] T1: Add avatar optimization constants/validators, settings avatar route helpers in `API_ROUTES`, and shared DTO/response typing for avatar upload/remove; focused validator/route tests.
- [x] T2: Extend `FilesService` / image optimizer with hierarchical key builders (`users/avatars`, `events/{id}`, `locations/{id}`), remove `R2_UPLOAD_PREFIX`, and 256×256 WebP avatar optimize; unit tests for keys and output size/mime.
- [x] T3: Wire event and location image upload paths to the new key builders for **new** files only; keep existing assets readable; focused service tests.
- [x] T4: Implement settings avatar upload and remove use cases + controller (multipart + delete), role dispatch for `user`/`owner`, staff rejection, asset FK update and previous R2 cleanup; API tests.
- [x] T5: Add shared client crop dialog (1:1) and avatar upload/remove service helpers usable from web and dashboard.
- [x] T6: Enable web settings change/remove avatar UX, session/profile refresh, localized copy, and focused client tests.
- [x] T7: Enable dashboard owner change/remove avatar UX (replace disabled CTA), keep staff read-only, localized copy, and focused client tests.
- [x] T8: Run affected tests, i18n validation, type-check, lint, format check, manual dark/light + mobile crop verification on web and dashboard owner, and `git diff --check`; complete delegated acceptance review.
