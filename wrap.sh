#!/usr/bin/env bash
# Post-Ralph wrap-up: validate + archive an OpenSpec change
# Usage:
#   ./wrap.sh <change-name>        # Validate then archive
#   ./wrap.sh                      # Auto-detect from PROMPT_build.md
set -euo pipefail

# Auto-detect change name from PROMPT_build.md if not provided
if [ -n "${1:-}" ]; then
  CHANGE="$1"
else
  if [ ! -f PROMPT_build.md ]; then
    echo "Error: No change name provided and PROMPT_build.md not found."
    echo "Usage: ./wrap.sh <change-name>"
    exit 1
  fi
  # Extract change name from openspec/changes/<name>/ pattern in PROMPT_build.md
  CHANGE=$(grep -o 'openspec/changes/[^/]*' PROMPT_build.md | head -1 | sed 's|openspec/changes/||')
  if [ -z "$CHANGE" ]; then
    echo "Error: Could not detect change name from PROMPT_build.md."
    echo "Usage: ./wrap.sh <change-name>"
    exit 1
  fi
  echo "Auto-detected change: $CHANGE"
fi

echo ""
echo "=== Wrapping up: $CHANGE ==="
echo ""

# Step 1: Validate
echo "--- Step 1: Validate ---"
if openspec validate "$CHANGE"; then
  echo ""
  echo "Validation passed."
else
  echo ""
  echo "Validation failed. Fix issues before archiving."
  exit 1
fi

echo ""

# Step 2: Archive (syncs delta specs to main specs)
echo "--- Step 2: Archive ---"
openspec archive "$CHANGE" --yes

echo ""
echo "=== Done. $CHANGE validated and archived. ==="
