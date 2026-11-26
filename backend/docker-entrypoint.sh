#!/bin/sh
set -eu

if [ "${RUN_MIGRATIONS_ON_BOOT:-false}" = "true" ]; then
  echo "[Entrypoint] Running database migrations..."
  node dist/database/migration.runner.js
fi

if [ "${RUN_SEED_ON_BOOT:-false}" = "true" ]; then
  echo "[Entrypoint] Running idempotent database seeder..."
  node dist/database/seed.runner.js
fi

exec "$@"
