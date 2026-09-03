#!/usr/bin/env bash
# Start the local development PostgreSQL Compose stack and wait until ready.

set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
compose_file="$repo_root/docker-compose.dev.yml"
connection_url='postgresql://app:app@localhost:5432/app'

if ! command -v docker >/dev/null 2>&1; then
  printf 'docker is required but was not found on PATH.\n' >&2
  exit 1
fi

docker compose -f "$compose_file" up -d --wait

printf 'PostgreSQL is ready at %s\n' "$connection_url"
