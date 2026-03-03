#!/usr/bin/env zsh
# ralph.sh — Autonomous 0-to-1 development loop for Zencoder Analytics Dashboard
# Run: sh ralph.sh  OR  zsh ralph.sh  OR  ./ralph.sh
# Requires: claude CLI and /ralph-loop extension

set -e

# Resolve project root (parent of docs/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# 1. Task Manager Loop
RALPH_PROMPT='Read the `docs/pull_requests/0000-task-manager.md` file and the current directory structure of the React Native codebase, then decide which is the first incomplete pull_request, read its associated markdown plan, and begin working on it. After you complete a pull_request in its entirety, you may commit, but do NOT push to the remote repository. I want to review one commit for each pull_request. Only output `DONE` after all pull_requests in the `0000-task-manager.md` file are ✅'

# 2. Simulated Data Improvements Loop
# RALPH_PROMPT='Continue improving the stubbed data implementation. We need the user to feel like they are viewing 90 days of simulated dashboard data for the Zencoder Admin Dashboard. This should include for the data tables, charts, and filters to be fully functional and realistic.'

start_time=$(date +%s)

claude --dangerously-skip-permissions "/ralph-loop $RALPH_PROMPT"

end_time=$(date +%s)
elapsed=$((end_time - start_time))
elapsed_m=$((elapsed / 60))
elapsed_s=$((elapsed % 60))
echo ""
echo "---"
echo "Completed at: $(date)"
echo "Time elapsed: ${elapsed_m}m ${elapsed_s}s"
