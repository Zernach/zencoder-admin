#!/usr/bin/env zsh
# ralph_options.sh — Ralph loop prompts selectable via -p/--prompt integer flag
# Run: ./ralph_options.sh -p 3  OR  ./ralph_options.sh --prompt 1
# Requires: claude CLI and /ralph-loop extension

set -e

# Resolve project root (parent of docs/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Parse -p/--prompt flag (default: 1)
PROMPT_ID=1
while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--prompt)
      PROMPT_ID="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# Ralph prompt definitions by ID (loaded from docs/ralph/loops/<id>.txt)
get_ralph_prompt() {
  local loop_file="$SCRIPT_DIR/loops/$1.txt"
  if [[ ! -f "$loop_file" ]]; then
    local max_id=$(($(find "$SCRIPT_DIR/loops" -maxdepth 1 -name '*.txt' 2>/dev/null | wc -l)))
    echo "Unknown prompt ID: $1. Valid IDs: 1–$max_id" >&2
    exit 1
  fi
  cat "$loop_file"
}

RALPH_PROMPT=$(get_ralph_prompt "$PROMPT_ID")
echo "Using prompt $PROMPT_ID: ${RALPH_PROMPT:0:60}..."
echo "Loop mode: will re-run after each completion. Ctrl+C to stop."
echo ""

iteration=0
while true; do
  iteration=$((iteration + 1))
  start_time=$(date +%s)
  echo "=== Iteration $iteration @ $(date) ==="
  claude --dangerously-skip-permissions "/ralph-loop $RALPH_PROMPT" || true
  end_time=$(date +%s)
  elapsed=$((end_time - start_time))
  elapsed_m=$((elapsed / 60))
  elapsed_s=$((elapsed % 60))
  echo ""
  echo "--- Iteration $iteration completed: ${elapsed_m}m ${elapsed_s}s ---"
  echo "Re-running in 3 seconds... (Ctrl+C to stop)"
  sleep 3
done
