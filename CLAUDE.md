# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This project automates attendance recording (勤怠打刻) on the King of Time (KingOfTime) service using Puppeteer. It has two commands — `syukkin` (clock-in) and `taikin` (clock-out) — which log in, optionally perform the stamp, retrieve timecard data, and post a summary notification to a webhook URL.

## Runtime

The project runs on [Bun](https://bun.sh). The Bun version is pinned in `package.json#devEngines.packageManager` and managed by [Vite+](https://viteplus.dev/guide/env) (`vp env pin bun@<version>` to change it). TypeScript is executed directly by Bun (no build step needed).

## Commands

```bash
bun install

# Dry-run (no actual stamp)
bun run syukkin   # DRY_RUN=true
bun run taikin    # DRY_RUN=true

# Actual execution
./bin/syukkin
./bin/taikin

# Lint / format / typecheck (Biome + tsc)
bun run check
```

## Architecture

- **`src/KingOfTime.ts`** — Core Puppeteer wrapper class. Handles login (including 2FA TOTP), clock-in/out clicks, timecard scraping, and screenshots. All browser interactions live here.
- **`src/useKingOfTime.ts`** — Browser lifecycle helper. Launches Puppeteer, wraps the callback, captures an error screenshot on failure, then closes the browser.
- **`src/syukkin.ts` / `src/taikin.ts`** — Entry points. Read env vars, fetch credentials from 1Password, call `useKingOfTime`, and post a Slack-formatted notification.
- **`src/getCredentials.ts`** — Fetches ID / password / TOTP from 1Password via `op item get <OP_ITEM_ID>`.
- **`src/lib.ts`** — Shared utilities: `calcOver` (overtime minutes), `notify` (webhook POST), `format` (text cleanup), `clearCapsDir` (screenshot dir reset).
- **`src/env.ts`** — Reads and validates env vars (`OP_ITEM_ID`, `NOTIFY_URL`, `DRY_RUN`).
- **`bin/syukkin` / `bin/taikin`** — Bash wrappers that `cd` to the repo root and run `bin/*.ts` (Bun shebang scripts that import the entry points).
- **`caps/`** — Screenshot output directory (cleared on each run). Numbered screenshots are saved at each step for debugging.

## Environment Variables

Loaded from `.env` (Bun loads it automatically; see `.env.example`):

| Variable     | Description                                  |
|--------------|----------------------------------------------|
| `OP_ITEM_ID` | 1Password item ID holding KingOfTime credentials |
| `NOTIFY_URL` | Slack incoming webhook URL                   |
| `DRY_RUN`    | Set to `"true"` to skip the stamp            |

The 1Password CLI (`op`) must be installed and signed in.
