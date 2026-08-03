# Design

The existing `paginationSchema` (`page`, `limit`) is the single validation source. The DB repository will calculate `offset = (page - 1) * limit`, run the filtered ticket-unit query with `limit`/`offset`, and run a matching `count` query. The API use case will load event images for the current page and map the result to the shared paginated DTO.

The web query key will include the active page and limit so TanStack Query caches pages independently. Pagination controls will use existing UI primitives and Spanish i18n strings. No migration is needed.
