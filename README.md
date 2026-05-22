# DevBrain

A small persistent notes app: create, search, pin, tag, edit, and archive notes. Data is stored in a local SQLite database and survives restarts.

## Prerequisites

- **Node.js 20+** ([nodejs.org](https://nodejs.org))
- **npm** (included with Node)

## Run on a fresh machine

From the repository root:

```bash
npm install
npm run setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

`npm run setup` generates the Prisma client and applies the SQLite migration (creates `prisma/dev.db` on first run).

## Persistence check

1. Create a few notes (use **New note**).
2. Stop the dev server (`Ctrl+C`).
3. Run `npm run dev` again.
4. Your notes should still appear.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run setup` | Generate Prisma client + apply migrations |
| `npm run build` | Production build |
| `npm run start` | Run production server (after `build`) |
| `npm run lint` | ESLint |

## Stack

- **Next.js** (App Router) — UI and API routes
- **Prisma** + **SQLite** — local file persistence (`prisma/dev.db`)
- **TypeScript**, **Tailwind CSS**, **Zod** — types, styling, validation

See [ANSWERS.md](./ANSWERS.md) for design choices, edge cases, and assessment responses.
