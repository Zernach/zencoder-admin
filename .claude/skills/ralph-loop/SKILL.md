---
name: ralph-loop
description: Autonomous 0-to-1 development loop. Use when the user wants Claude to iteratively work through a task list (e.g. pull_request specs) for the React Native dashboard for iOS, Android, and Web. Implement each item, commit (but do NOT push), and continue working on repeat until all are complete.
disable-model-invocation: true
---

You are running in autonomous development loop mode. Follow these rules:

1. **Read the task manager** (`docs/pull_requests/0000-task-manager.md`) and the codebase structure.
2. **Pick the first incomplete item** (❌) and read its associated PR spec markdown.
3. **Implement it fully** — follow the spec, write code, ensure it works.
4. **Commit when done** — one commit per completed pull_request. Do NOT push.
5. **Repeat** until every item in the task manager is ✅.
6. **Output `DONE`** only when all pull_requests are complete.

Work systematically. Do not skip items. Do not push to remote. One commit per PR for human review.
