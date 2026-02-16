#!/usr/bin/env bash
# Ralph loop with streaming output + logging
set -uo pipefail

LOGFILE="ralph-$(date '+%Y%m%d-%H%M%S').log"

echo "Starting Ralph loop. Ctrl+C to stop."
echo "Logging to: $LOGFILE"
echo ""

while :; do
  echo "=== Iteration $(date '+%H:%M:%S') ===" | tee -a "$LOGFILE"

  cat PROMPT_build.md | claude -p \
    --verbose \
    --dangerously-skip-permissions \
    --model sonnet \
    --max-turns 30 \
    --output-format=stream-json \
    | ./ralph-filter.sh \
    | tee -a "$LOGFILE"

  echo "--- Restarting in 5s ---" | tee -a "$LOGFILE"
  sleep 5
done
