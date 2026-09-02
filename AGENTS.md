# AGENTS.md - Lumina Monorepo

## Proyecto

Lumina es una plataforma web de eventos y ticketing: los clientes descubren y compran entradas, mientras que los dueños y su staff administran organizaciones, locations, eventos, tickets y operaciones. Es un monorepo `pnpm` con TanStack Start, React 19 y Tailwind v4 para `web`, `dashboard` y `admin`; NestJS, Drizzle y Neon PostgreSQL para la API; y paquetes compartidos para tipos, validación, UI e i18n.

La arquitectura de datos es `UI -> queries/mutations -> services -> QueryFactory -> Nest API -> repositories -> DB`. Las apps cliente viven en `apps/{web,dashboard,admin}`, la API en `apps/api`, y los paquetes compartidos en `packages/{common,db,validators,types,ui,i18n}`.

| App         | Responsabilidad                   | Puerto |
| ----------- | --------------------------------- | ------ |
| `web`       | Cliente público                   | 3001   |
| `dashboard` | Panel de owner y staff            | 3002   |
| `admin`     | Operación de admins provisionados | 3003   |
| `api`       | API REST de NestJS                | 3000   |

## Comandos

- Ejecutar: `pnpm dev` para todas las apps, o `pnpm dev:web`, `pnpm dev:dashboard`, `pnpm dev:admin` y `pnpm dev:api` para una app.
- Tests: no hay un script raíz de tests; usa el comando de test del paquete afectado si existe. Para la verificación global usa `pnpm check`.
- Lint/formato: `pnpm lint` y `pnpm format:check`; para corregir, `pnpm lint:fix` y `pnpm format`.
- Build/tipos: `pnpm build` y `pnpm type-check`.
- Base de datos: desde `packages/db`, usa `pnpm drizzle-kit generate` y `pnpm drizzle-kit migrate`. `drizzle-kit push` es solo para desarrollo.

## Estilo y convenciones

- TypeScript 6, versiones de dependencias fijadas y `pnpm-lock.yaml` siempre versionado. No uses actualizaciones masivas ni rangos `^` o `~`.
- Archivos y rutas en inglés `kebab-case`; componentes `PascalCase`; funciones, hooks y keys de mapas `camelCase`; mapas de constantes `SCREAMING_SNAKE_CASE` con `as const`.
- No uses magic strings para modos, estados, roles, query keys o valores de dominio. Define y reutiliza mapas de constantes. Las rutas literales solo son válidas dentro de `createFileRoute`.
- El código, identificadores, rutas, APIs y documentación técnica están en inglés. Todo copy visible y mensajes de error se localizan en español e inglés mediante `@repo/i18n`.
- Usa `oxlint` y `oxfmt` exclusivamente. No introduzcas otro linter o formatter.
- Valida con Zod desde `@repo/validators`; DTOs, enums y tipos de dominio pertenecen a `@repo/types`. No los redefinas en las apps.
- Los esquemas Drizzle usan `pgTable`. Todas las consultas de API viven en `packages/db/src/repositories/`; los servicios NestJS importan repositorios, nunca `db` directamente.
- Para un cambio de entidad, sigue este orden: schema -> repository -> validator -> type -> API use case/controller -> `API_ROUTES` -> servicio cliente.
- Los módulos de API son vertical slices en `apps/api/src/modules/<domain>/`. Los controladores validan en el límite y los casos de uso orquestan sin consultas SQL directas.
- Los módulos frontend viven en `app/modules/<feature>/`. Las rutas importan módulos de feature, pero los módulos no importan features hermanas; lo compartido va en `modules/common/`.
- Usa `buildApiPath(API_ROUTES.*, path)` para endpoints; no escribas `/api/...` manualmente. En navegación usa las constantes de rutas, excepto en `createFileRoute`, que requiere un literal.
- Las migraciones de producción usan prefijo timestamp y no se renombran una vez confirmadas. `DATABASE_MIGRATION_URL` es para Drizzle y seeds; `DATABASE_URL` es para el runtime de API.

## Reglas

- Antes de tocar código, lee `spec/constitution/`, `spec/README.md`, `STYLEGUIDE.md` y la feature activa relevante en `spec/features/active/`. Consulta además `PRODUCT.md`, `DESIGN.md` o `packages/db/DATABASE.md` cuando el cambio lo requiera.
- Los cambios nuevos y expansiones de alcance siguen SDD: crea o actualiza `spec/features/active/<NNN-slug>/` con exactamente `spec.md`, `plan.md` y `tasks.md`, revisa los artefactos antes de implementar y archiva solo el trabajo verificado.
- Cada `spec.md` nueva usa `spec/SPEC_TEMPLATE.md` en inglés, con requisitos funcionales EARS. Antes de una propuesta, delega exploración del código relevante y registra dudas en `Open Questions` con `[NEEDS CLARIFICATION]`.
- Implementa una tarea de `tasks.md` por turno salvo que el usuario autorice un lote. Ante una decisión de producto bloqueante, pregunta en vez de asumir.
- Aplica TDD cuando el cambio lo requiera: escribe primero una prueba que falle, implementa lo mínimo para hacerla pasar y refactoriza. Añade la cobertura mínima necesaria para validar el comportamiento nuevo o corregido.
- No edites archivos generados, incluido `routeTree.gen.ts`. No crees `progress.md`, propuestas separadas ni delta specs para una feature.
- Mantén el alcance mínimo y no refactorices áreas no relacionadas. No añadas dependencias, campos persistidos, compatibilidad retroactiva ni integraciones externas sin necesidad concreta o confirmación.
- Usa `documentId` (UUID) en contratos API y JWT; los `id` enteros internos son solo foreign keys. El término canónico es `location`, no `club` ni `nightlife`.
- `user` se registra en `web`; `owner` en `dashboard`; `staff` solo acepta una invitación; `admin` es provisionado por seed y usa `admin`. El frontend no es una barrera de seguridad: autoriza en API mediante guards y roles.
- Los owners operan una única organización en los flujos actuales. Events pertenecen a una organización y usan una location como venue; customers no administran inventario.
- `apps/admin` solo admite cuentas `admin` seed y requiere que `CORS_ALLOWED_ORIGINS` incluya `http://localhost:3003` en desarrollo y el origen desplegado.
- Conserva dark y light como temas de primera clase. El sitio público usa un registro alegre, original y minimalista; evita neón, layouts densos y marketing genérico.
- Aísla SDKs de proveedores detrás de puertos y adapters; nunca expongas ni registres secretos, tokens o contraseñas.
- Consulta Context7 antes de cambiar o explicar APIs, configuración o migraciones de bibliotecas y servicios externos. No hace falta para refactors, lógica de negocio, testing o revisiones de código.

## Al terminar cualquier tarea

- Delega a un subagente una revisión del trabajo terminado. Debe comprobar los criterios de aceptación de la tarea y los estándares de código aplicables; corrige los hallazgos antes de dar la tarea por finalizada.
- Ejecuta la verificación más específica aplicable: tests del paquete afectado, `pnpm type-check`, `pnpm lint`, `pnpm format:check` y/o el build afectado.
- Cuando aplique TDD, ejecuta las pruebas nuevas o modificadas y comprueba que cubren el comportamiento requerido.
- Si la verificación global no puede ejecutarse o falla por problemas ajenos al cambio, informa el comando, el resultado y la causa concreta.
- Revisa `git diff --check` y no reviertas cambios preexistentes de otros colaboradores.
- Para cambios de base de datos, verifica que la migración, los repositorios, validadores, tipos y contratos se hayan actualizado de forma consistente.
