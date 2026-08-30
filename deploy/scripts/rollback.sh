#!/usr/bin/env bash
# Restore the previously recorded image set. Never runs down migrations.

set -euo pipefail
umask 077

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=lib.sh
source "$script_dir/lib.sh"

if [[ $# -ne 1 ]]; then
  printf 'Usage: %s /path/to/environment.compose.env\n' "$0" >&2
  exit 64
fi

compose_env_file=$1

load_env_file "$compose_env_file"
init_state_paths

if [[ ! -s $previous_images_file ]]; then
  printf 'No previous image set is recorded for %s.\n' "$DEPLOY_ENVIRONMENT" >&2
  exit 69
fi

# Previous digests override the selection file without rewriting it.
compose_argv "$previous_images_file"

"${compose[@]}" config --quiet
"${compose[@]}" pull "${LONG_RUNNING_SERVICES[@]}"
"${compose[@]}" up --detach --no-build --wait --wait-timeout "$wait_timeout" \
  "${LONG_RUNNING_SERVICES[@]}"

mkdir -p "$state_dir"
rollback_images_file=$(mktemp "$state_dir/.rollback-images.XXXXXX")
trap 'rm -f "$rollback_images_file"' EXIT

if [[ -f $current_images_file ]]; then
  cp "$current_images_file" "$rollback_images_file"
fi

mv "$previous_images_file" "$current_images_file"
if [[ -s $rollback_images_file ]]; then
  mv "$rollback_images_file" "$previous_images_file"
fi

trap - EXIT
rm -f "$rollback_images_file"

printf 'Rollback for %s completed successfully. Database migrations were not reversed.\n' \
  "$DEPLOY_ENVIRONMENT"
