#!/usr/bin/env bash
# Ralph loop for Book Pitches
# Usage:
#   ./loop.sh              # Build mode (default)
#   ./loop.sh plan         # Plan mode (generate/update IMPLEMENTATION_PLAN.md)
#   ./loop.sh build 20     # Build mode, max 20 iterations
#   ./loop.sh plan 5       # Plan mode, max 5 iterations

set -euo pipefail

MODE="${1:-build}"
MAX_ITERATIONS="${2:-0}"  # 0 = unlimited
ITERATION=0

if [ "$MODE" = "plan" ]; then
  PROMPT_FILE="PROMPT_plan.md"
else
  PROMPT_FILE="PROMPT_build.md"
fi

if [ ! -f "$PROMPT_FILE" ]; then
  echo "Error: $PROMPT_FILE not found in $(pwd)"
  exit 1
fi

echo "Starting Ralph loop: mode=$MODE, prompt=$PROMPT_FILE, max=$MAX_ITERATIONS"
echo "Press Ctrl+C to stop"
echo ""

while true; do
  ITERATION=$((ITERATION + 1))

  if [ "$MAX_ITERATIONS" -gt 0 ] && [ "$ITERATION" -gt "$MAX_ITERATIONS" ]; then
    echo "Reached max iterations ($MAX_ITERATIONS). Stopping."
    break
  fi

  echo "=== Ralph iteration $ITERATION ($(date '+%H:%M:%S')) ==="

  cat "$PROMPT_FILE" | claude -p \
    --model sonnet \
    --verbose \
    --allowedTools "Read,Edit,Write,Bash(git *),Bash(npm *),Bash(npx *),Bash(node *),Glob,Grep,mcp__supabase__apply_migration,mcp__supabase__execute_sql,mcp__supabase__list_tables,mcp__supabase__generate_typescript_types,mcp__supabase__get_project_url,mcp__supabase__get_publishable_keys,mcp__supabase__list_extensions,mcp__supabase__list_migrations" \
    --max-turns 30 \
    || true  # Don't exit loop if claude fails

  echo ""
  echo "=== Iteration $ITERATION complete. Sleeping 5s... ==="
  echo ""
  sleep 5
done
