#!/usr/bin/env bash
# Creates or starts a persistent PostgreSQL container for host development.

set -euo pipefail

container_name=lumina-postgres
volume_name=lumina-postgres-data
database=app
user=app
password=app
port=5432

if docker container inspect "$container_name" >/dev/null 2>&1; then
  docker start "$container_name" >/dev/null
else
  docker run --detach \
    --name "$container_name" \
    --restart unless-stopped \
    --publish "$port:5432" \
    --volume "$volume_name:/var/lib/postgresql/data" \
    --env "POSTGRES_DB=$database" \
    --env "POSTGRES_USER=$user" \
    --env "POSTGRES_PASSWORD=$password" \
    postgres:17-alpine >/dev/null
fi

until docker exec "$container_name" pg_isready -U "$user" -d "$database" >/dev/null 2>&1; do
  sleep 1
done

printf 'PostgreSQL is ready at postgresql://%s:%s@localhost:%s/%s\n' \
  "$user" "$password" "$port" "$database"
