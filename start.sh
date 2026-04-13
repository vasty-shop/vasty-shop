#!/usr/bin/env bash
#
# Vasty Shop one-line local setup.
#
# Usage:
#   ./start.sh              # interactive: runs setup wizard + docker + migrations
#   ./start.sh --headless   # non-interactive: assumes .env is already good
#
# Goal: take a fresh clone to a working local marketplace in under 2 minutes
# with zero API keys, using the pluggable-provider defaults (local-fs storage,
# pg-trgm search once #22 lands, osm-leaflet maps once #17 lands).
#
# Exits non-zero on any failure. Idempotent — safe to re-run.

set -euo pipefail

HERE=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
cd "$HERE"

HEADLESS=false
for arg in "$@"; do
  case "$arg" in
    --headless) HEADLESS=true ;;
    -h|--help)
      sed -n '3,13p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
  esac
done

say() { printf "\n\033[1;34m==>\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m!! \033[0m%s\n" "$*" >&2; }
die() { printf "\033[1;31mXX \033[0m%s\n" "$*" >&2; exit 1; }

say "Checking prerequisites"
command -v node >/dev/null 2>&1 || die "node is required (install from https://nodejs.org)"
command -v npm >/dev/null 2>&1 || die "npm is required"
command -v docker >/dev/null 2>&1 || warn "docker not found — you'll need to run Postgres/Redis manually"

NODE_MAJOR=$(node -v | sed 's/^v//' | cut -d. -f1)
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  die "Node 20+ required (found $(node -v))"
fi

say "Installing backend dependencies"
(cd backend && npm install --silent)

if [[ -d frontend ]]; then
  say "Installing frontend dependencies"
  (cd frontend && npm install --silent --legacy-peer-deps)
fi

if ! $HEADLESS; then
  if [[ ! -f backend/.env ]] || [[ "${FORCE_SETUP:-}" == "1" ]]; then
    say "Running setup wizard (pick providers, or press Enter for free defaults)"
    (cd backend && npm run setup) || warn "Setup wizard aborted; using .env.example defaults"
    if [[ ! -f backend/.env ]]; then
      cp backend/.env.example backend/.env
      warn "Copied .env.example → .env (no wizard selections applied)"
    fi
  else
    say ".env already exists — skipping wizard. Set FORCE_SETUP=1 to re-run."
  fi
else
  [[ -f backend/.env ]] || cp backend/.env.example backend/.env
fi

if command -v docker >/dev/null 2>&1; then
  say "Starting Docker services (postgres + redis)"
  docker compose up -d postgres redis

  say "Waiting for Postgres to accept connections"
  for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
      printf "  postgres ready\n"
      break
    fi
    printf "."
    sleep 1
  done
fi

say "Running database migrations"
(cd backend && npm run migrate) || warn "Migrations failed — check backend/.env DATABASE_* values"

say "Done. Next steps:"
cat <<EOF

  Start the backend:
    cd backend && npm run start:dev

  Start the frontend:
    cd frontend && npm run dev

  Open the health dashboard once the backend is up:
    http://localhost:4005/api/v1/health/providers

  Re-run the setup wizard any time:
    cd backend && npm run setup

EOF
