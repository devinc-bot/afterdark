# Container Operations

This runbook deploys digest-pinned images to independent staging and production VPS hosts. It does
not create cloud resources, DNS zones, VPS hosts, or Neon databases.

## Quick Path

1. Configure the GitHub Environment and the matching VPS files described below.
2. Run `Publish Images` for `staging` or `production`, then retain its digest artifact.
3. Dispatch `Deploy Staging` or the protected `Deploy Production` workflow with that commit SHA.
4. Confirm the workflow's HTTPS probes and the recorded image set in
   `/var/lib/app/<environment>/current-images.env`.

## Prerequisites

| Area               | Required state                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| DNS and TLS        | `WEB_HOST`, `DASHBOARD_HOST`, `ADMIN_HOST`, and `API_HOST` resolve to the matching VPS. Caddy obtains and renews TLS certificates.          |
| VPS                | Docker Engine with Compose v2, read-only GHCR access, `/opt/app` checkout, and ports 80/443 exposed through the firewall.                   |
| Neon               | Staging and production use separate databases; retain a recovery point before destructive migrations.                                       |
| GitHub Environment | Public `VITE_API_URL` and `VITE_DASHBOARD_URL` variables; `VPS_HOST`, `VPS_USER`, `VPS_SSH_PRIVATE_KEY`, and `VPS_SSH_KNOWN_HOSTS` secrets. |
| Production         | The `production` Environment must require protected approval before a deployment job starts.                                                |

Only Caddy publishes ports 80 and 443. API and frontend containers, PostgreSQL migrations, and all
runtime secrets stay on the internal Compose network or host filesystem.

## VPS Configuration

Place the checkout at `/opt/app`. Restrict the environment files to the deployment user:

```bash
chmod 600 /etc/app/staging.api.runtime.env /etc/app/staging.migrator.env /etc/app/staging.compose.env
chmod 600 /etc/app/production.api.runtime.env /etc/app/production.migrator.env /etc/app/production.compose.env
cd /opt/app
docker compose --env-file /etc/app/staging.compose.env config
```

The API runtime file has the pooled `DATABASE_URL`; the migrator file has only the direct
`DATABASE_MIGRATION_URL`. Neither file belongs in Git or Docker build context. Use the matching
examples in `deploy/env/` as the variable contract.

Staging intentionally uses `NODE_ENV=production`: it validates the same production artifacts and
runtime behavior as production while retaining separate domains, credentials, and Neon database.

## Image Publication

`Publish Images` creates `staging-<commit-sha>` or `production-<commit-sha>` tags for API,
migrator, web, dashboard, and admin. The workflow saves the resolved immutable digests and Trivy
SARIF report as artifacts. Never deploy `latest`.

Frontend public URLs are embedded at build time. A changed `VITE_API_URL` or
`VITE_DASHBOARD_URL` requires republishing the affected frontend images for that environment.

## Deployment And Migrations

The staging and production workflows resolve image tags to digests, copy a temporary image override
file to the VPS, then run `deploy/scripts/deploy.sh`. The script pulls images, runs the one-shot
migrator, waits for Compose health checks, and records the release. A pull or migration failure does
not reconcile active application containers. Seeds are never part of this flow.

For an operator-run release, provide only digest references:

```bash
cd /opt/app
bash deploy/scripts/deploy.sh /etc/app/staging.compose.env /path/to/release-images.env
```

After deployment, verify the four public routes:

```bash
curl --fail https://staging.example.com/
curl --fail https://dashboard.staging.example.com/
curl --fail https://admin.staging.example.com/
curl --fail https://api.staging.example.com/api/health/
```

## Rollback And Neon Recovery

To roll back application images without changing database state:

```bash
cd /opt/app
bash deploy/scripts/rollback.sh /etc/app/staging.compose.env
```

Rollback swaps to the previous compatible digest set and waits for health checks. It never runs down
migrations. Before a destructive migration, create or confirm a Neon recovery point and assess
backward compatibility. If the prior application cannot use the migrated schema, deploy a forward
corrective migration or restore Neon according to the incident decision; do not use automatic
database rollback.

## Secret Rotation

1. Rotate a credential with its provider and update the restricted runtime file on the matching VPS.
2. Restart only the affected environment through its deployment workflow.
3. Revoke the old credential after health checks pass.
4. Rotate GitHub SSH secrets and update the VPS authorized key or host-key value as applicable.

## Troubleshooting

| Symptom                  | Check                                                                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Migration fails          | Confirm the direct Neon URL is only in the migrator file, inspect `docker compose ... run --rm migrator` output, and leave applications on the active release.              |
| API is unhealthy         | Inspect `docker compose logs api`; verify pooled `DATABASE_URL` and Neon connectivity.                                                                                      |
| Clients receive HTTP 429 | Confirm `RATE_LIMIT_*` pairs in the API runtime file, `Retry-After`, and that health/webhook routes stay excluded. In-memory limits do not synchronize across API replicas. |
| Public route fails       | Inspect Caddy logs, DNS records, firewall ports 80/443, and the matching `*_HOST` value.                                                                                    |
| GHCR pull fails          | Verify the VPS read-only registry credential and the digest exists in the publication artifact.                                                                             |
| Disk growth              | Inspect `docker system df`, retain images required by `current-images.env` and `previous-images.env`, then prune only unreferenced images.                                  |
