# Plan de implementación — Verificación de email en registro (cliente + dueño)

> Complementa `spec.md`. Confirmado en entrevista (+ ampliación dashboard).

## Orden de capas

```text
1. @repo/validators     — confirm schema (reutilizar); rutas owner request/confirm
2. @repo/common         — API_ROUTES registerOwnerRequest / registerOwnerConfirm
3. @repo/i18n           — auth.register.checkEmail + confirm.* (dashboard)
4. packages/db          — schema owner_registration_tokens + repos (+ cleanup cron)
5. apps/api auth + mail — Request/Confirm Owner use cases; mail con DASHBOARD_URL
6. apps/web             — (hecho) user request/confirm
7. apps/dashboard       — register → request; /register/confirm → confirm + /dashboard
```

**DB:** schema TypeScript + repos. Preferir `db:push` en local si aún no hay migración del equipo.

## Diseño técnico (owner — nuevo)

```text
Dashboard RegisterForm
  → POST /api/auth/register/owner/request
  → RequestOwnerRegistrationUseCase
      → email existe? → 409
      → count hoy ≥ 10? → 429
      → hash password → invalidate pending → insert owner_registration_tokens
      → send mail (DASHBOARD_URL/register/confirm?token=)
      → 204

/register/confirm?token=  (dashboard)
  → POST /api/auth/register/owner/confirm { token }
  → ConfirmOwnerRegistrationUseCase
      → token usado + account owner? → login
      → token inválido/expirado sin cuenta? → 400
      → registerAccount (OWNER) → mark used → session
  → dashboard guarda sesión → redirect /dashboard
```

- Paridad con user: JWT purpose `owner-registration`, TTL 60, rate limit 10/día.
- Google owner intacto.

## Verificación manual

| Paso | Resultado esperado |
| ---- | ------------------ |
| 1. Registro owner email nuevo | “Revisá tu correo”; sin owner en DB |
| 2. Abrir link dashboard | Cuenta owner + sesión + `/dashboard` |
| 3. Reusar link (cuenta existe) | Login / home panel |
| 4. Token vencido sin cuenta | “El enlace expiró” (sin “ya verificado”) |
| 5. Email existente | `409` |
| 6. Google owner | Sin request/confirm |
| 7. Flujo web user | Sigue funcionando |
