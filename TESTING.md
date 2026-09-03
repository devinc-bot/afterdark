# Testing

Use Vitest for unit and lightweight integration tests. Use Playwright only for browser smoke tests.

```bash
pnpm test          # run Vitest once across apps and packages
pnpm test:watch    # run Vitest in watch mode
pnpm test:e2e      # run Chromium smoke tests for web, dashboard, and admin
pnpm test:e2e:ui   # open Playwright UI mode for local E2E development
```

Vitest uses Node by default. Component tests opt into jsdom with `@vitest-environment jsdom` and use
React Testing Library directly. Playwright specifications live in `e2e/`; they do not start the API,
connect to a database, or require credentials.
