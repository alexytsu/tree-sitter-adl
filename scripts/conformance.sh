#!/usr/bin/env bash
# Conformance gate: every *.adl / *.adl-* file in the canonical adl-lang/adl
# corpus must parse with zero ERROR or MISSING nodes.
#
# By default this runs against the vendored snapshot in test/canonical/
# (taken from adl-lang/adl @ ec0daac4e3bffe682171404379c124547566b7ab), so CI
# needs no network. Pass a path to a fresh adl-lang/adl clone to run against
# ground truth instead:
#
#   ./scripts/conformance.sh            # vendored snapshot
#   ./scripts/conformance.sh /path/to/adl-clone
#
# Exclusions: haskell/compiler/tests/test28 is a canonical *negative* test
# ("aborts with error with extra content at end of module file", Main.hs) and
# must not parse cleanly.
set -u

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

if [ $# -ge 1 ]; then
  corpus="$1"
  files=$(find "$corpus/adl/stdlib" "$corpus"/haskell/compiler/tests/*/input \
    -type f \( -name '*.adl' -o -name '*.adl-*' \) 2>/dev/null | grep -v '/test28/' | sort)
else
  files=$(find "$repo_root/test/canonical" \
    -type f \( -name '*.adl' -o -name '*.adl-*' \) | sort)
fi

if [ -z "$files" ]; then
  echo "conformance: no corpus files found" >&2
  exit 1
fi

TS="${TREE_SITTER:-npx tree-sitter}"

total=0
failed=0
failures=""
for f in $files; do
  total=$((total + 1))
  # `parse -q` prints a summary line only for files whose tree contains
  # ERROR or MISSING nodes, and exits non-zero.
  if ! out=$($TS parse -q "$f" 2>/dev/null); then
    failed=$((failed + 1))
    failures="$failures$out"$'\n'
  fi
done

if [ "$failed" -ne 0 ]; then
  echo "conformance: $failed of $total files FAILED:"
  printf '%s' "$failures"
  exit 1
fi

echo "conformance: all $total files parsed with no ERROR/MISSING nodes"
