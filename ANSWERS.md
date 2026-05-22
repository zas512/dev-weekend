# Assessment answers — Persistent mini-app

## 1. How to run

**Prerequisites:** Node.js 20+ and npm.

```bash
npm install
npm run setup
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

- `npm install` installs dependencies and runs `prisma generate` (via `postinstall`).
- `npm run setup` applies the committed SQLite migration and creates `prisma/dev.db` if it does not exist.
- `npm run dev` starts the Next.js development server.

**Persistence check:** Create notes, stop the server (`Ctrl+C`), run `npm run dev` again — notes remain in `prisma/dev.db`.

---

## 2. Stack choice

**Chosen:** Next.js (App Router) + React + Prisma + SQLite + TypeScript.

- **Next.js** gives a single repo with both UI and REST-style API routes, so reviewers can click through CRUD without extra tooling.
- **SQLite + Prisma** keeps persistence local and zero-config: one file (`prisma/dev.db`), migrations in git, no cloud DB or API keys on a fresh machine.
- **TypeScript + Zod** catch invalid input at compile time and at the API boundary.

**Worse choice:** A **JSON file** as the only store. It works for a toy demo but lacks schema, migrations, indexed queries, and safe concurrent writes. Tag filtering and search would mean loading and scanning the whole file on every request. **A hosted Postgres/Firebase DB** would also be worse here: extra signup, env vars, and network dependency for an assessment that must run offline on a clean laptop.

---

## 3. One real edge case

**Case:** Tag filter must not match substrings inside other tag names (e.g. filtering `work` must not match a note tagged only `homework`).

**Handling:** Tags are stored in a delimiter wrapped string (`,work,home,`) and filters use `contains: ",${tag},"` so only whole tags match.

**Location:** `src/server/services/notes.service.ts` - `encodeTags` / `decodeTags` and tag filter in `listNotes`.

**Without this:** A naive `contains: "work"` query on a flat string like `work,home` or `homework` would return false positives. Users would see unrelated notes when clicking a tag chip.

---

## 4. AI usage

| Tool | What I asked | What it gave | What I changed |
|------|----------------|--------------|----------------|
| **Cursor (Agent)** | Verify whether the repo meets the assessment checklist | Gap analysis: missing `ANSWERS.md`, boilerplate README, no Prisma setup docs | Used as a todo list only; no code changes in that pass |
| **Cursor (Agent)** | Complete the submission (README, ANSWERS, setup scripts) | Draft README, `ANSWERS.md`, `package.json` scripts (`setup`, `postinstall`) | Tightened run steps to three commands; picked the tag-encoding edge case with exact file/line refs; wrote honest gaps instead of generic praise |
| **Cursor (Agent)** | Used during UI/API work | Component scaffolding, API route patterns | Reviewed generated UI for consistency with existing shadcn patterns; adjusted validation and error handling in services rather than trusting defaults |

**Example of a deliberate change:** AI often suggests `npm run dev` alone for Next.js apps. That fails on a fresh clone without a generated Prisma client and migrated DB. I added `npm run setup` and `postinstall: prisma generate` so the documented flow matches what actually works.

---

## 5. Honest gap

**Gap:** Delete is **archive-only** — there is no permanent delete or “restore from archive” in the UI. Archived notes stay in SQLite forever.

**Fix with another day:** Add `restore` (PATCH `archived: false`) and optional hard delete with confirmation; add a few API/integration tests around tag encoding and archived-note update rules (`Cannot update archived note`).

---

## Beyond basic CRUD (feature defense)

**Feature:** **Search + tags + pin + archive** as a lightweight knowledge workflow.

- **Search** (debounced) across title and content — faster than scrolling as the vault grows.
- **Tags** with one-click filter chips — groups related notes without folders.
- **Pin** keeps important notes at the top (`orderBy: pinned desc`).
- **Archive** (soft delete) hides clutter without losing data — matches how people actually use notes apps.

Plain CRUD demos force you to scroll every note every time; these features make the app usable after the tenth note, which is why they are included together rather than as a single checkbox feature.
