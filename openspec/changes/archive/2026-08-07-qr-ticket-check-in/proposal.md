## Why

Venue owners and assigned staff need a fast way to validate sold tickets at the door, confirm the attendee and event information, and prevent the same ticket from being admitted twice.

## What Changes

- Add a dashboard sidebar entry named **QR Ticket** for `owner` and `staff` accounts.
- Allow an owner to scan tickets only for events at locations they own.
- Allow staff to scan tickets only for events at locations to which they are assigned.
- Validate a scanned ticket QR online through the API.
- Automatically mark a valid unused ticket as used.
- After a successful scan, show **Ticket escaneado correctamente** with event name, date/time, location, ticket type, purchaser full name, email, and phone.
- Pause after each result and provide **Escanear siguiente ticket** to resume the camera.
- Distinguish invalid or foreign QR codes, expired QR codes, already-used tickets, and successful scans.

## Non-goals

- Scan history or audit-log UI.
- New database tables or columns.
- Manual ticket-code entry or offline validation.
- Native mobile applications or dedicated scanning hardware.
- Ticket purchase, payment, refund, transfer, or inventory changes.

## Capabilities

### New Capabilities

- `qr-ticket-check-in`: Owner/staff dashboard flow to scan, validate, consume, and inspect a sold ticket.

### Modified Capabilities

- (none)

## Impact

- **Apps:** `apps/dashboard`, `apps/api`.
- **Packages:** `packages/db` (repositories only), `packages/types`, `packages/validators`, `packages/common`, `packages/i18n`.
- **Database:** reuse `tickets_sold.qr_code`, `checked_in`, and `used_at`; no schema or migration changes.
- **Dependencies:** authenticated roles, owner/staff location relationships, completed orders, sold tickets, and events.

## Confirmed Decisions

- The requested admin maps to the existing `owner` role.
- Event operators map to `staff` assigned to the event location.
- Both roles see **QR Ticket** in the dashboard sidebar.
- A valid scan consumes the ticket immediately before showing success details.
- The camera resumes only when the operator activates **Escanear siguiente ticket**.
- The already-used outcome takes precedence when the matching QR is also expired.
- Issuing a replacement QR immediately invalidates the previously persisted token.
- Camera permission and availability failures provide **Reintentar** without manual entry.
