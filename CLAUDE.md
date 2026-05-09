# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Atlas.io is a GeoGuessr-style history game where players guess both the location and time period from panoramic scenes. Built with Next.js 16 (React 19), it supports solo and multiplayer modes.

## Development Commands

```bash
pnpm dev              # Start both Next.js (port 3000) and Socket.IO server (port 3001)
pnpm dev:client       # Start only the Next.js frontend
pnpm dev:server       # Start only the Socket.IO server
pnpm build            # Production build (Next.js)
pnpm lint             # ESLint
```

The dev server uses `concurrently` to run both processes. The Socket.IO server port is configurable via `SOCKET_PORT` env var (default 3001).

## Architecture

**Single-page app** — all routing is state-driven in `app/page.tsx` via an `AppMode` state machine: `splash -> mode-select -> solo | multiplayer | leaderboard`.

**Two runtime processes:**
- **Next.js frontend** (`app/`, `src/components/`) — React client components; no API routes
- **Socket.IO server** (`server/index.js`) — plain Node.js, manages multiplayer rooms, timer sync, and server-authoritative scoring

**Key architectural decisions:**
- Scoring logic is duplicated: `src/lib/scoring.ts` (client, TypeScript) and `server/index.js` (server, JavaScript). The server copy is authoritative for multiplayer. Changes to scoring formulas must be synced in both places.
- `PanoramaViewer` and `MultiplayerGame` are dynamically imported (`next/dynamic`, SSR disabled) because they depend on browser-only libraries (Pannellum, Socket.IO client).
- Pannellum (360 panorama viewer) and Leaflet (maps) are loaded via CDN in `app/layout.tsx`, not bundled.
- TypeScript build errors are ignored in `next.config.mjs` (`ignoreBuildErrors: true`).

**Data flow:**
- Round data lives in `src/data/rounds.ts` (client) and is duplicated in `server/index.js` (server) — these may differ
- Leaderboard persistence uses Supabase (`lib/supabase/client.ts`), requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars
- Socket client connection auto-detects the server URL from `window.location.hostname` on port 3001

**UI stack:** Tailwind CSS v4, shadcn/ui components (`components/ui/`), fonts are Brygada 1918 (serif/display) and Hanken Grotesk (sans).
