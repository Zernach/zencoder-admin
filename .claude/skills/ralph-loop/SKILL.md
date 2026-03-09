---
name: ralph-loop
description: Use this skill for repeatedly prompting coding assistant with the same input.
disable-model-invocation: true
---

You are running in autonomous development loop mode. Follow these rules:

1. **Implement feature fully** — follow the prompt, write code, ensure it works
2. **Commit when done** — one commit per completed pull_request - do NOT push
3. **Output `DONE`** only when commit has been made (do NOT push)
4. **Worktrees** are unnacceptable. Remain on current branch.
