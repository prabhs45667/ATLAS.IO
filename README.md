# Atlas.io

**Where in the world. When in time.**

A GeoGuessr-style history game. You're dropped into a 360° panorama of a historic moment — the sinking of the Titanic, the fall of the Berlin Wall, an Aztec market in Tenochtitlan — and you have to guess both *where* you are and *when* it happened.

23 hand-crafted scenes spanning from 117 AD to 2022.

## Game Modes

- **Solo** — 5 random rounds, 30 seconds each
- **Lightning** — same as solo, 10 seconds
- **Demo** — curated round order for showcasing
- **Multiplayer** — 2-6 players compete in real-time via room codes

## Scoring

Each round awards up to **6,000 points**:
- **Location** (max 5,000) — exponential decay based on haversine distance from the actual coordinates
- **Year** (max 1,000) — 20 points deducted per year off, floored at 0

Maximum possible score across 5 rounds: **30,000**.

## Running Locally

```bash
pnpm install
pnpm dev
```

This starts the Next.js frontend on port 3000 and the Socket.IO multiplayer server on port 3001 concurrently.

### Environment Variables

For leaderboard functionality, set:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

The game works without these — the leaderboard just won't persist.

## Tech Stack

- **Next.js 16** / React 19 — single-page app, all state-driven routing
- **Pannellum** — 360° panorama viewer (loaded via CDN)
- **Leaflet** — interactive map for placing guesses (loaded via CDN)
- **Socket.IO** — real-time multiplayer server (`server/index.js`)
- **Supabase** — leaderboard persistence
- **Tailwind CSS v4** — OKLCH color tokens, warm antiquarian dark theme
- **Three.js / React Three Fiber** — WebGL shader background on menu screens

## Architecture

The entire app is a single `page.tsx` that switches between screens via an `AppMode` state machine: `splash → mode-select → solo | multiplayer | leaderboard`.

Two processes run in development:
- **Next.js** serves the frontend (port 3000)
- **Node.js** runs the Socket.IO server for multiplayer (port 3001, configurable via `SOCKET_PORT`)

Scoring logic exists in two places — `src/lib/scoring.ts` (client) and `server/index.js` (server-authoritative for multiplayer). Changes to the scoring formula must be synced manually.

## The Rounds

| # | Location | Year | Event |
|---|----------|------|-------|
| 01 | Rome | 117 | Trajan's Market in Imperial Rome |
| 02 | Edo (Tokyo) | 1850 | Late Tokugawa shogunate merchant district |
| 03 | Waterloo | 1815 | Napoleon's final defeat |
| 04 | Washington D.C. | 2009 | Obama's inauguration |
| 05 | Lusail, Qatar | 2022 | FIFA World Cup Final |
| 06 | North Atlantic | 1912 | The Titanic |
| 07 | San Francisco | 2007 | Steve Jobs announces the iPhone |
| 08 | New York City | 2001 | World Trade Center before 9/11 |
| 09 | Berlin | 1989 | Fall of the Berlin Wall |
| 10 | Kennedy Space Center | 1969 | Apollo 11 launch |
| 11 | New Delhi | 1947 | Indian independence |
| 12 | Port Said, Egypt | 1869 | Suez Canal opening |
| 13 | London | 1851 | The Great Exhibition |
| 14 | Athens | 1896 | First modern Olympics |
| 15 | Mainz | 1455 | Gutenberg's printing press |
| 16 | Philadelphia | 1776 | American Declaration of Independence |
| 17 | Versailles | 1789 | Estates-General / French Revolution |
| 18 | Constantinople | 1566 | Ottoman Empire under Suleiman |
| 19 | Beijing | 1919 | May Fourth Movement |
| 20 | Mexico-Tenochtitlan | 1519 | Aztec market at Spanish arrival |
| 21 | Vienna | 1814 | Congress of Vienna |
| 22 | Cape Town | 1652 | First Dutch settlement |
| 23 | Manchester | 1830 | First passenger railway |

## Why We Built This

Humans don't learn from history. This game is a closed loop to help people step into the world of our past and not make the same mistakes again.
