---
name: Always checkpoint commits
description: User wants frequent git commits as checkpoints because tmux/server may crash due to low RAM
type: feedback
---

Always commit progress as checkpoints after completing work on each page/section.

**Why:** Server has only 1.9GB RAM, tmux sessions get killed by OOM killer, losing uncommitted work.

**How to apply:** After finishing review+fix for each portal or major section, immediately `git add` and `git commit` the changes. Don't batch too many changes before committing.
