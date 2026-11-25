# Contributing to Gloss

Thanks for helping. Gloss is a small Next.js app with no accounts, no database and no server-side keys, and changes should keep it that way.

## Setup

1. Node.js 20.19 or later (CI uses 22). Older versions cannot load the article importer's ESM-only dependencies.
2. `npm install`
3. `npm run dev` and open http://localhost:3100.
4. Paste your [Fortytwo API key](https://platform.fortytwo.network) from the key button in the top bar. Exa and LlamaParse keys are optional.

No `.env` file is needed for development.

## Before opening a pull request

- `npm run lint` (TypeScript, `tsc --noEmit`) and `npm run build` must pass. CI runs both.
- Read the relevant guide in `node_modules/next/dist/docs/` before changing Next.js code: this is Next.js 16 and its APIs differ from older versions (see `AGENTS.md`).
- Keep pull requests focused, and describe what changed and how you tested it. Screenshots help for UI changes.

## Ground rules

- **Keys stay in the browser.** API routes receive the reader's key with each request (`keyFrom()` in `lib/fortytwo.ts`) and must never store, log or fall back to a server-side key.
- **No tracking.** No analytics, telemetry or third-party scripts that report usage.
- **Text-only models.** Gloss uses text-output models on Fortytwo; image-to-text is fine for reading scanned PDF pages.
- **The library is local.** Articles, highlights and notes live in IndexedDB/localStorage (`lib/store.ts`).

## Project layout

| Path | What lives there |
|---|---|
| `app/` | Pages and API routes (`app/api/*`: ask, brief, shelve, import, PDF pages, key check) |
| `components/` | Reader, library, landing and shared UI |
| `lib/` | Provider clients (`fortytwo.ts`, `search.ts`, `llamaparse.ts`), prompts, article import, PDF parsing, the local store |
| `content/` | The bundled sample texts |
| `scripts/` | The telemetry-free Next.js launcher (`next.mjs`) and evaluation scripts |
