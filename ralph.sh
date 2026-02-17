#!/usr/bin/env bash
# Ralph loop — autonomous build agent for Book Pitches
# Exits on: ALL_TASKS_COMPLETE, BLOCKED, or max iterations
set -uo pipefail

# --- Configuration ---
MAX_ITERATIONS=${MAX_ITERATIONS:-50}
MODEL=${MODEL:-sonnet}
MAX_TURNS=${MAX_TURNS:-30}
COOLDOWN=${COOLDOWN:-5}

# --- Logging ---
LOGFILE="ralph-$(date '+%Y%m%d-%H%M%S').log"
DONE_FLAG=$(mktemp)
BLOCKED_FLAG=$(mktemp)
rm -f "$DONE_FLAG" "$BLOCKED_FLAG"

# --- Pre-flight checks ---
preflight_ok=true

if [[ ! -f "PROMPT_build.md" ]]; then
  echo "ERROR: PROMPT_build.md not found. Run /scaffold or /prd first."
  preflight_ok=false
fi

if [[ -f "PROMPT_build.md" ]]; then
  # Extract active feature directory from PROMPT_build.md
  active_feature=$(grep -oP 'features/[^/]+/' PROMPT_build.md | head -1)
  if [[ -z "$active_feature" ]]; then
    echo "ERROR: No active feature found in PROMPT_build.md."
    preflight_ok=false
  elif [[ ! -f "${active_feature}tasks.md" ]]; then
    echo "ERROR: ${active_feature}tasks.md not found. Run /prd first."
    preflight_ok=false
  fi
fi

if [[ -f "BLOCKER.md" ]]; then
  echo "WARNING: BLOCKER.md exists. Ralph was previously blocked:"
  cat BLOCKER.md
  echo ""
  echo "Remove BLOCKER.md to continue, or fix the issue first."
  preflight_ok=false
fi

if [[ "$preflight_ok" != "true" ]]; then
  echo "Pre-flight checks failed. Fix the issues above and try again."
  exit 1
fi

# --- Dev server ---
DEV_SERVER_PID=""
DEV_PORT=${PORT:-0}

# Find a free port if not specified
if [[ "$DEV_PORT" -eq 0 ]]; then
  for port in $(seq 3000 3099); do
    if ! lsof -iTCP:$port -sTCP:LISTEN -t &>/dev/null; then
      DEV_PORT=$port
      break
    fi
  done
  if [[ "$DEV_PORT" -eq 0 ]]; then
    echo "ERROR: No free port found in 3000-3099"
    exit 1
  fi
fi

if ! lsof -iTCP:$DEV_PORT -sTCP:LISTEN -t &>/dev/null; then
  echo "Starting dev server on port $DEV_PORT..."
  npx next dev --webpack --port "$DEV_PORT" &>/dev/null &
  DEV_SERVER_PID=$!
  for i in {1..30}; do
    if lsof -iTCP:$DEV_PORT -sTCP:LISTEN -t &>/dev/null; then
      echo "Dev server ready on port $DEV_PORT (PID $DEV_SERVER_PID)"
      break
    fi
    sleep 1
  done
  if ! lsof -iTCP:$DEV_PORT -sTCP:LISTEN -t &>/dev/null; then
    echo "ERROR: Dev server failed to start within 30s"
    kill "$DEV_SERVER_PID" 2>/dev/null
    exit 1
  fi
else
  echo "Dev server already running on port $DEV_PORT"
fi

DEV_URL="http://localhost:$DEV_PORT"

cleanup() {
  rm -f "$DONE_FLAG" "$BLOCKED_FLAG"
  if [[ -n "$DEV_SERVER_PID" ]]; then
    echo "Stopping dev server (PID $DEV_SERVER_PID)..."
    kill "$DEV_SERVER_PID" 2>/dev/null
    wait "$DEV_SERVER_PID" 2>/dev/null
  fi
}
trap cleanup EXIT

echo "Starting Ralph loop. Ctrl+C to stop."
echo "Logging to: $LOGFILE"
echo "Model: $MODEL | Max turns: $MAX_TURNS | Max iterations: $MAX_ITERATIONS | Dev: $DEV_URL"
echo ""

iteration=0
while :; do
  iteration=$((iteration + 1))

  if [[ $iteration -gt $MAX_ITERATIONS ]]; then
    echo "=== Max iterations ($MAX_ITERATIONS) reached ===" | tee -a "$LOGFILE"
    break
  fi

  echo "=== Iteration $iteration ($(date '+%H:%M:%S')) ===" | tee -a "$LOGFILE"

  (echo "IMPORTANT: The dev server is running at $DEV_URL — use this URL (not localhost:3000) for all browser verification steps."; echo ""; cat PROMPT_build.md) | claude -p \
    --verbose \
    --dangerously-skip-permissions \
    --model "$MODEL" \
    --max-turns "$MAX_TURNS" \
    --output-format=stream-json \
    --allowedTools 'Read,Write,Edit,Bash,Glob,Grep,NotebookEdit,WebFetch,WebSearch,mcp__supabase__*,mcp__playwright__*,mcp__context7__*' \
    | ./ralph-filter.sh \
    | tee -a "$LOGFILE" \
    | while IFS= read -r line; do
        echo "$line"
        if [[ "$line" == *"ALL_TASKS_COMPLETE"* ]]; then
          touch "$DONE_FLAG"
        fi
        if [[ "$line" == *"BLOCKED:"* ]]; then
          touch "$BLOCKED_FLAG"
        fi
      done

  # Check completion
  if [[ -f "$DONE_FLAG" ]]; then
    echo "" | tee -a "$LOGFILE"
    echo "=== ALL TASKS COMPLETE — Ralph loop finished ===" | tee -a "$LOGFILE"
    break
  fi

  # Check blocked
  if [[ -f "$BLOCKED_FLAG" ]]; then
    echo "" | tee -a "$LOGFILE"
    echo "=== BLOCKED — Ralph needs human help ===" | tee -a "$LOGFILE"
    if [[ -f "BLOCKER.md" ]]; then
      echo "Reason:" | tee -a "$LOGFILE"
      cat BLOCKER.md | tee -a "$LOGFILE"
    fi
    break
  fi

  echo "--- Restarting in ${COOLDOWN}s ---" | tee -a "$LOGFILE"
  sleep "$COOLDOWN"
done
