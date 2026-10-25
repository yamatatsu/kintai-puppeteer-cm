# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This project automates attendance recording (勤怠打刻) on the King of Time (KingOfTime) service using Puppeteer. It has two commands — `syukkin` (clock-in) and `taikin` (clock-out) — which log in, optionally perform the stamp, retrieve timecard data, and post a summary notification to a webhook URL.

## Runtime

The project runs on Node.js with pnpm. Both versions are pinned in `package.json#devEngines` (`runtime` / `packageManager`) and managed by [Vite+](https://viteplus.dev/guide/env) (`vp env pin <node-version> pnpm@<version>` to change them). TypeScript is executed directly by Node's built-in type stripping (no build step needed), so only erasable TypeScript syntax is allowed (no enums, namespaces, or constructor parameter properties) and relative imports must include the `.ts` extension.

## Commands

```bash
pnpm install

# Dry-run (no actual stamp)
pnpm syukkin   # DRY_RUN=true
pnpm taikin    # DRY_RUN=true

# Actual execution
./bin/syukkin
./bin/taikin

# Lint / format / typecheck (Biome + tsc)
pnpm check
```

## Architecture

- **`src/KingOfTime.ts`** — Core Puppeteer wrapper class. Handles login (including 2FA TOTP), clock-in/out clicks, timecard scraping, and screenshots. All browser interactions live here.
- **`src/useKingOfTime.ts`** — Browser lifecycle helper. Launches Puppeteer, wraps the callback, captures an error screenshot on failure, then closes the browser.
- **`src/syukkin.ts` / `src/taikin.ts`** — Entry points. Read env vars, fetch credentials from 1Password, call `useKingOfTime`, and post a Slack-formatted notification.
- **`src/getCredentials.ts`** — Fetches ID / password / TOTP from 1Password via `op item get <OP_ITEM_ID>`.
- **`src/lib.ts`** — Shared utilities: `calcOver` (overtime minutes), `notify` (webhook POST), `format` (text cleanup), `clearCapsDir` (screenshot dir reset).
- **`src/env.ts`** — Reads and validates env vars (`OP_ITEM_ID`, `NOTIFY_URL`, `DRY_RUN`).
- **`bin/syukkin` / `bin/taikin`** — Bash wrappers that `cd` to the repo root and run `bin/*.ts` (Node shebang scripts that load `.env` and import the entry points).
- **`caps/`** — Screenshot output directory (cleared on each run). Numbered screenshots are saved at each step for debugging.

## Environment Variables

Loaded from `.env` via Node's `--env-file-if-exists` (see `.env.example`):

| Variable     | Description                                  |
|--------------|----------------------------------------------|
| `OP_ITEM_ID` | 1Password item ID holding KingOfTime credentials |
| `NOTIFY_URL` | Slack incoming webhook URL                   |
| `DRY_RUN`    | Set to `"true"` to skip the stamp            |

The 1Password CLI (`op`) must be installed and signed in.
