## 1. Types

- [x] 1.1 Add `locationImages: EventImageResponse[]` to `PublicEventDetailResponse` in `packages/types/src/dto/event.ts` and ensure the type is exported.

## 2. API

- [x] 2.1 Update `GetPublicEventByDocumentIdUseCase` to load location images via `findLocationImageAssetsByLocationIds` in parallel with event images, and extend `toPublicEventDetailResponse` to include `locationImages` (empty array when none).

## 3. i18n

- [x] 3.1 Add Spanish and English keys under `discover.detail` for the venue gallery heading and carousel a11y labels (`locationGallery`, `locationCarouselAriaLabel`, `locationCarouselAlt`).

## 4. Web UI

- [x] 4.1 On the event detail page, render a venue gallery section near the address (before the map) when `locationImages` is non-empty, reusing `EventDetailCarousel` with venue copy; omit the section when empty.
