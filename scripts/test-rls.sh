#!/usr/bin/env bash
# Applies the Supabase migrations to a throwaway PostgreSQL cluster and runs
# supabase/tests/rls_alpha_core.sql against it.
#
# This is NOT `supabase test db`: it needs no Docker and no Supabase CLI, only
# PostgreSQL server binaries. Supabase is approximated by
# supabase/tests/support/local-shim.sql. A green run proves the migrations and
# the access rules on plain PostgreSQL; it does not replace one run against
# real Supabase.
#
# Usage: bash scripts/test-rls.sh        (or: npm run test:rls)
# Env:   PG_BIN=/path/to/postgres/bin    override binary directory
#        MIGRATIONS_DIR=/path                override migration directory (used to
#                                        verify that the tests catch mutations)

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

find_pg_bin() {
  if [[ -n "${PG_BIN:-}" ]]; then
    echo "$PG_BIN"
    return
  fi
  local candidate
  for candidate in $(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -rV); do
    if [[ -x "$candidate/initdb" && -x "$candidate/postgres" ]]; then
      echo "$candidate"
      return
    fi
  done
  if command -v initdb >/dev/null 2>&1; then
    dirname "$(command -v initdb)"
    return
  fi
  echo "No PostgreSQL server binaries found. Install postgresql or set PG_BIN." >&2
  exit 2
}

pg_bin="$(find_pg_bin)"

# PostgreSQL refuses to run as root, so drop to the postgres user in that case.
run_as_pg() {
  if [[ "$(id -u)" == "0" ]]; then
    runuser -u postgres -- "$@"
  else
    "$@"
  fi
}

work_dir="$(mktemp -d /tmp/diskoe-rls.XXXXXX)"
if [[ "$(id -u)" == "0" ]]; then
  chown postgres:postgres "$work_dir"
fi
data_dir="$work_dir/data"
socket_dir="$work_dir/sock"
mkdir -p "$socket_dir"
if [[ "$(id -u)" == "0" ]]; then
  chown postgres:postgres "$socket_dir"
fi

err_log="$work_dir/psql-errors.log"
: >"$err_log"

on_exit() {
  local status=$?
  # GitHub only shows the exit code of a failed step in annotations, so
  # surface the actual SQL error as an annotation.
  if [[ $status -ne 0 && "${GITHUB_ACTIONS:-}" == "true" && -s "$err_log" ]]; then
    echo "::error title=RLS tests failed::$(tail -n 5 "$err_log" | tr '\n' ' ' | cut -c1-900)"
  fi
  run_as_pg "$pg_bin/pg_ctl" -D "$data_dir" -m immediate stop >/dev/null 2>&1 || true
  rm -rf "$work_dir"
  exit "$status"
}
trap on_exit EXIT

run_as_pg "$pg_bin/initdb" -D "$data_dir" -A trust -U postgres --no-sync >/dev/null
run_as_pg "$pg_bin/pg_ctl" -D "$data_dir" -w -l "$work_dir/server.log" \
  -o "-c listen_addresses='' -c unix_socket_directories='$socket_dir' -c fsync=off -c synchronous_commit=off" \
  start >/dev/null

psql_run() {
  # stdin is opened by the calling shell, so file permissions of the postgres
  # user do not matter. stderr (notices and errors) goes to a log that is
  # printed only when the run fails.
  if ! run_as_pg "$pg_bin/psql" -X -q -h "$socket_dir" -U postgres \
      -v ON_ERROR_STOP=1 -v VERBOSITY=terse "$@" 2>>"$err_log"; then
    cat "$err_log" >&2
    return 1
  fi
}

run_as_pg "$pg_bin/createdb" -h "$socket_dir" -U postgres diskoe_test

echo "PostgreSQL: $("$pg_bin/postgres" --version)"
echo "-- shim"
psql_run -d diskoe_test <"$repo_root/supabase/tests/support/local-shim.sql"

migrations_dir="${MIGRATIONS_DIR:-$repo_root/supabase/migrations}"
for migration in "$migrations_dir"/*.sql; do
  echo "-- migration $(basename "$migration")"
  psql_run -d diskoe_test <"$migration"
done

echo "-- tests"
psql_run -d diskoe_test <"$repo_root/supabase/tests/rls_alpha_core.sql"
echo "RLS tests passed."
