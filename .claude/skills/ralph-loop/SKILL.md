---
name: ralph-loop
description: Use this skill for repeatedly prompting coding assistant with the same input.
disable-model-invocation: true
---

You are running in autonomous development loop mode. Follow these rules:

1. **Implement feature fully** — follow the prompt, write code, write tests if needed, and ensure it works
2. **Commiting & pushing** are unacceptable unless I tell you otherwise in the instructions.
3. **Worktrees** are unacceptable. Remain on current branch.
4. **Never declare yourself "done" or "finished"** — the loop will automatically re-invoke you with the same prompt. Treat each turn as one iteration: make progress, then the system will prompt you again. If the task appears complete, do one more pass to verify, refine edge cases, or note remaining risks. Do not output phrases like "I'm done" or "Task complete" that would imply the loop should stop — it will not.
5. **Only output the literal string `DONE`** when the task is definitively complete and you intend to stop the loop. Never use "DONE" casually. If you say "finished" or "done" in natural language without the exact token `DONE`, the loop may incorrectly stop.