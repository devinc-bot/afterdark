#!/usr/bin/env bash
# Stop the local development PostgreSQL Compose stack (keeps the data volume).

set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
compose_file="$repo_root/docker-compose.dev.yml"

if ! command -v docker >/dev/null 2>&1; then
  printf 'docker is required but was not found on PATH.\n' >&2
  exit 1
fi

docker compose -f "$compose_file" down
