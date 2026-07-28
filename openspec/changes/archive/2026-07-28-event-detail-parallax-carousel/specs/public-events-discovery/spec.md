## ADDED Requirements

### Requirement: Event detail image carousel with parallax

The public event detail page (`/events/$documentId`) SHALL show a full-width image
carousel of all event images at the top of the detail content. The carousel MUST be
implemented with the shared shadcn Carousel in `@repo/ui` (Embla) and MUST apply the
Embla parallax tween pattern to slide media while scrolling. Interaction MUST NOT
navigate away from the detail page. UI copy (aria labels, prev/next) MUST be Spanish
via `@repo/i18n`.

#### Scenario: Multiple images use Embla carousel with parallax

- **GIVEN** a published event has two or more images
- **WHEN** the visitor opens the event detail page
- **THEN** a full-width carousel shows all event images
- **AND** dragging or using prev/next advances slides with a parallax motion on the
  image layer
- **AND** the visitor remains on the same detail route

#### Scenario: Single image or empty gallery

- **GIVEN** a published event has zero or one image
- **WHEN** the detail page loads
- **THEN** the carousel area shows that single image, or an empty-state placeholder
  when there are no images, without prev/next controls

#### Scenario: Prefers-reduced-motion

- **GIVEN** the visitor has prefers-reduced-motion enabled
- **WHEN** they change slides
- **THEN** slide changes still work, and parallax tweening is reduced or disabled so
  motion does not rely on continuous translate parallax
