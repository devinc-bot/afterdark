# Mission

> Qué construimos y para quién.

## Producto

**Repo** — plataforma de eventos.

| Audiencia             | App         | Rol                                                                |
| --------------------- | ----------- | ------------------------------------------------------------------ |
| Clientes              | `web`       | Descubrir ubicaciones y eventos, ver detalle, comprar entradas     |
| Dueños de ubicaciones | `dashboard` | Administrar ubicaciones, entradas, staff y operaciones del negocio |
| Staff invitado        | `dashboard` | Operar con permisos acotados según la ubicación asignada           |

## Problema que resolvemos

Hoy el público busca eventos en redes dispersas y los dueños de ubicaciones gestionan entradas, personal y comunicación con herramientas que no hablan entre sí. Eso genera fricción para el público (información incompleta, compra poco confiable) y para el negocio (catálogo manual, staff sin onboarding claro, poca visibilidad operativa).

## Visión

Un solo lugar donde el público descubre y compra eventos, y donde cada ubicación administra catálogo, entradas, equipo y operaciones con datos confiables y flujos simples.

## Principios de producto

1. **UI en español, código en inglés** — copy visible al usuario en español; identificadores, rutas y APIs en inglés.
2. **Una fuente de verdad compartida** — tipos en `@repo/types`, validación en `@repo/validators`, persistencia en `@repo/db`; sin duplicar reglas entre apps.
3. **Dueño primero en el dashboard** — el panel prioriza operaciones de la ubicación (ubicaciones, entradas, staff) antes que features secundarias.
4. **Contratos explícitos** — trabajo nuevo vía OpenSpec (`openspec/`); specs legacy en `spec/features/` quedan como referencia hasta el próximo touch.
5. **Seguridad por capa** — autenticación y autorización verificadas en API (guards, roles); el frontend no es barrera de seguridad.

## Fuera de misión (no construir)

- Marketplace genérico de productos físicos (el módulo `properties` legado no es el núcleo del producto).
- Red social abierta o feed algorítmico de contenido ajeno a eventos.
- POS físico, control de acceso con hardware o integraciones de puerta en tiempo real.
- Multi-tenant white-label o franquicias con branding independiente por ubicación (v1).
- App móvil nativa (iOS/Android); el alcance actual es web SSR (`web` + `dashboard`).

## Referencias

- [AGENTS.md](../../AGENTS.md) — modelo de dominio, reglas de negocio, apps y capas
- [DATABASE.md](../../packages/db/DATABASE.md) — esquema y entidades (`locations` / legacy `clubs`, `tickets`, `staff`, `payments`, …)
