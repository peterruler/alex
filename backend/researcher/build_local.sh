#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
ENV_FILE="$REPO_ROOT/.env"
IMAGE_NAME="alex-researcher-local"
CONTAINER_NAME="alex-researcher-local"
PORT="8000"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: missing env file at $ENV_FILE" >&2
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

if docker ps -a --format '{{.Names}}' | grep -Fxq "$CONTAINER_NAME"; then
  docker rm -f "$CONTAINER_NAME" >/dev/null
fi

docker build \
  --build-arg INSTALL_BUILD_ESSENTIAL=true \
  -t "$IMAGE_NAME" \
  "$SCRIPT_DIR"

docker run \
  --rm \
  --name "$CONTAINER_NAME" \
  --env-file "$ENV_FILE" \
  -p "$PORT:8000" \
  "$IMAGE_NAME"
