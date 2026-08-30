#!/usr/bin/env bash
# Exercises deploy and rollback with a Docker command double. No registry,
# database, or VPS is contacted.

set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
deploy_script="$repo_root/deploy/scripts/deploy.sh"
rollback_script="$repo_root/deploy/scripts/rollback.sh"
test_root=$(mktemp -d)
state_dir="$test_root/state"
fake_bin="$test_root/bin"
compose_env_file="$test_root/staging.compose.env"

cleanup() {
  rm -rf "$test_root"
}
trap cleanup EXIT

mkdir -p "$fake_bin"

# Succeeds unless FAKE_FAILURE matches the Compose subcommand under test.
cat >"$fake_bin/docker" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

arguments=" $* "

if [[ $arguments == *' pull '* && ${FAKE_FAILURE:-} == pull ]]; then
  exit 1
fi

if [[ $arguments == *' run '* && ${FAKE_FAILURE:-} == migration ]]; then
  exit 1
fi

if [[ $arguments == *' up '* && ${FAKE_FAILURE:-} == health ]]; then
  exit 1
fi
EOF
chmod +x "$fake_bin/docker"

write_selection() {
  local digest=$1

  cat >"$compose_env_file" <<EOF
DEPLOY_ENVIRONMENT=staging
DEPLOY_STATE_DIR=$state_dir
API_IMAGE=registry.example/api@sha256:$digest-api
WEB_IMAGE=registry.example/web@sha256:$digest-web
DASHBOARD_IMAGE=registry.example/dashboard@sha256:$digest-dashboard
ADMIN_IMAGE=registry.example/admin@sha256:$digest-admin
MIGRATOR_IMAGE=registry.example/migrator@sha256:$digest-migrator
CADDY_IMAGE=registry.example/caddy@sha256:$digest-caddy
API_RUNTIME_ENV_FILE=/restricted/api.env
MIGRATOR_RUNTIME_ENV_FILE=/restricted/migrator.env
UNRELATED_SECRET=must-not-be-logged
EOF
}

run_deploy() {
  DOCKER_BIN="$fake_bin/docker" bash "$deploy_script" "$compose_env_file"
}

run_rollback() {
  DOCKER_BIN="$fake_bin/docker" bash "$rollback_script" "$compose_env_file"
}

assert_current() {
  grep -q "API_IMAGE=registry.example/api@sha256:$1-api" "$state_dir/current-images.env"
}

assert_previous() {
  grep -q "API_IMAGE=registry.example/api@sha256:$1-api" "$state_dir/previous-images.env"
}

expect_failure() {
  local kind=$1
  local message=$2
  local output

  if output=$(FAKE_FAILURE=$kind run_deploy 2>&1); then
    printf '%s\n' "$message" >&2
    exit 1
  fi

  # Selection files may contain secrets; scripts must not echo them.
  [[ $output != *must-not-be-logged* ]]
}

# First release records current images and has no previous set.
write_selection v1
run_deploy
assert_current v1
test ! -e "$state_dir/previous-images.env"

# Second release promotes v1 to previous.
write_selection v2
run_deploy
assert_current v2
assert_previous v1

# Failed pull and failed migration must not change the recorded release.
write_selection v3
expect_failure pull 'Expected image pull to fail.'
assert_current v2

expect_failure migration 'Expected migration to fail.'
assert_current v2

# Unhealthy rollout also leaves the recorded set unchanged.
write_selection v4
if FAKE_FAILURE=health run_deploy; then
  printf 'Expected health check to fail.\n' >&2
  exit 1
fi
assert_current v2
assert_previous v1

# Rollback swaps current and previous without reversing migrations.
run_rollback
assert_current v1
assert_previous v2

printf 'Deployment script tests passed.\n'
