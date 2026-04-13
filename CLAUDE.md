# IIG BSCPLC NOC Dashboard

Real-time Network Operations Center dashboard for IIG BSCPLC. Next.js 14 App Router consuming live Firebase RTDB via REST SSE (no SDK, no auth). Deployed to Vercel.

## Commands

```bash
npm run dev        # Dev server → http://localhost:3000
npm run build      # Production build (must pass before deploy)
npm test           # Jest — runs link-parser + firebase-rest suites
npm test -- --watch  # Watch mode
npx vercel         # Preview deploy
npx vercel --prod  # Production deploy
```

## Firebase

- **URL:** `https://cactibscplc-default-rtdb.asia-southeast1.firebasedatabase.app/`
- **Region:** asia-southeast1 (Singapore)
- **Auth:** None — public read, no API keys required
- **Live paths:** `/downLinks` · `/outages` · `/liveStatus`
- **Transport:** `EventSource` (SSE) — `hooks/useFirebaseSSE.ts`

## Architecture

```
app/(dashboard)/      # Route group: Sidebar + TopNav shell
  incidents/          # Main view — default route
  logs/               # Full log console with filter/search
  backhaul/           # Backhaul links table
  analytics/          # Down-count trend chart (session history)
  system/             # Static system info

components/
  layout/             # Sidebar.tsx, TopNav.tsx
  dashboard/          # IncidentCards, LinkStatusCards, LogConsole
  dashboard/RightPanel/ # NodeStatus, NetworkMap, NetworkIntegrity, BackhaulDistribution
  ui/                 # GlassPanel, StatusDot, SeverityBadge (primitives)

hooks/                # useFirebaseSSE (generic), useDownLinks, useOutages, useLiveStatus
lib/                  # firebase-rest.ts (URL builder), link-parser.ts (label → ParsedLink)
data/                 # node-coordinates.ts, mock-providers.ts (static)
```

## Design System — CRITICAL RULES

From `DESIGN.md` ("Sentinel Lens" — Obsidian & Neon):

- **Never** use `#ffffff` — always `var(--color-on-surface)` (`#e2e2e8`)
- **Never** use 1px solid borders for layout separation — use tonal surface shifts
- Ghost border: `outline outline-1 outline-white/10`
- Glass panel: `bg-surface-var/60 backdrop-blur-xl` (see `GlassPanel.tsx`)
- Ambient glow: `shadow-[0_20px_80px_rgba(0,218,243,0.08)]`
- Dot grid background: `bg-dot-grid bg-dot-24` (custom Tailwind utility)
- Pulse indicator: `animate-ping` ring at 20% opacity (see `StatusDot.tsx`)
- Tabular numbers: `tabular-nums` class on all metric values
- Fonts: Space Grotesk (`font-display`), Inter (`font-body`), Roboto Mono (`font-mono`)

## Key Files

| File | Purpose |
|---|---|
| `lib/link-parser.ts` | Parses `"1-IPT-BSCPLC-DHK-CORE-03 - Client - Interface"` keys |
| `lib/firebase-rest.ts` | `DB_URL` constant + `restUrl(path)` / `sseUrl(path)` |
| `hooks/useFirebaseSSE.ts` | Generic SSE hook — handles `put`/`patch` Firebase events |
| `hooks/useDownLinks.ts` | Returns `ParsedLink[]` sorted by priority then timestamp |
| `styles/globals.css` | All CSS custom properties (design tokens) |
| `tailwind.config.ts` | Extended with token colors, fonts, dot-grid utilities |

## Link Label Format

```
{priority}-{type}-{node} - {client} - {interface}
Example: "1-IPT-BSCPLC-DHK-CORE-03 - ADNGateway - Bundle-Ether655"
```

Severity: priority `1` = CRITICAL · `2` = HIGH · `4` = MEDIUM · `UPSTREAM` type elevates +1 level

## Deployment

- **GitHub:** `Muminur/iig-noc-dashboard`
- **Vercel:** auto-deploys from `main` branch
- **Env vars:** None required (Option A — public Firebase REST)
- **Build check:** always run `npm run build` before `vercel --prod`

## Specs & Plans

- Design spec: `docs/superpowers/specs/2026-04-13-noc-dashboard-design.md`
- Implementation plan: `docs/superpowers/plans/2026-04-13-noc-dashboard.md`
