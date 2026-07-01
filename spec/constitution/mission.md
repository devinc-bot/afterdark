# Mission

> Qué construimos y para quién.

## Producto

**afterdark** — plataforma de eventos nocturnos.

| Audiencia        | App         | Rol                                                           |
| ---------------- | ----------- | ------------------------------------------------------------- |
| Clientes         | `web`       | Descubrir clubes y eventos, ver detalle, comprar entradas     |
| Dueños de clubes | `dashboard` | Administrar clubes, entradas, staff y operaciones del negocio |
| Staff invitado   | `dashboard` | Operar con permisos acotados según el club asignado           |

## Problema que resolvemos

Hoy la noche sale a buscar eventos en redes dispersas y los dueños de clubes gestionan entradas, personal y comunicación con herramientas que no hablan entre sí. Eso genera fricción para el público (información incompleta, compra poco confiable) y para el negocio (catálogo manual, staff sin onboarding claro, poca visibilidad operativa).

## Visión

Un solo lugar donde el público descubre y compra la noche, y donde cada club administra catálogo, entradas, equipo y operaciones con datos confiables y flujos simples.

## Principios de producto

1. **UI en español, código en inglés** — copy visible al usuario en español; identificadores, rutas y APIs en inglés.
2. **Una fuente de verdad compartida** — tipos en `@afterdark/types`, validación en `@afterdark/validators`, persistencia en `@afterdark/db`; sin duplicar reglas entre apps.
3. **Dueño primero en el dashboard** — el panel prioriza operaciones del club (clubes, entradas, staff) antes que features secundarias.
4. **Contratos explícitos** — cada feature define alcance, API y criterios de aceptación en `spec/features/` antes de expandir implementación.
5. **Seguridad por capa** — autenticación y autorización verificadas en API (guards, roles); el frontend no es barrera de seguridad.

## Fuera de misión (no construir)

- Marketplace genérico de productos físicos (el módulo `properties` legado no es el núcleo del producto).
- Red social abierta o feed algorítmico de contenido ajeno a eventos nocturnos.
- POS físico, control de acceso con hardware o integraciones de puerta en tiempo real.
- Multi-tenant white-label o franquicias con branding independiente por club (v1).
- App móvil nativa (iOS/Android); el alcance actual es web SSR (`web` + `dashboard`).

## Referencias

- [DOMAIN.md](../../DOMAIN.md) — modelo de dominio y reglas de negocio
- [DATABASE.md](../../packages/db/DATABASE.md) — esquema y entidades (`clubs`, `tickets`, `staff`, `payments`, …)
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — apps, módulos y capas del monorepo
