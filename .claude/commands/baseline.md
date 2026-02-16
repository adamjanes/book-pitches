# Baseline — Generate OpenSpec baseline from existing codebase

Custom command (not part of OpenSpec). Scans the current project's codebase and generates:
- **`openspec/overview.md`** — project-level overview (architecture, tech stack, component map, data model)
- **`openspec/specs/<capability>/spec.md`** — per-capability baseline specs in OpenSpec format

The overview doubles as a client deliverable and project context. The specs integrate directly with OpenSpec's delta workflow (`/opsx:sync`, `/opsx:continue`, etc.).

## Output Structure

```
openspec/
  overview.md                          # Project-level overview document
  specs/
    <capability-1>/spec.md             # Per-capability baseline spec (OpenSpec format)
    <capability-2>/spec.md
    ...
  changes/                             # (pre-existing, untouched)
```

Two output types with a clear boundary:
- **`overview.md`** — summarizes the project (architecture, tech stack, component map, data model, gaps, decisions). No detailed requirements here.
- **`specs/<cap>/spec.md`** — detailed requirements with WHEN/THEN/AND scenarios. Standard OpenSpec format.

The overview's Section 3 (Capabilities) cross-references the spec files, creating the bridge.

## Process

### Phase 1: Codebase Analysis (6-Step Parallel Scan)

Launch 6 exploration agents simultaneously:

1. **Scan Project Structure** (`explore`)
   - Identify root directories (src/, lib/, app/, pages/, components/, etc.)
   - Detect package managers (package.json, requirements.txt, go.mod, Cargo.toml)
   - Find configuration files (next.config, tsconfig, tailwind, vite, eslint, etc.)
   - Locate test directories and test runner configs

2. **Extract Architecture** (`explore-medium`)
   - Folder structure patterns and layer identification (routes, controllers, services, models, pages, components)
   - Architecture style (SPA, SSR, API, monorepo, serverless, MVC, etc.)
   - Data flow between layers
   - Separation of concerns

3. **Identify Tech Stack** (`explore`)
   - Languages (by file extensions and configs)
   - Frameworks (from dependencies in package.json, etc.)
   - Databases (from connection strings, ORM configs, Supabase setup, migration files)
   - External services and APIs (from SDK imports, env vars, config files)

4. **Find Entry Points** (`explore-medium`)
   - Main files (index.ts, app.tsx, main.py)
   - Route definitions (Next.js pages/app, Express routes, API handlers)
   - Lambda/serverless functions
   - CLI entry points
   - Major UI pages and components

5. **Detect Existing Specs** (`explore`)
   - Check for existing spec files (.specs/, docs/, specifications/, openspec/specs/)
   - Look for README.md with requirements
   - Find ADRs (Architecture Decision Records)
   - Check for CLAUDE.md with project context
   - Note any existing documentation to avoid duplicating

6. **Identify Technical Debt** (`explore`)
   - TODO/FIXME/HACK/XXX comments in code files
   - Missing test coverage (untested files, empty test dirs)
   - Placeholder implementations (empty catch blocks, hardcoded values, stub functions)
   - Outdated dependencies
   - Missing error handling

### Phase 2: Capability Grouping

After all 6 analysis steps complete:

1. **Existing files check** — If `openspec/specs/` already has spec files or `openspec/overview.md` exists, warn the user and ask whether to overwrite or merge with existing content.

2. **Synthesize findings** into capability domains
   - Group related routes, components, data models, and logic into cohesive capabilities
   - Examples: "book-browsing", "user-authentication", "search-filtering", "data-seeding"
   - Aim for 3-12 capabilities per project (adjust for project size)

3. **Present capability map AND full file preview to user**
   ```
   === DISCOVERED CAPABILITIES ===

   1. book-browsing
      - Routes: /books, /books/[slug]
      - Components: BookCard, BookList, BookDetail
      - Data: books table, reviews table
      - Entry points: src/app/books/page.tsx

   2. search-filtering
      - Routes: /categories/[slug]
      - Components: SearchBar, CategoryFilter
      - Logic: search utilities, tag mapping

   3. ...

   Architecture: Next.js App Router (SSR)
   Tech Stack: TypeScript, React, Tailwind, Supabase
   Technical Debt: 5 items found
   Existing Docs: CLAUDE.md (project context), README.md

   === FILES TO GENERATE ===

   openspec/overview.md                         (project overview — 8 sections)
   openspec/specs/book-browsing/spec.md          (capability spec)
   openspec/specs/search-filtering/spec.md       (capability spec)
   openspec/specs/.../spec.md                    (capability spec)

   Total: 1 overview + [N] capability specs

   Proceed? [y/n] or adjust groupings?
   ```

4. **Ask user to confirm/adjust** capability groupings before generating ANY files
   - Allow merging/splitting capabilities
   - Allow renaming
   - Allow excluding capabilities from baseline

### Phase 3: Overview Generation

Write `openspec/overview.md` using Phase 1 findings. Single synthesis task producing all 8 sections:

```markdown
# <Project Name> — Project Overview

> **Generated:** <date>
> **Method:** /baseline brownfield analysis
> **Capabilities:** <N> (see openspec/specs/)

---

## 1. Purpose
Problem statement, core promise, design philosophy.

## 2. Architecture
### System Overview
(ASCII diagram — boxes and arrows showing layers, external services)

### Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|

### Directory Structure
(Annotated file tree — major directories only, not every file)

## 3. Capabilities
| Capability | Spec | Reqs | Description |
|------------|------|------|-------------|
| Book Browsing | [spec](specs/book-browsing/spec.md) | 12 | Browse and view books... |
| Search & Filtering | [spec](specs/search-filtering/spec.md) | 8 | Search by title/author... |

(Every row MUST have a corresponding spec file. Every spec file MUST have a row here.)

## 4. Data Model
(TypeScript interfaces or SQL schema — extracted from actual code, not invented)

## 5. Component Map
### Routes
| Route | Component | Purpose |
### API Endpoints
| Method | Endpoint | Purpose |
### Core Libraries
| Module | Purpose |

## 6. External Dependencies & Configuration
### Services
| Service | Purpose | Auth |
### Environment Variables
| Variable | Required | Purpose |

## 7. Known Gaps & Blockers
### Blockers
| Priority | Blocker | Impact |
### Quality Gaps
| Gap | Severity |
### Pending Decisions
(Bullet list)

## 8. Development
### Commands
(bash code block — dev, build, test, lint, etc.)
### Decision Log
| Date | Decision | Rationale |
```

**Overview rules:**
- Client-report quality — clean enough for a non-technical stakeholder
- ASCII diagrams for architecture (no mermaid/plantuml — must render everywhere)
- Evidence-based only — every fact must come from code analysis, not speculation
- Section 3 (Capabilities) MUST cross-reference the spec files generated in Phase 4

### Phase 4: Spec Generation

For each confirmed capability, generate `openspec/specs/<capability>/spec.md` using OpenSpec's native format. Run in parallel — one agent per capability.

```markdown
# <Capability Name>

## Purpose
<2-3 sentence description of what this capability does, based on discovered implementation>

## Requirements

### Requirement: R-DOMAIN-01 - <Name>
The system SHALL...

#### Scenario: <scenario name>
- **WHEN** <trigger condition from routes/components>
- **THEN** <expected outcome from implementation logic>
- **AND** <additional outcome if relevant>

### Requirement: R-DOMAIN-02 - <Name>
...

## Known Gaps

### Gap: <Name>
**Description:** <what's missing>
**Impact:** <what this affects>
**Suggested Resolution:** <how to fix>
```

**Requirement extraction rules:**
- Extract 5-15 requirements per capability (focus on core behaviors)
- Use `R-DOMAIN-NN` IDs (e.g., R-BROWSE-01, R-SEARCH-03)
- Derive requirements from actual code — what does the implementation DO?
- Derive scenarios from routes, API endpoints, component behavior, and business logic
- Only document what EXISTS in the codebase — never speculate on unbuilt features
- Match OpenSpec's native format: `### Requirement:` headings, `#### Scenario:` with WHEN/THEN/AND

**Known Gaps rules:**
- Include TODO/FIXME/HACK comments as gaps
- Identify missing test coverage
- Flag placeholder implementations
- Suggest concrete resolutions
- ONLY include this section if gaps actually exist

### Phase 5: Suggested Changes

After generating all specs, analyze gaps and project context to suggest concrete next changes:

1. **Gather context:**
   - All Known Gaps from generated specs
   - All Known Gaps & Blockers from overview (Section 7)
   - Project CLAUDE.md (priorities, V1 scope, future plans)
   - Existing change proposals in `openspec/changes/` (avoid duplicates)
   - Technical debt found during scanning

2. **Generate suggested changes** — prioritized list of 3-8 concrete changes:
   ```
   === SUGGESTED NEXT CHANGES ===

   Priority | Change Name          | Why                                    | Scope
   ---------|----------------------|----------------------------------------|--------
   HIGH     | fix-error-handling   | 3 gaps: missing catch blocks           | 4 files
   HIGH     | add-test-coverage    | No tests for core logic                | 8 files
   MEDIUM   | improve-search       | Search lacks fuzzy matching            | 2 files
   LOW      | cleanup-tech-debt    | 12 TODO comments across codebase       | scattered

   Create any of these with: /opsx:new <change-name>
   ```

3. **Prioritization criteria:**
   - HIGH: Gaps that block functionality or cause errors
   - MEDIUM: Missing features mentioned in CLAUDE.md scope
   - LOW: Tech debt, code quality, nice-to-haves

4. **Do NOT auto-create changes** — just suggest. User decides which to pursue.

### Phase 6: Summary

After generating all specs and suggestions:

```
=== BASELINE COMPLETE ===

Overview: openspec/overview.md (<N> lines)

Capabilities:
  <capability-1>/spec.md  — <N> requirements, <N> gaps
  <capability-2>/spec.md  — <N> requirements, <N> gaps
  ...

Totals: <N> requirements, <N> gaps, <N> suggested changes

Next steps:
  1. Review openspec/overview.md for accuracy
  2. Review each spec file — adjust requirements as needed
  3. Run `openspec validate` to check spec format
  4. Pick a suggested change and run `/opsx:new <name>` to start
```

## Critical Rules

- **Two outputs, one truth** — overview summarizes, specs detail. Requirements live ONLY in spec files.
- **Cross-reference integrity** — every capability in overview Section 3 must have a matching spec file, and vice versa.
- **6-step scan** — follow all 6 analysis steps in Phase 1. Don't skip or merge them.
- **Parallelism** — launch all 6 agents simultaneously in Phase 1. Spec generation in Phase 4 is also parallel.
- **User confirmation** — NEVER write any files without user approval of capability groupings in Phase 2.
- **Existing files check** — if `openspec/specs/` or `openspec/overview.md` already exist, warn and ask overwrite/merge.
- **Evidence-based only** — only document what exists in code. No speculation.
- **Client-report quality** — overview must be clean enough for a non-technical stakeholder.
- **Read-only** — don't modify any existing project files. Only create new files under `openspec/`.
- **OpenSpec format** — use OpenSpec's native requirement/scenario structure (not EARS).
- **Tight focus** — 5-15 requirements per capability. Scannable, not exhaustive.

## Notes

- This is a **custom command** (`/baseline`) — not part of OpenSpec. It bootstraps OpenSpec adoption for brownfield projects.
- The 6-step scanning process is adapted from Living Spec's proven brownfield reverse engineering workflow.
- Output format is OpenSpec-native so specs integrate directly with `/opsx:sync`, `/opsx:continue`, etc.
- After baseline generation, specs evolve through OpenSpec's delta workflow as changes are implemented.
