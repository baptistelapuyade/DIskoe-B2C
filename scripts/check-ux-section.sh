#!/usr/bin/env bash
# Checks that a pull request which changes UI code carries the UX check.
#
# Usage: scripts/check-ux-section.sh <changed-files-file> <pr-body-file>
#   changed-files-file: one repository path per line
#   pr-body-file:       the pull request description (Markdown)
#
# Exit 0: no UI change, or the required sections are present and filled in.
# Exit 1: UI change without the sections from .github/pull_request_template.md.
# This is a minimum standard; it does not replace the review.
set -euo pipefail

files_file="${1:?changed files file required}"
body_file="${2:?pull request body file required}"

if ! grep -Eq '^(app|components)/' "$files_file"; then
  echo "No changes in app/ or components/: UX check not required."
  exit 0
fi

fail=0
error() {
  echo "::error title=UX-Check::$1"
  fail=1
}

body="$(cat "$body_file")"

has_heading() {
  grep -Eiq "^##[[:space:]]+$1" <<<"$body"
}

has_heading 'UX-Check' ||
  error 'Abschnitt "## UX-Check" fehlt (Vorlage: .github/pull_request_template.md).'
has_heading 'Figma gegen Umsetzung' ||
  error 'Abschnitt "## Figma gegen Umsetzung" fehlt (Vorlage: .github/pull_request_template.md).'

# Placeholders from the template that must be answered.
if grep -Eq 'ausgefüllt:[[:space:]]*ja[[:space:]]*/[[:space:]]*nein' <<<"$body"; then
  error 'UX-Check: "ausgefüllt: ja / nein" ist nicht beantwortet (docs/startpaket/09-ux-framework.md, §6).'
fi
if grep -Eq 'verglichen:[[:space:]]*ja[[:space:]]*/[[:space:]]*nein' <<<"$body"; then
  error 'Figma gegen Umsetzung: "verglichen: ja / nein" ist nicht beantwortet.'
fi

if [ "$fail" -ne 0 ]; then
  echo "UI-Änderung ohne vollständigen UX-Check. Siehe docs/startpaket/09-ux-framework.md, §6 und §7."
  exit 1
fi
echo "UX check sections present."
