# Tasks — Formulario ticket (evento + venta)

## Spec & plan

- [x] Requisitos documentados en `spec.md`
- [x] `spec.md` en status `approved`
- [x] `plan.md` revisado
- [x] Entrada en `spec/constitution/roadmap.md`

## Validators & i18n

- [ ] `eventId` requerido en `createTicketSchema`, `updateTicketSchema`, `ticketFormSchema`
- [ ] Refine venta: clave `validation:field.ticket.saleEndAfterStart`
- [ ] `validation/es.json` y `validation/en.json` — `ticket.event`, `ticket.saleEndAfterStart`
- [ ] `tickets/es.json` y `tickets/en.json` — labels evento y fechas de venta

## Dashboard

- [ ] Hook/query para listar eventos del dueño (`useOwnerEvents`)
- [ ] `SelectField` Evento en `ticket-form.tsx` (create + edit)
- [ ] Renombrar labels a inicio/fin de **venta**
- [ ] Estados vacío/carga/error del select eventos
- [ ] Precarga `eventId` en modo editar

## Verificación

- [ ] Crear ticket sin evento → error validación
- [ ] Crear ticket con evento, sin fechas venta → OK
- [ ] Crear con fechas venta inválidas (inicio ≥ fin) → error
- [ ] Editar ticket y cambiar evento → OK
- [ ] `pnpm type-check` y `pnpm lint`
