#!/usr/bin/env bash
# Shared helpers for deploy.sh and rollback.sh. Sourced, never executed.

IMAGE_VARIABLES=(
  API_IMAGE
  WEB_IMAGE
  DASHBOARD_IMAGE
  ADMIN_IMAGE
  MIGRATOR_IMAGE
  CADDY_IMAGE
)
LONG_RUNNING_SERVICES=(api web dashboard admin caddy)

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
repo_root=$(cd "$script_dir/../.." && pwd)
compose_file=${COMPOSE_FILE:-"$repo_root/docker-compose.yml"}

require_file() {
  local path=$1
  local label=${2:-File}

  if [[ ! -f $path ]]; then
    printf '%s not found: %s\n' "$label" "$path" >&2
    exit 66
  fi
}

# Selection files hold image references and host paths, never API or database
# credentials. `set -a` exports every assignment so Compose interpolation works.
load_env_file() {
  local path=$1

  require_file "$path" 'Environment file'
  # shellcheck disable=SC1090
  set -a
  source "$path"
  set +a
}

require_digest_images() {
  local name image

  for name in "${IMAGE_VARIABLES[@]}"; do
    image=${!name:?Set "$name" in the compose environment file}
    if [[ $image != *@sha256:* ]]; then
      printf '%s must use an immutable digest reference\n' "$name" >&2
      exit 65
    fi
  done
}

init_state_paths() {
  : "${DEPLOY_ENVIRONMENT:?Set DEPLOY_ENVIRONMENT in the compose environment file}"
  state_dir=${DEPLOY_STATE_DIR:-"/var/lib/app/$DEPLOY_ENVIRONMENT"}
  current_images_file="$state_dir/current-images.env"
  previous_images_file="$state_dir/previous-images.env"
  wait_timeout=${DEPLOY_WAIT_TIMEOUT:-120}
}

# Extra env files come after the primary selection so image overrides win.
compose_argv() {
  local extra

  compose=("${DOCKER_BIN:-docker}" compose --env-file "$compose_env_file")
  for extra in "$@"; do
    [[ -n $extra ]] && compose+=(--env-file "$extra")
  done
  compose+=(-f "$compose_file")
}

write_image_set() {
  local dest=$1
  local name

  : >"$dest"
  for name in "${IMAGE_VARIABLES[@]}"; do
    printf '%s=%s\n' "$name" "${!name}" >>"$dest"
  done
}
