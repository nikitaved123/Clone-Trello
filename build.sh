#!/usr/bin/env bash
set -o errexit

cd client && npm ci && npm run build && cd ..

mix deps.get --only prod
MIX_ENV=prod mix compile
MIX_ENV=prod mix phx.gen.release
MIX_ENV=prod mix release --overwrite
