#!/usr/bin/env bash
# Pull digest-pinned images, migrate, then reconcile long-running services.
# Pull or migration failure leaves the active release unchanged.

set -euo pipefail
umask 077

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=lib.sh
source "$script_dir/lib.sh"

if [[ $# -lt 1 || $# -gt 2 ]]; then
  printf 'Usage: %s /path/to/environment.compose.env [/path/to/image-overrides.env]\n' "$0" >&2
  exit 64
fi

compose_env_file=$1
image_overrides_file=${2:-}

load_env_file "$compose_env_file"
if [[ -n $image_overrides_file ]]; then
  load_env_file "$image_overrides_file"
fi

init_state_paths
require_digest_images
compose_argv "$image_overrides_file"

"${compose[@]}" config --quiet
"${compose[@]}" pull "${LONG_RUNNING_SERVICES[@]}"
"${compose[@]}" --profile tools pull migrator

# Stop here on failure so running containers are not recreated.
"${compose[@]}" --profile tools run --rm migrator

mkdir -p "$state_dir"
candidate_previous_file=$(mktemp "$state_dir/.previous-images.XXXXXX")
current_images_tmp=
trap 'rm -f "$candidate_previous_file" "${current_images_tmp:-}"' EXIT

if [[ -f $current_images_file ]]; then
  cp "$current_images_file" "$candidate_previous_file"
else
  : >"$candidate_previous_file"
fi

"${compose[@]}" up --detach --no-build --wait --wait-timeout "$wait_timeout" \
  "${LONG_RUNNING_SERVICES[@]}"

# Record the new set only after health waits succeed.
current_images_tmp=$(mktemp "$state_dir/.current-images.XXXXXX")
write_image_set "$current_images_tmp"

if [[ -s $candidate_previous_file ]]; then
  mv "$candidate_previous_file" "$previous_images_file"
else
  rm -f "$previous_images_file"
fi

mv "$current_images_tmp" "$current_images_file"
trap - EXIT

printf 'Deployment for %s completed successfully.\n' "$DEPLOY_ENVIRONMENT"
