# Deployment Environment Contracts

Each environment has two separate configuration files:

- `<environment>.runtime.env.example` is runtime-only configuration for the API. Copy it to a
  restricted file on the matching host and replace every `REPLACE_*` marker with the environment's
  actual value.
- `<environment>.migrator.env.example` contains only `DATABASE_MIGRATION_URL` for the one-shot
  migration job. It must not be provided to the API container.
- `<environment>.vps.env.example` selects immutable images, hostnames, and the absolute paths of the
  two restricted runtime files for the matching VPS.
- `<environment>.build.env.example` contains public frontend build inputs. Supply it only while
  building the `web`, `dashboard`, and `admin` images. These values are embedded in frontend output
  and must never contain credentials.

Never commit populated files. Keep staging and production files on their respective VPS hosts with
restricted permissions.

`DATABASE_URL` is the pooled URL used by the API at runtime. `DATABASE_MIGRATION_URL` is the direct
database URL used only by the migration job. In development both URLs point to the local PostgreSQL
service. Staging and production must use separate Neon databases.

Staging runs with `NODE_ENV=production` because it executes production artifacts. Its provider
credentials, domains, and database URLs remain distinct from production.

## Required Build Inputs

Every frontend requires `VITE_API_URL`. The `web` application also requires `VITE_DASHBOARD_URL`.
The examples contain the exact variable names expected by each app's environment validation.
Configure those two values as GitHub Environment variables for the `staging` and `production`
environments before dispatching the image publication workflow. They are public build inputs, not
GitHub secrets.

## Runtime Secrets

The following runtime values are secrets and must not be supplied as Docker build arguments:

- `DATABASE_URL`
- `DATABASE_MIGRATION_URL`
- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`
- `GOOGLE_CLIENT_SECRET`
- `RESEND_API_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

`GOOGLE_CLIENT_ID`, `MAIL_FROM`, `R2_ACCOUNT_ID`, `R2_BUCKET`, and public URLs are not credentials,
but they remain runtime configuration because the API validates and uses them.

`CORS_ALLOWED_ORIGINS` is optional. The API always allows `WEB_URL`, `DASHBOARD_URL`, and `ADMIN_URL`;
set this variable as a comma-separated list only when additional origins are required.

`RATE_LIMIT_*_LIMIT` and `RATE_LIMIT_*_TTL_MS` pairs are optional runtime configuration, not secrets.
Each omitted pair uses the API schema default. Counters are per API process until shared storage
exists; keep edge rate limiting on Caddy, the CDN, or a WAF for cluster-wide protection.

## VPS Compose

`docker-compose.yml` is the single deployment definition. On each VPS, place populated environment
files outside the repository with
permissions such as `chmod 600`, then use the environment-specific VPS file:

```bash
docker compose --env-file /etc/app/staging.compose.env config
bash deploy/scripts/deploy.sh /etc/app/staging.compose.env
bash deploy/scripts/rollback.sh /etc/app/staging.compose.env
bash deploy/scripts/test-deployment-scripts.sh
```

Only Caddy publishes ports 80 and 443. Application containers and the migration job are attached to
an internal-only network. Caddy also joins a separate public network so it can obtain TLS
certificates.

The deployment script pulls immutable images, runs the migration job, waits for all long-running
health checks, and then records the selected image set under
`/var/lib/app/<environment>/`. Pull or migration failures leave running application containers
unchanged. Rollback swaps to the previous recorded images and never runs down migrations.
The shell test uses a Docker command double and does not contact a registry, database, or VPS.

The staging deployment workflow resolves `staging-<commit-sha>` GHCR tags to digests and supplies
them as a temporary override to `/etc/app/staging.compose.env` on `/opt/app`. Configure its staging
Environment with `VPS_HOST`, `VPS_USER`, `VPS_SSH_PRIVATE_KEY`, and `VPS_SSH_KNOWN_HOSTS`; the latter
must contain the server's trusted SSH host-key entry.
