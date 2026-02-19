# CLAUDE.md — Project Context for Claude Code

## Project Overview
ZoeFitnessPortal is a full-stack fitness platform built with:
- **Backend**: Express.js + TypeScript (`server/index.ts` entrypoint)
- **Frontend**: React + Vite (`client/` directory)
- **Database**: PostgreSQL with Drizzle ORM
- **Sessions**: `connect-pg-simple` for session storage
- **Dev runtime**: `tsx` (TypeScript execution via `npm run dev`)

## Development Setup
- `npm run dev` → runs `NODE_ENV=development tsx server/index.ts`
- Server binds to port 5000 by default (configurable via `PORT` env var)
- Vite HMR is attached to the HTTP server in dev mode (`server/vite.ts`)
- Session store requires `DATABASE_URL` env var pointing to PostgreSQL

## Known Issues & Fixes

### ENOTSUP on server.listen() — macOS + Node.js v22 (Feb 2025)
**Symptom**: `Error: listen ENOTSUP: operation not supported on socket 0.0.0.0:5000`
**Root cause**: Binding to `0.0.0.0` fails on macOS (darwin arm64) with Node.js v22 when the full app stack is running (Express + session store + Vite HMR). The issue does NOT reproduce in isolation — plain HTTP servers, Express alone, and Vite alone all work fine with `0.0.0.0`.
**Fix**: Changed `server.listen()` host from `"0.0.0.0"` to `"localhost"` in `server/index.ts`.
**Impact**: `localhost` only listens on loopback (127.0.0.1) vs all interfaces. Fine for local dev; production (Replit) uses its own port/host config.

### Debugging server listen failures
Run the diagnostic script: `npx tsx scripts/debug-server-listen.ts`
This tests server.listen() in progressive layers (plain HTTP → Express → Vite → full app → session store) to isolate which layer is causing the failure. See the script for details.

## Architecture Notes
- `server/index.ts` — App entrypoint: sets up Express, session middleware, registers routes, starts Vite (dev) or static serving (prod), then listens
- `server/routes.ts` — All API routes, creates HTTP server via `http.createServer(app)`
- `server/vite.ts` — Vite dev server setup with HMR piped through the HTTP server (`hmr: { server }`)
- `server/schedulers/` — Background tasks (WhatsApp reminders, inactivity emails, campaigns) started after server listen
- `vite.config.ts` — Includes Replit-specific plugins (cartographer) that only load when `REPL_ID` is set
