#!/usr/bin/env bash

set -Eeuo pipefail

backup_dir="${BACKUP_DIR:-/data/backups/harvesthub}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="${backup_dir}/harvesthub-${timestamp}.dump"
temporary_file=""
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  if [[ -n "${temporary_file}" && -f "${temporary_file}" ]]; then
    rm -f "${temporary_file}"
  fi
}
trap cleanup EXIT

mkdir -p "${backup_dir}"
temporary_file="$(mktemp "${backup_dir}/.harvesthub-backup.XXXXXX")"

cd "${script_dir}/.."

echo "Creating PostgreSQL backup..."
docker compose exec -T postgres pg_dump -U harvesthub -d harvesthub -Fc > "${temporary_file}"

echo "Validating backup..."
docker compose exec -T postgres pg_restore -l < "${temporary_file}" > /dev/null

mv "${temporary_file}" "${backup_file}"
temporary_file=""

echo "Backup created: ${backup_file}"
