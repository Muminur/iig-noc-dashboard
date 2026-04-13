# IIG BSCPLC NOC Dashboard — Design Spec
**Date:** 2026-04-13  
**Status:** Approved  
**Stack:** Next.js (App Router) · Tailwind CSS · Firebase RTDB REST · Recharts · Vercel

---

## 1. Objective

Build a production-grade Network Operations Center dashboard for IIG BSCPLC that:
- Displays real-time link outage data from Firebase RTDB
- Renders the "Sentinel Lens" dark UI from DESIGN.md
- Matches and enhances the screen.png mockup
- Deploys to Vercel as a public site

---

## 2. Data Layer (Option A — Firebase REST, No Auth)

**Database:** `https://cactibscplc-default-rtdb.asia-southeast1.firebasedatabase.app/`  
**Auth:** None — public-read rules on relevant paths

### Endpoints

| Path | Content | Update Strategy |
|---|---|---|
| `/liveStatus.json` | `downCount`, `systemStatus` | SSE stream |
| `/downLinks.json` | All currently down links (keyed by label) | SSE stream |
| `/outages.json` | Historical outage records | SSE stream |

### SSE Hook

```ts
// hooks/useFirebaseSSE.ts
function useFirebaseSSE<T>(path: string): { data: T | null; loading: boolean; error: string | null }
```

- Opens `EventSource` to `{DB_URL}/{path}.json`
- Parses `put` and `patch` events from Firebase SSE protocol
- Cleans up on unmount
- Reconnects automatically on disconnect (EventSource default)

### Link Label Parser

Each `downLinks` key follows: `{priority}-{type}-{node} - {client} - {interface}`

```ts
// lib/link-parser.ts
interface ParsedLink {
  raw: string          // original key
  priority: number     // 1 | 2 | 4
  type: string         // IPT | IPBW | UPSTREAM
  node: string         // BSCPLC-DHK-CORE-03 etc.
  client: string       // ADNGateway, Skytel-TEJ, etc.
  interface: string    // Bundle-Ether655, TenGigE0_0_0_5, etc.
  severity: Severity   // derived
  bandwidth: string    // "In: 1.23K, Out: 20.90"
  downAtISO: string
  linkLabel: string
}
```

### Severity Derivation

| Condition | Severity | Color |
|---|---|---|
| prefix `1-` | CRITICAL | `--color-error` #ffb4ab |
| prefix `2-` | HIGH | `--color-tertiary` #ffe7e2 |
| prefix `4-` | MEDIUM | amber |
| type `UPSTREAM` | +1 level | — |

---

## 3. Design System

Tokens from `DESIGN.md` as CSS custom properties:

```css
:root {
  --color-bg:           #111318;
  --color-surface-low:  #1a1c20;
  --color-surface-high: #282a2e;
  --color-surface-var:  #3a3c40;
  --color-primary:      #c3f5ff;
  --color-secondary:    #45fec9;
  --color-tertiary:     #ffe7e2;
  --color-error:        #ffb4ab;
  --color-on-surface:   #e2e2e8;
  --color-tint:         #00daf3;
  --color-outline-var:  rgba(255,255,255,0.15);
}
```

**Rules:**
- No `#ffffff` — always `var(--color-on-surface)`
- No 1px solid borders for layout — use tonal surface shifts
- Ghost border: `outline outline-1 outline-white/10`
- Glass panel: `bg-[--color-surface-var]/60 backdrop-blur-xl`
- Ambient glow: `shadow-[0_20px_80px_rgba(0,218,243,0.08)]`
- Dot grid background: custom Tailwind utility `bg-dot-grid bg-dot-24`
- Pulse indicator: 4px cyan dot with `animate-ping` ring
- Tabular numbers: `tabular-nums` class on all metric values
- Fonts: Space Grotesk (display), Inter (body), Roboto Mono (log console)

---

## 4. Layout Structure

### Shell (`(dashboard)/layout.tsx`)
```
┌─────────────────────────────────────────────────────┐
│ Sidebar (220px fixed) │ TopNav (full width, 56px)   │
│                       ├─────────────────────────────┤
│  SENTINEL NOC logo    │ Main content area            │
│  v2.4.0 ACTIVE        │                             │
│                       │                             │
│  • Incidents          │                             │
│  • Logs               │                             │
│  • Backhaul           │                             │
│  • Analytics          │                             │
│  • System             │                             │
│                       │                             │
│  [DEPLOY EMERGENCY]   │                             │
│  Support / Archive    │                             │
└───────────────────────┴─────────────────────────────┘
```

### Incidents Page (`/incidents`)
```
┌─────────────────────────────────────┬───────────────┐
│ INCIDENT MONITOR header             │ NodeStatus    │
│ subtitle + green live dot           │               │
├──────────────┬──────────────────────│ NetworkMap    │
│ IncidentCard │ IncidentCard         │ (SVG world)   │
│ (CRITICAL)   │ (HIGH/Backhaul)      │               │
├──────────────┴──────────────────────│ NetIntegrity  │
│ LinkStatusCards (3 across)          │               │
├─────────────────────────────────────│ BackhaulDist  │
│ LogConsole (terminal, scrollable)   │               │
└─────────────────────────────────────┴───────────────┘
│ BottomBar: NOC Monitor · X ALERTS ACTIVE            │
└─────────────────────────────────────────────────────┘
```

---

## 5. Component Specifications

### `IncidentCards`
- Source: top 2 records from `downLinks` sorted by `downAtISO` desc, highest severity first
- CRITICAL card: red tint (`--color-error`), signal-down icon (Lucide `WifiOff`)
- HIGH card: orange tint (`--color-tertiary`), grid icon (Lucide `Network`)
- Fields displayed: incident ID (hash of key), link label, interface, node, time ago

### `LinkStatusCards`
- Source: next 3 down links after the top 2
- Each card: node name, interface, description (client), TX/RX bandwidth, mini Recharts BarChart (2 bars: in/out)
- Bandwidth parsed from `"In: 1.23K, Out: 20.90"` string

### `LogConsole`
- Source: all `downLinks` + `outages` merged, sorted by timestamp desc
- Terminal style: `font-roboto-mono text-xs`, dark `--color-surface-low` bg
- Auto-scrolls to latest; user scroll locks auto-scroll
- Log levels: CRITICAL (red), ALERT (amber), UPDATE (blue), INFO (gray), LOG (green)
- Derived level: CRITICAL links → CRITICAL; resolved → UPDATE; historical → LOG

### `NetworkMap`
- Static SVG world map (simplified path data, no external dependency)
- Overlay dots at hardcoded BSCPLC node coordinates:
  - DHK (Dhaka): 23.8°N, 90.4°E
  - COX (Cox's Bazar): 21.4°N, 92.0°E
  - KKT (Cox's Bazar alternate/Kutubdia): 21.8°N, 91.8°E
  - MRS (Marseille, upstream): 43.3°N, 5.4°E
- Animated SVG lines between active nodes
- Down nodes shown in red, up in cyan

### `NetworkIntegrity`
- Derived from `liveStatus.downCount`:
  - Uptime % = `((totalLinks - downCount) / totalLinks) * 100` (assume totalLinks = 50)
  - Latency anomaly = synthetic value cycling ±2ms around 28ms
- Recharts `RadialBarChart` for uptime gauge
- Text counters: uptime %, latency ms

### `BackhaulDistribution`
- Static mock split: SMW4 45%, SMW5 35%, ERR 20% (configurable in `data/mock-providers.ts`)
- Recharts `BarChart` horizontal stacked

### `LogConsole` streaming simulation
- On each SSE `put`/`patch` event, prepend new entries to log with timestamp
- Cap log buffer at 200 entries

### `BottomBar`
- Fixed bottom strip
- Left: pulsing cyan dot + "NOC MONITOR ACTIVE"
- Right: `downCount` from `liveStatus` + "ALERTS ACTIVE"
- Emergency modal on sidebar CTA click (confirmation dialog before "deploying")

---

## 6. Pages Beyond Incidents

| Route | Content |
|---|---|
| `/logs` | Full-screen `LogConsole` + filter by level/node |
| `/backhaul` | Expanded `BackhaulDistribution` + all backhaul links table |
| `/analytics` | Recharts LineChart of downCount over time (stored in session) |
| `/system` | Static system info: Firebase region, DB URL, version, uptime |

---

## 7. Real-Time Refresh Strategy

- **Primary:** Firebase SSE via `EventSource` — push-based, no polling
- **Secondary:** If SSE not available (SSR context), fall back to 5s `setInterval` fetch
- **Simulated streaming for logs:** Each SSE event appends to log buffer with timestamp
- **No mock data** in production — all data from Firebase (downLinks + outages + liveStatus)

---

## 8. Deployment

1. `npx create-next-app@latest` in `D:\IIGPORTAL`
2. Push to `github.com/Muminur/iig-noc-dashboard` (new repo)
3. Connect Vercel project → auto-deploy on push
4. No environment variables needed (Option A — public REST, no config)
5. `vercel --prod` after initial push

---

## 9. Bonus Features (in scope)

- Incident filtering by severity on `/incidents`
- Log search on `/logs`
- Sidebar collapsible on mobile
- Emergency Protocol confirmation modal
- Dark mode only (default per DESIGN.md)

---

## 10. Out of Scope

- Authentication / write operations
- Firebase SDK (Option B)
- Light mode toggle
- Alert sound (browser audio API — defer)
- AI assistant panel beyond static mock strip
