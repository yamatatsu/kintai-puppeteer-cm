# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This project automates attendance recording (勤怠打刻) on the King of Time (KingOfTime) service using Puppeteer. It has two commands — `syukkin` (clock-in) and `taikin` (clock-out) — which log in, optionally perform the stamp, retrieve timecard data, and post a summary notification to a webhook URL.

## Commands

```bash
# Dry-run (no actual stamp): pnpm scripts
pnpm syukkin   # DRY_RUN=true
pnpm taikin    # DRY_RUN=true

# Actual execution via bin scripts (fetches credentials from 1Password)
./bin/syukkin
./bin/taikin
```

TypeScript is executed directly via `esbuild-register` (no build step needed).

## Architecture

- **`src/KingOfTime.ts`** — Core Puppeteer wrapper class. Handles login (including 2FA TOTP), clock-in/out clicks, timecard scraping, and screenshots. All browser interactions live here.
- **`src/useKingOfTime.ts`** — Browser lifecycle helper. Launches Puppeteer, wraps the callback, captures an error screenshot on failure, then closes the browser.
- **`src/syukkin.ts` / `src/taikin.ts`** — Entry points. Accept `[id, pw, totp]` as a JSON array via `process.argv[2]`, call `useKingOfTime`, and post a Slack-formatted notification.
- **`src/lib.ts`** — Shared utilities: `calcOver` (overtime minutes), `notify` (webhook POST), `format` (text cleanup), `clearCapsDir` (screenshot dir reset).
- **`src/env.ts`** — Reads and validates env vars (`ID`, `PW`, `NOTIFY_URL`, `DRY_RUN`).
- **`bin/syukkin` / `bin/taikin`** — Bash wrappers that pull credentials from 1Password (`op item get`) and pass them as a JSON array to the TypeScript entry points.
- **`caps/`** — Screenshot output directory (cleared on each run). Numbered screenshots are saved at each step for debugging.

## Environment Variables

Loaded via `dotenv` from `.env`:

| Variable     | Description                        |
|--------------|------------------------------------|
| `ID`         | KingOfTime login ID                |
| `PW`         | KingOfTime password                |
| `NOTIFY_URL` | Slack incoming webhook URL         |
| `DRY_RUN`    | Set to `"true"` to skip the stamp  |

The `bin/` scripts bypass `.env` and fetch credentials directly from 1Password at runtime.
