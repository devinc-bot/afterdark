# Sesiones Persistidas con Refresh Token

Lumina usa access tokens JWT de corta duración y refresh tokens rotativos con estado. Esto mantiene las requests de API rápidas y permite revocar sesiones inmediatamente, detectar la reutilización de refresh tokens y administrar sesiones independientes para `web`, `dashboard` y `admin`.

## Flujo Rápido

1. Un login exitoso crea una fila en `account_sessions` y establece una cookie HttpOnly con el refresh token.
2. El cliente usa el access JWT hasta que expira.
3. El cliente llama a `POST /api/auth/refresh`; la API valida y rota el refresh token.
4. La API devuelve un access JWT nuevo y establece una cookie con el refresh token de reemplazo.

## Modelo de Tokens

| Token         | Duración   | Almacenamiento                            | Propósito                                                      |
| ------------- | ---------- | ----------------------------------------- | -------------------------------------------------------------- |
| Access token  | 15 minutos | Memoria o estado de la aplicación cliente | Autentica requests de API con `Authorization: Bearer <token>`. |
| Refresh token | 30 días    | Cookie HttpOnly                           | Obtiene un nuevo access token sin requerir un login nuevo.     |

Los refresh tokens son credenciales opacas, no JWTs. Su formato contiene un identificador de sesión, una versión, un secreto aleatorio y un HMAC. La API solo almacena el hash del secreto aleatorio en `account_sessions`.

## Aislamiento de Cookies

Cada aplicación cliente tiene su propio nombre de cookie:

| Aplicación  | Cookie                       |
| ----------- | ---------------------------- |
| `web`       | `app.web.auth.refresh`       |
| `dashboard` | `app.dashboard.auth.refresh` |
| `admin`     | `app.admin.auth.refresh`     |

Las cookies son HttpOnly, usan `SameSite=Lax`, se limitan a `/api/auth` y se envían con requests con credenciales. La API también valida la aplicación cliente esperada y el origen de la request.

## Ciclo de Vida de la Sesión

### Emisión

En un login, confirmación de registro o finalización de OAuth compatible, la API:

- Crea un registro en `account_sessions`.
- Guarda la cuenta, aplicación cliente, expiración, hash del refresh token y metadata de la request.
- Emite un access JWT que contiene el identificador de sesión.
- Establece la cookie de refresh token específica para la aplicación.

### Rotación

En `POST /api/auth/refresh`, la API:

1. Verifica el HMAC del refresh token con `REFRESH_TOKEN_SECRET`.
2. Carga la sesión correspondiente para la aplicación cliente solicitada.
3. Comprueba que la versión y el secreto del token coincidan con la sesión persistida.
4. Genera un secreto aleatorio nuevo e incrementa la versión del token.
5. Reemplaza atómicamente el hash almacenado y la expiración.
6. Emite un access JWT y refresh token de reemplazo.

La actualización condicional en la base de datos evita que dos requests de refresh concurrentes roten exitosamente el mismo token.

### Detección de Reutilización

Cuando se presenta un token con una versión anterior, la API lo trata como una posible reutilización:

- Revoca la sesión completa.
- La request devuelve `401 Unauthorized`.
- El refresh token anterior no puede volver a usarse.

Firmas inválidas, sesiones desconocidas, aplicaciones que no coinciden, sesiones expiradas o revocadas y secretos incorrectos también devuelven `401 Unauthorized`.

### Cierre de Sesión

`POST /api/auth/logout` revoca la sesión persistida actual y elimina la cookie específica de la aplicación. La revocación depende del hash y versión actuales para que un logout obsoleto no revoque accidentalmente una rotación concurrente exitosa.

### Restablecimiento de Contraseña

Completar un restablecimiento de contraseña ejecuta una transacción que:

- Elimina el token de restablecimiento atómicamente.
- Actualiza la contraseña de la cuenta.
- Revoca todas las sesiones activas de la cuenta.

Después de restablecer la contraseña, todos los dispositivos deben autenticarse otra vez.

## Retención de Sesiones

La tarea programada de limpieza de sesiones elimina sesiones cuya expiración o período de retención posterior a la revocación haya terminado. La limpieza de restablecimiento de contraseña elimina tokens expirados, incluidos los tokens invalidados por una solicitud de restablecimiento posterior.

## Restauración en el Cliente

Los clientes web no leen la cookie de refresh token. Al iniciar la aplicación, su servicio de sesión compartido llama al endpoint de sesión con credenciales. Cuando el access token falta o expira, el `QueryFactory` compartido ejecuta una única request de refresh y reintenta la request original dentro de su política de reintentos limitada.

Este comportamiento de una sola ejecución evita que varias requests de API simultáneas roten el mismo refresh token de forma independiente.

## Configuración CORS

La API requiere estas URLs públicas:

```env
WEB_URL=https://example.com
DASHBOARD_URL=https://dashboard.example.com
ADMIN_URL=https://admin.example.com
```

`CORS_ALLOWED_ORIGINS` es opcional. La API siempre permite las tres URLs de aplicación anteriores. Defínela como una lista separada por comas solo cuando se requieran orígenes adicionales:

```env
CORS_ALLOWED_ORIGINS=https://partner.example.com,https://ops.example.com
```

Se eliminan los espacios y los orígenes duplicados.

## Implementación Relacionada

- `apps/api/src/modules/auth/application/refresh-session.use-case.ts`
- `apps/api/src/modules/auth/application/refresh-token.utils.ts`
- `apps/api/src/modules/auth/application/logout-session.use-case.ts`
- `apps/api/src/modules/auth/application/services/session-metadata.service.ts`
- `packages/db/src/repositories/auth/account-sessions.ts`
- `packages/db/src/schema/account-session.ts`
- `packages/common/src/lib/query-factory.ts`
