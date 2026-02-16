#!/usr/bin/env bash
# Ralph loop with streaming output + logging
# Exits automatically when Claude outputs ALL_TASKS_COMPLETE
set -uo pipefail

LOGFILE="ralph-$(date '+%Y%m%d-%H%M%S').log"
DONE_FLAG=$(mktemp)
rm "$DONE_FLAG"  # remove so we can test existence

trap 'rm -f "$DONE_FLAG"' EXIT

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
    | tee -a "$LOGFILE" \
    | while IFS= read -r line; do
        echo "$line"
        if [[ "$line" == *"ALL_TASKS_COMPLETE"* ]]; then
          touch "$DONE_FLAG"
        fi
      done

  if [[ -f "$DONE_FLAG" ]]; then
    echo "" | tee -a "$LOGFILE"
    echo "=== ALL TASKS COMPLETE — Ralph loop finished ===" | tee -a "$LOGFILE"
    break
  fi

  echo "--- Restarting in 5s ---" | tee -a "$LOGFILE"
  sleep 5
done

# Post-build: validate and archive the change
if [[ -f "$DONE_FLAG" ]]; then
  echo ""
  echo "=== Running wrap-up (validate + archive) ===" | tee -a "$LOGFILE"
  ./wrap.sh 2>&1 | tee -a "$LOGFILE"
fi
