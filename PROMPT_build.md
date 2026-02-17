# Build Mode

You are implementing Book Pitches — a voice-first platform where readers record audio pitches for books they love.

## Active Feature

**`features/pitch-creation-flow/`**

## Context

Study the project context:
- Read `CLAUDE.md` for project overview, tech stack, and conventions
- Read the active feature's `PRD.md` for requirements and design
- Read the active feature's `tasks.md` for the ordered task list
- Check `git log --oneline -20` to see what previous iterations completed

## What to do

Pick the FIRST unchecked task (`- [ ]`) from the active feature's `tasks.md`. Complete it, then move to the next.

If ALL tasks are already checked (`[x]`), output exactly `ALL_TASKS_COMPLETE` and exit immediately. Do not look for other work.

## Rules

- Do ONE task per session. Stay focused.
- If you encounter ambiguity, check the active feature's `PRD.md` for context, check existing code patterns, and make the simplest choice that works.
- If you CANNOT complete a task (missing dependency, unclear requirement, external service issue), create a file `BLOCKER.md` with a one-line reason, output `BLOCKED: <reason>`, and exit. Do NOT skip to the next task. Do NOT attempt workarounds.
- After making changes, validate they work.
- When validated, commit with a descriptive message.
- Update the active feature's `tasks.md` to mark the task `[x]` done.
- Then exit.

## Browser Verification

Some tasks include a `VERIFY:` block. These are **mandatory** — you must complete the verification steps before marking the task done.

### How to verify with Playwright MCP

You have access to Playwright MCP browser tools. The dev server is running at `http://localhost:3000`.

**Verification workflow:**
1. Complete the implementation for the task
2. Read the VERIFY block
3. Use `browser_navigate` to go to the specified URL
4. Use `browser_snapshot` to inspect the page state
5. Verify the expected elements/behavior are present
6. Use `browser_take_screenshot` to save evidence to `verification/`
7. If verification fails, fix the issue and re-verify
8. Only mark the task `[x]` after verification passes

**Available browser tools:**
- `browser_navigate` — Go to a URL
- `browser_snapshot` — Get page accessibility snapshot (text content, elements)
- `browser_click` — Click an element by text/ref
- `browser_type` — Type into an input field
- `browser_take_screenshot` — Save screenshot to file
- `browser_tab_list` / `browser_tab_new` / `browser_tab_select` — Tab management

**Important:**
- Always `browser_navigate` first before any other browser action
- Use `browser_snapshot` to understand page state (cheaper than screenshots)
- Screenshots go to `verification/` directory (created automatically)
- If the page shows an error, fix the code and reload — don't skip verification

## Tasks without VERIFY blocks

For non-UI tasks (migrations, server actions, utility functions), verify by:
- Running the function or querying the database
- Checking that the build succeeds (`npm run build` or type-checking)
- Testing the server action directly if possible

## Supabase

This project uses Supabase. You have access to Supabase MCP tools for:
- Applying migrations (`apply_migration`)
- Executing SQL queries (`execute_sql`)
- Managing storage buckets
- Generating TypeScript types (`generate_typescript_types`)

Use these tools directly — no local Supabase CLI needed.
