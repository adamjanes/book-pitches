# Build Mode

You are implementing Book Pitches — a voice-first platform for audio book pitches.

## Context

Study the project context:
- Read openspec/changes/open-library-search/tasks.md for the current task list
- Read openspec/changes/open-library-search/design.md for technical decisions
- Read openspec/changes/open-library-search/specs/ for requirements (book-search, book-import, book-deduplication, search-debouncing)
- Read /Users/adamjanes/code/projects/book-pitches/CLAUDE.md for V1 scope
- Check git log --oneline -20 to see what previous iterations completed

## What to do

Pick the FIRST unchecked task (`- [ ]`) from tasks.md. Complete it, then move to the next.

If ALL tasks are already checked (`[x]`), output exactly `ALL_TASKS_COMPLETE` and exit immediately. Do not look for other work.

## Rules

- Do ONE task per session. Stay focused.
- If you encounter ambiguity, check openspec/changes/open-library-search/ for the relevant specs and design docs, check existing code patterns, and make the simplest choice that works.
- This project uses Supabase. You have access to Supabase MCP tools for applying migrations, creating storage buckets, executing SQL, and generating types.
- After making changes, validate they work (run tests, build, or query the database).
- When validated, commit with a descriptive message.
- Update openspec/changes/open-library-search/tasks.md to mark the task `[x]` done.
- Then exit.
