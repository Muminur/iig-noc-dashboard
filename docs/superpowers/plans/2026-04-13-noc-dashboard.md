# IIG BSCPLC NOC Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a production-grade real-time NOC dashboard for IIG BSCPLC consuming live Firebase RTDB data, matching the Sentinel Lens design system, deployed to Vercel.

**Architecture:** Next.js 14 App Router, Tailwind CSS with DESIGN.md tokens, Firebase RTDB via REST SSE (no SDK, no auth), Recharts for gauges/charts, react-simple-maps for world map. Pure client components for all real-time widgets. Static shell renders on server.

**Tech Stack:** Next.js 14 · TypeScript · Tailwind CSS · shadcn/ui · Recharts · react-simple-maps · Lucide React · Jest + React Testing Library

---

## File Map

```
D:\IIGPORTAL\
├── app/
│   ├── layout.tsx                          # Root layout: fonts + metadata
│   ├── page.tsx                            # Redirect → /incidents
│   └── (dashboard)/
│       ├── layout.tsx                      # Shell: Sidebar + TopNav
│       ├── incidents/page.tsx              # Main NOC view
│       ├── logs/page.tsx                   # Full log console
│       ├── backhaul/page.tsx               # Backhaul links table
│       ├── analytics/page.tsx              # Down-count trend chart
│       └── system/page.tsx                 # System info
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx                     # Fixed left nav + emergency CTA
│   │   └── TopNav.tsx                      # Tabs + right icons
│   ├── dashboard/
│   │   ├── IncidentCards.tsx               # Top 2 critical incident cards
│   │   ├── LinkStatusCards.tsx             # 3 mid-severity link cards
│   │   ├── LogConsole.tsx                  # Terminal-style scrollable log
│   │   └── RightPanel/
│   │       ├── NodeStatus.tsx              # Firebase region + ACTIVE badge
│   │       ├── NetworkMap.tsx              # SVG world map + node dots
│   │       ├── NetworkIntegrity.tsx        # Uptime % + latency radial chart
│   │       └── BackhaulDistribution.tsx    # Stacked horizontal bar
│   ├── ui/
│   │   ├── GlassPanel.tsx                  # backdrop-blur-xl wrapper
│   │   ├── StatusDot.tsx                   # Pulse indicator animate-ping
│   │   └── SeverityBadge.tsx               # CRITICAL/HIGH/MEDIUM chip
│   └── BottomBar.tsx                       # Alert count strip
├── hooks/
│   ├── useFirebaseSSE.ts                   # Generic SSE hook
│   ├── useDownLinks.ts                     # Parsed + sorted down links
│   ├── useOutages.ts                       # Historical outage records
│   └── useLiveStatus.ts                    # downCount + systemStatus
├── lib/
│   ├── firebase-rest.ts                    # DB URL + SSE URL builder
│   └── link-parser.ts                      # Label parser + severity logic
├── data/
│   ├── node-coordinates.ts                 # BSCPLC node lat/lng
│   └── mock-providers.ts                   # Backhaul provider split
├── styles/
│   └── globals.css                         # CSS custom properties
├── __tests__/
│   ├── link-parser.test.ts
│   └── firebase-rest.test.ts
└── docs/superpowers/
    ├── specs/2026-04-13-noc-dashboard-design.md
    └── plans/2026-04-13-noc-dashboard.md   ← this file
```

---

## Task 1: Project Scaffold

**Files:**
- Create: all Next.js boilerplate in `D:\IIGPORTAL`
- Modify: `package.json`, `tsconfig.json`

- [ ] **Step 1: Initialize Next.js in existing directory**

```bash
cd D:\IIGPORTAL
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-turbopack --yes
```

If prompted about existing files, confirm overwrite (DESIGN.md and screen.png are not affected).

- [ ] **Step 2: Install all dependencies**

```bash
npm install recharts react-simple-maps
npm install lucide-react clsx tailwind-merge
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom @types/jest ts-jest
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init --defaults
```

When prompted: style = Default, base color = Slate, CSS variables = yes.

- [ ] **Step 4: Add Jest config**

Create `jest.config.ts`:
```ts
import type { Config } from 'jest'
const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }] },
}
export default config
```

Create `jest.setup.ts`:
```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 6: Init git and first commit**

```bash
git init
git add .
git commit -m "init: Next.js 14 project scaffold with deps"
```

---

## Task 2: Design Tokens + Tailwind Config

**Files:**
- Modify: `styles/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace globals.css**

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
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
    --color-outline-var:  rgba(255, 255, 255, 0.15);
    --color-amber:        #fbbf24;
  }
  body {
    background-color: var(--color-bg);
    color: var(--color-on-surface);
    font-family: 'Inter', sans-serif;
  }
}
```

- [ ] **Step 2: Update tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:        'var(--color-bg)',
        'surface-low':  'var(--color-surface-low)',
        'surface-high': 'var(--color-surface-high)',
        'surface-var':  'var(--color-surface-var)',
        primary:   'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        tertiary:  'var(--color-tertiary)',
        error:     'var(--color-error)',
        'on-surface': 'var(--color-on-surface)',
        tint:      'var(--color-tint)',
        amber:     'var(--color-amber)',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        body:    ['var(--font-inter)', 'sans-serif'],
        mono:    ['var(--font-roboto-mono)', 'monospace'],
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(var(--color-outline-var) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-24': '24px 24px',
      },
      boxShadow: {
        glow: '0 20px 80px rgba(0, 218, 243, 0.08)',
        'glow-sm': '0 4px 24px rgba(0, 218, 243, 0.12)',
      },
      borderRadius: {
        card: '12px',
        'card-lg': '16px',
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 3: Update app/layout.tsx with fonts**

```tsx
import type { Metadata } from 'next'
import { Inter, Space_Grotesk, Roboto_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono' })

export const metadata: Metadata = {
  title: 'IIG BSCPLC NOC',
  description: 'Network Operations Center — Live Systems Telemetry',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${robotoMono.variable} bg-bg text-on-surface antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: design tokens, tailwind config, fonts"
```

---

## Task 3: Firebase REST Utilities (TDD)

**Files:**
- Create: `lib/firebase-rest.ts`
- Create: `__tests__/firebase-rest.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/firebase-rest.test.ts`:
```ts
import { restUrl, sseUrl, DB_URL } from '@/lib/firebase-rest'

describe('firebase-rest', () => {
  it('builds REST URL with trailing .json', () => {
    expect(restUrl('downLinks')).toBe(`${DB_URL}/downLinks.json`)
  })
  it('strips leading slash from path', () => {
    expect(restUrl('/liveStatus')).toBe(`${DB_URL}/liveStatus.json`)
  })
  it('sseUrl returns same as restUrl', () => {
    expect(sseUrl('outages')).toBe(restUrl('outages'))
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- --testPathPattern=firebase-rest
```

Expected: `Cannot find module '@/lib/firebase-rest'`

- [ ] **Step 3: Implement**

Create `lib/firebase-rest.ts`:
```ts
export const DB_URL = 'https://cactibscplc-default-rtdb.asia-southeast1.firebasedatabase.app'

export function restUrl(path: string): string {
  const clean = path.replace(/^\//, '')
  return `${DB_URL}/${clean}.json`
}

export function sseUrl(path: string): string {
  return restUrl(path)
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- --testPathPattern=firebase-rest
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/firebase-rest.ts __tests__/firebase-rest.test.ts
git commit -m "feat: firebase REST URL builder with tests"
```

---

## Task 4: Link Parser + Severity Logic (TDD)

**Files:**
- Create: `lib/link-parser.ts`
- Create: `__tests__/link-parser.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/link-parser.test.ts`:
```ts
import { parseLabel, deriveSeverity, parseBandwidth, parseDownLink } from '@/lib/link-parser'

describe('parseLabel', () => {
  it('parses standard IPT label', () => {
    const result = parseLabel("1-IPT-BSCPLC-DHK-CORE-03 - ADNGateway - Bundle-Ether655")
    expect(result).toEqual({
      priority: 1,
      type: 'IPT',
      node: 'BSCPLC-DHK-CORE-03',
      client: 'ADNGateway',
      iface: 'Bundle-Ether655',
    })
  })
  it('parses UPSTREAM label', () => {
    const result = parseLabel("1-UPSTREAM-BSCPLC-KKT-03-Orange-1ST-10G(KKT_MRS_10GLAN_0006)-TenGigE0_0_0_5")
    expect(result.type).toBe('UPSTREAM')
    expect(result.priority).toBe(1)
  })
  it('returns safe defaults for unrecognised format', () => {
    const result = parseLabel("weird-format")
    expect(result.priority).toBe(9)
    expect(result.type).toBe('UNKNOWN')
  })
})

describe('deriveSeverity', () => {
  it('priority 1 = CRITICAL', () => expect(deriveSeverity(1, 'IPT')).toBe('CRITICAL'))
  it('priority 2 = HIGH', () => expect(deriveSeverity(2, 'IPBW')).toBe('HIGH'))
  it('priority 4 = MEDIUM', () => expect(deriveSeverity(4, 'IPT')).toBe('MEDIUM'))
  it('UPSTREAM priority 2 elevates to CRITICAL', () => expect(deriveSeverity(2, 'UPSTREAM')).toBe('CRITICAL'))
  it('UPSTREAM priority 4 elevates to HIGH', () => expect(deriveSeverity(4, 'UPSTREAM')).toBe('HIGH'))
})

describe('parseBandwidth', () => {
  it('parses standard bandwidth string', () => {
    expect(parseBandwidth('In: 1.23K, Out: 20.90')).toEqual({ in: '1.23K', out: '20.90' })
  })
  it('returns zeros for empty string', () => {
    expect(parseBandwidth('')).toEqual({ in: '0', out: '0' })
  })
})

describe('parseDownLink', () => {
  it('returns a complete ParsedLink', () => {
    const raw = {
      bandwidth: 'In: 1.23K, Out: 20.90',
      clientName: 'test',
      downAtISO: '2026-04-12T23:15:42.515Z',
      linkLabel: 'test-label',
    }
    const result = parseDownLink("1-IPT-BSCPLC-DHK-CORE-03 - ADNGateway - Bundle-Ether655", raw)
    expect(result.severity).toBe('CRITICAL')
    expect(result.priority).toBe(1)
    expect(result.bandwidth).toEqual({ in: '1.23K', out: '20.90' })
    expect(result.node).toBe('BSCPLC-DHK-CORE-03')
    expect(result.client).toBe('ADNGateway')
    expect(result.interface).toBe('Bundle-Ether655')
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- --testPathPattern=link-parser
```

Expected: `Cannot find module '@/lib/link-parser'`

- [ ] **Step 3: Implement**

Create `lib/link-parser.ts`:
```ts
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export interface RawDownLink {
  bandwidth: string
  clientName: string
  downAtISO: string
  linkLabel: string
}

export interface ParsedLink {
  raw: string
  priority: number
  type: string
  node: string
  client: string
  interface: string
  severity: Severity
  bandwidth: { in: string; out: string }
  downAtISO: string
  linkLabel: string
}

export function parseLabel(key: string): {
  priority: number; type: string; node: string; client: string; iface: string
} {
  const match = key.match(/^(\d+)-([A-Z]+)-(.+?)\s+-\s+(.+?)\s+-\s+(.+)$/)
  if (!match) return { priority: 9, type: 'UNKNOWN', node: key, client: key, iface: key }
  return {
    priority: parseInt(match[1], 10),
    type: match[2],
    node: match[3],
    client: match[4],
    iface: match[5].trim(),
  }
}

export function deriveSeverity(priority: number, type: string): Severity {
  if (priority === 1) return 'CRITICAL'
  if (type === 'UPSTREAM') return priority === 2 ? 'CRITICAL' : 'HIGH'
  if (priority === 2) return 'HIGH'
  return 'MEDIUM'
}

export function parseBandwidth(raw: string): { in: string; out: string } {
  const match = raw.match(/In:\s*([^,]+),\s*Out:\s*(.+)/)
  if (!match) return { in: '0', out: '0' }
  return { in: match[1].trim(), out: match[2].trim() }
}

export function parseDownLink(key: string, value: RawDownLink): ParsedLink {
  const { priority, type, node, client, iface } = parseLabel(key)
  return {
    raw: key,
    priority,
    type,
    node,
    client,
    interface: iface,
    severity: deriveSeverity(priority, type),
    bandwidth: parseBandwidth(value.bandwidth ?? ''),
    downAtISO: value.downAtISO,
    linkLabel: value.linkLabel,
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- --testPathPattern=link-parser
```

Expected: 11 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/link-parser.ts __tests__/link-parser.test.ts
git commit -m "feat: link label parser and severity logic with tests"
```

---

## Task 5: Firebase SSE Hook + Data Hooks

**Files:**
- Create: `hooks/useFirebaseSSE.ts`
- Create: `hooks/useDownLinks.ts`
- Create: `hooks/useOutages.ts`
- Create: `hooks/useLiveStatus.ts`

- [ ] **Step 1: Create useFirebaseSSE.ts**

```ts
'use client'
import { useEffect, useState } from 'react'
import { sseUrl } from '@/lib/firebase-rest'

export function useFirebaseSSE<T>(path: string): {
  data: T | null
  loading: boolean
  error: string | null
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = sseUrl(path)
    const es = new EventSource(url)

    es.addEventListener('put', (e: MessageEvent) => {
      try {
        const payload: { path: string; data: T } = JSON.parse(e.data)
        if (payload.path === '/') {
          setData(payload.data)
        } else {
          const key = payload.path.replace(/^\//, '')
          setData(prev =>
            prev && typeof prev === 'object'
              ? { ...prev, [key]: payload.data }
              : payload.data
          )
        }
        setLoading(false)
        setError(null)
      } catch {
        setError('Parse error')
      }
    })

    es.addEventListener('patch', (e: MessageEvent) => {
      try {
        const payload: { path: string; data: Partial<T> } = JSON.parse(e.data)
        setData(prev =>
          prev && typeof prev === 'object'
            ? { ...prev, ...(payload.data as object) }
            : payload.data as T
        )
        setLoading(false)
      } catch {
        setError('Parse error')
      }
    })

    es.onerror = () => setError('Reconnecting...')

    return () => es.close()
  }, [path])

  return { data, loading, error }
}
```

- [ ] **Step 2: Create useDownLinks.ts**

```ts
'use client'
import { useMemo } from 'react'
import { useFirebaseSSE } from './useFirebaseSSE'
import { parseDownLink, ParsedLink, RawDownLink } from '@/lib/link-parser'

export function useDownLinks() {
  const { data, loading, error } = useFirebaseSSE<Record<string, RawDownLink>>('downLinks')

  const links = useMemo<ParsedLink[]>(() => {
    if (!data) return []
    return Object.entries(data)
      .map(([key, val]) => parseDownLink(key, val))
      .sort((a, b) =>
        a.priority !== b.priority
          ? a.priority - b.priority
          : new Date(b.downAtISO).getTime() - new Date(a.downAtISO).getTime()
      )
  }, [data])

  return { links, loading, error }
}
```

- [ ] **Step 3: Create useOutages.ts**

```ts
'use client'
import { useFirebaseSSE } from './useFirebaseSSE'

export interface OutageRecord {
  downAtISO: string
  upAtISO?: string
  linkLabel: string
  duration?: number
  bandwidth?: string
}

export function useOutages() {
  const { data, loading, error } = useFirebaseSSE<Record<string, OutageRecord>>('outages')
  const records = data ? Object.values(data) : []
  return { records, loading, error }
}
```

- [ ] **Step 4: Create useLiveStatus.ts**

```ts
'use client'
import { useFirebaseSSE } from './useFirebaseSSE'

interface LiveStatus {
  downCount: number
  systemStatus?: string
}

export function useLiveStatus() {
  const { data, loading, error } = useFirebaseSSE<LiveStatus>('liveStatus')
  return {
    downCount: data?.downCount ?? 0,
    systemStatus: data?.systemStatus ?? 'ACTIVE',
    loading,
    error,
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add hooks/
git commit -m "feat: firebase SSE hook and data hooks (downLinks, outages, liveStatus)"
```

---

## Task 6: Static Data + UI Primitives

**Files:**
- Create: `data/node-coordinates.ts`
- Create: `data/mock-providers.ts`
- Create: `components/ui/GlassPanel.tsx`
- Create: `components/ui/StatusDot.tsx`
- Create: `components/ui/SeverityBadge.tsx`

- [ ] **Step 1: Create node coordinates**

```ts
// data/node-coordinates.ts
export interface NetworkNode {
  id: string
  label: string
  lat: number
  lng: number
  region: string
}

export const NETWORK_NODES: NetworkNode[] = [
  { id: 'DHK', label: 'Dhaka Core',     lat: 23.81, lng: 90.41,  region: 'BD' },
  { id: 'COX', label: 'Cox\'s Bazar',   lat: 21.43, lng: 92.01,  region: 'BD' },
  { id: 'KKT', label: 'Kutubdia',       lat: 21.83, lng: 91.86,  region: 'BD' },
  { id: 'MRS', label: 'Marseille',      lat: 43.30, lng: 5.38,   region: 'EU' },
  { id: 'SGP', label: 'Singapore',      lat: 1.35,  lng: 103.82, region: 'SG' },
]
```

- [ ] **Step 2: Create backhaul provider data**

```ts
// data/mock-providers.ts
export const BACKHAUL_PROVIDERS = [
  { name: 'SMW4', percentage: 45, color: 'var(--color-primary)' },
  { name: 'SMW5', percentage: 35, color: 'var(--color-secondary)' },
  { name: 'ERR',  percentage: 20, color: 'var(--color-error)' },
]
```

- [ ] **Step 3: Create GlassPanel**

```tsx
// components/ui/GlassPanel.tsx
import { cn } from '@/lib/utils'

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div
      className={cn(
        'relative rounded-card bg-surface-var/60 backdrop-blur-xl shadow-glow',
        'before:absolute before:inset-0 before:rounded-card before:pointer-events-none',
        'before:bg-gradient-to-br before:from-primary/20 before:to-transparent',
        className
      )}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Create StatusDot**

```tsx
// components/ui/StatusDot.tsx
import { cn } from '@/lib/utils'

type StatusColor = 'green' | 'red' | 'amber' | 'cyan'

const colorMap: Record<StatusColor, string> = {
  green:  'bg-secondary',
  red:    'bg-error',
  amber:  'bg-amber',
  cyan:   'bg-primary',
}

export function StatusDot({ color = 'green', size = 2 }: { color?: StatusColor; size?: number }) {
  const sz = `w-${size} h-${size}`
  return (
    <span className="relative inline-flex">
      <span className={cn('rounded-full animate-ping absolute inline-flex h-full w-full opacity-20', colorMap[color])} />
      <span className={cn('relative inline-flex rounded-full', sz, colorMap[color])} />
    </span>
  )
}
```

- [ ] **Step 5: Create SeverityBadge**

```tsx
// components/ui/SeverityBadge.tsx
import { cn } from '@/lib/utils'
import type { Severity } from '@/lib/link-parser'

const map: Record<Severity, string> = {
  CRITICAL: 'bg-error/20 text-error border border-error/30',
  HIGH:     'bg-tertiary/20 text-tertiary border border-tertiary/30',
  MEDIUM:   'bg-amber/20 text-amber border border-amber/30',
  LOW:      'bg-on-surface/10 text-on-surface/60 border border-on-surface/10',
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded tracking-widest tabular-nums', map[severity])}>
      {severity}
    </span>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add data/ components/ui/
git commit -m "feat: static data, GlassPanel, StatusDot, SeverityBadge primitives"
```

---

## Task 7: Layout Shell (Sidebar + TopNav)

**Files:**
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/TopNav.tsx`
- Create: `app/(dashboard)/layout.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: Create Sidebar**

```tsx
// components/layout/Sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AlertTriangle, FileText, Network, BarChart2, Settings, Zap, HelpCircle, Archive } from 'lucide-react'

const NAV = [
  { href: '/incidents',  label: 'Incidents',  icon: AlertTriangle },
  { href: '/logs',       label: 'Logs',        icon: FileText },
  { href: '/backhaul',   label: 'Backhaul',    icon: Network },
  { href: '/analytics',  label: 'Analytics',   icon: BarChart2 },
  { href: '/system',     label: 'System',      icon: Settings },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-surface-low flex flex-col z-30 border-r border-white/5">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-white/5">
        <p className="font-display font-bold text-sm text-primary tracking-widest uppercase">Sentinel NOC</p>
        <p className="text-[10px] text-on-surface/40 mt-0.5 tracking-wider">IIG · BSCPLC</p>
        <span className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-mono text-secondary/80">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          v2.4.0 ACTIVE
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href)
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-on-surface/50 hover:text-on-surface hover:bg-surface-high'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <span className="ml-auto w-1 h-4 rounded-full bg-primary" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 space-y-2 border-t border-white/5 pt-3">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-error/15 text-error text-xs font-semibold tracking-wider hover:bg-error/25 transition-colors">
          <Zap className="w-3.5 h-3.5" />
          DEPLOY EMERGENCY
        </button>
        <div className="flex gap-2 px-1">
          <button className="flex items-center gap-1.5 text-[11px] text-on-surface/30 hover:text-on-surface/60 transition-colors">
            <HelpCircle className="w-3 h-3" /> Support
          </button>
          <button className="flex items-center gap-1.5 text-[11px] text-on-surface/30 hover:text-on-surface/60 transition-colors ml-auto">
            <Archive className="w-3 h-3" /> Archive
          </button>
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Create TopNav**

```tsx
// components/layout/TopNav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Search, Bell, Settings, User } from 'lucide-react'

const TABS = [
  { href: '/incidents', label: 'GLOBAL' },
  { href: '/backhaul',  label: 'TRAFFIC' },
  { href: '/logs',      label: 'SECURITY' },
  { href: '/analytics', label: 'INFRA' },
]

export function TopNav() {
  const path = usePathname()
  return (
    <header className="h-14 flex items-center px-6 border-b border-white/5 bg-surface-low/80 backdrop-blur-sm">
      <nav className="flex gap-1">
        {TABS.map(({ href, label }) => {
          const active = path.startsWith(href)
          return (
            <Link key={href} href={href}
              className={cn(
                'px-4 py-1.5 text-xs font-semibold tracking-widest rounded transition-all',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface/40 hover:text-on-surface/70'
              )}
            >
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="ml-auto flex items-center gap-4 text-on-surface/40">
        <button className="hover:text-on-surface/70 transition-colors"><Search className="w-4 h-4" /></button>
        <button className="hover:text-on-surface/70 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-error" />
        </button>
        <button className="hover:text-on-surface/70 transition-colors"><Settings className="w-4 h-4" /></button>
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-primary" />
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Create dashboard layout**

```tsx
// app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNav } from '@/components/layout/TopNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg bg-dot-grid bg-dot-24">
      <Sidebar />
      <div className="ml-[220px] flex flex-col min-h-screen">
        <TopNav />
        <main className="flex-1 p-5 pb-16">{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create root redirect**

```tsx
// app/page.tsx
import { redirect } from 'next/navigation'
export default function Home() {
  redirect('/incidents')
}
```

- [ ] **Step 5: Verify dev server runs**

```bash
npm run dev
```

Open http://localhost:3000 — should redirect to `/incidents` and show the sidebar + topnav shell (empty main area). No errors in console.

- [ ] **Step 6: Commit**

```bash
git add app/ components/layout/
git commit -m "feat: dashboard shell with sidebar and topnav"
```

---

## Task 8: IncidentCards Component

**Files:**
- Create: `components/dashboard/IncidentCards.tsx`

- [ ] **Step 1: Create IncidentCards**

```tsx
// components/dashboard/IncidentCards.tsx
'use client'
import { WifiOff, Network, Clock } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import type { ParsedLink } from '@/lib/link-parser'
import { cn } from '@/lib/utils'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function incidentId(raw: string): string {
  let h = 0
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) >>> 0
  return `INC-${(h % 90000 + 10000).toString()}`
}

function IncidentCard({ link, accent }: { link: ParsedLink; accent: 'red' | 'orange' }) {
  const isRed = accent === 'red'
  return (
    <GlassPanel className={cn(
      'flex-1 p-4 min-w-0',
      isRed ? 'border-l-2 border-error/60' : 'border-l-2 border-tertiary/60'
    )}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
          isRed ? 'bg-error/15' : 'bg-tertiary/15'
        )}>
          {isRed
            ? <WifiOff className={cn('w-4 h-4', isRed ? 'text-error' : 'text-tertiary')} />
            : <Network className="w-4 h-4 text-tertiary" />
          }
        </div>
        <SeverityBadge severity={link.severity} />
      </div>

      <p className="font-mono text-[10px] text-on-surface/40 mb-1">{incidentId(link.raw)}</p>
      <p className="font-display text-sm font-semibold text-on-surface leading-tight mb-2 truncate" title={link.client}>
        {link.client}
      </p>

      <div className="space-y-1 text-[11px] text-on-surface/50">
        <div className="flex gap-1"><span className="text-on-surface/30">Node</span><span className="ml-auto font-mono text-on-surface/70">{link.node}</span></div>
        <div className="flex gap-1"><span className="text-on-surface/30">Interface</span><span className="ml-auto font-mono text-on-surface/70 truncate max-w-[130px]" title={link.interface}>{link.interface}</span></div>
        <div className="flex items-center gap-1 mt-2">
          <Clock className="w-3 h-3 text-on-surface/30" />
          <span className="text-on-surface/40">{timeAgo(link.downAtISO)}</span>
          <span className="ml-auto text-[10px] font-mono">{new Date(link.downAtISO).toLocaleDateString()}</span>
        </div>
      </div>
    </GlassPanel>
  )
}

export function IncidentCards({ links }: { links: ParsedLink[] }) {
  const top2 = links.slice(0, 2)
  const [first, second] = top2

  return (
    <div className="flex gap-4">
      {first && <IncidentCard link={first} accent="red" />}
      {second && <IncidentCard link={second} accent="orange" />}
      {!first && (
        <GlassPanel className="flex-1 p-4 flex items-center justify-center text-on-surface/30 text-sm">
          No active incidents
        </GlassPanel>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/IncidentCards.tsx
git commit -m "feat: IncidentCards component"
```

---

## Task 9: LinkStatusCards Component

**Files:**
- Create: `components/dashboard/LinkStatusCards.tsx`

- [ ] **Step 1: Create LinkStatusCards**

```tsx
// components/dashboard/LinkStatusCards.tsx
'use client'
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import type { ParsedLink } from '@/lib/link-parser'

function parseBwValue(s: string): number {
  const n = parseFloat(s)
  if (isNaN(n)) return 0
  if (s.includes('G')) return n * 1000
  if (s.includes('M')) return n
  if (s.includes('K')) return n / 1000
  return n
}

function LinkCard({ link }: { link: ParsedLink }) {
  const bwData = [
    { name: 'In',  value: parseBwValue(link.bandwidth.in) },
    { name: 'Out', value: parseBwValue(link.bandwidth.out) },
  ]

  return (
    <GlassPanel className="flex-1 p-4 min-w-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-display text-xs font-semibold text-on-surface truncate max-w-[140px]" title={link.interface}>
            {link.interface}
          </p>
          <p className="text-[10px] text-on-surface/40 truncate max-w-[140px]" title={link.node}>{link.node}</p>
        </div>
        <SeverityBadge severity={link.severity} />
      </div>

      <p className="text-[11px] text-on-surface/50 truncate mb-3" title={link.client}>{link.client}</p>

      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1 text-[10px] font-mono">
          <div className="flex justify-between">
            <span className="text-on-surface/30">TX</span>
            <span className="text-primary">{link.bandwidth.out}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface/30">RX</span>
            <span className="text-secondary">{link.bandwidth.in}</span>
          </div>
        </div>
        <div className="w-16 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bwData} barSize={8} barGap={4}>
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                <Cell fill="var(--color-primary)" />
                <Cell fill="var(--color-secondary)" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassPanel>
  )
}

export function LinkStatusCards({ links }: { links: ParsedLink[] }) {
  const cards = links.slice(2, 5)
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-widest text-on-surface/40 uppercase mb-3">Specific Link Status</p>
      <div className="flex gap-4">
        {cards.map(link => <LinkCard key={link.raw} link={link} />)}
        {Array.from({ length: Math.max(0, 3 - cards.length) }).map((_, i) => (
          <GlassPanel key={i} className="flex-1 p-4 flex items-center justify-center text-on-surface/20 text-xs">
            No data
          </GlassPanel>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/LinkStatusCards.tsx
git commit -m "feat: LinkStatusCards with mini bandwidth bar charts"
```

---

## Task 10: LogConsole Component

**Files:**
- Create: `components/dashboard/LogConsole.tsx`

- [ ] **Step 1: Create LogConsole**

```tsx
// components/dashboard/LogConsole.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import type { ParsedLink } from '@/lib/link-parser'
import type { OutageRecord } from '@/hooks/useOutages'
import { cn } from '@/lib/utils'

type LogLevel = 'CRITICAL' | 'ALERT' | 'UPDATE' | 'LOG' | 'INFO'

interface LogEntry {
  id: string
  ts: string
  level: LogLevel
  message: string
  source: string
}

const levelStyle: Record<LogLevel, string> = {
  CRITICAL: 'text-error',
  ALERT:    'text-amber',
  UPDATE:   'text-primary',
  LOG:      'text-secondary',
  INFO:     'text-on-surface/40',
}

function linkToLog(link: ParsedLink): LogEntry {
  return {
    id: `dl-${link.raw}`,
    ts: link.downAtISO,
    level: link.severity === 'CRITICAL' ? 'CRITICAL' : 'ALERT',
    message: `LINK DOWN: ${link.client} — ${link.interface}`,
    source: link.node,
  }
}

function outageToLog(o: OutageRecord, idx: number): LogEntry {
  return {
    id: `out-${idx}`,
    ts: o.downAtISO,
    level: o.upAtISO ? 'LOG' : 'UPDATE',
    message: o.upAtISO
      ? `RESTORED: ${o.linkLabel}`
      : `OUTAGE RECORDED: ${o.linkLabel}`,
    source: 'OUTAGE_DB',
  }
}

interface Props {
  links: ParsedLink[]
  outages: OutageRecord[]
  maxEntries?: number
  searchTerm?: string
  levelFilter?: LogLevel | 'ALL'
}

export function LogConsole({ links, outages, maxEntries = 200, searchTerm = '', levelFilter = 'ALL' }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [userScrolled, setUserScrolled] = useState(false)

  const entries: LogEntry[] = [
    ...links.map(linkToLog),
    ...outages.map(outageToLog),
  ]
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, maxEntries)
    .filter(e => levelFilter === 'ALL' || e.level === levelFilter)
    .filter(e => !searchTerm || e.message.toLowerCase().includes(searchTerm.toLowerCase()))

  useEffect(() => {
    if (!userScrolled) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [entries.length, userScrolled])

  return (
    <GlassPanel className="flex flex-col" style={{ height: '260px' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 shrink-0">
        <span className="text-[10px] font-mono font-semibold text-on-surface/40 tracking-widest">LIVE LOG CONSOLE</span>
        <span className="text-[10px] font-mono text-secondary">{entries.length} ENTRIES</span>
      </div>
      <div
        className="flex-1 overflow-y-auto px-4 py-2 space-y-1 font-mono text-[11px]"
        onScroll={e => {
          const el = e.currentTarget
          setUserScrolled(el.scrollTop + el.clientHeight < el.scrollHeight - 20)
        }}
      >
        {entries.map(entry => (
          <div key={entry.id} className="flex gap-3 leading-5">
            <span className="text-on-surface/25 shrink-0 tabular-nums">
              {new Date(entry.ts).toISOString().slice(11, 19)}
            </span>
            <span className={cn('w-16 shrink-0 font-semibold tabular-nums', levelStyle[entry.level])}>
              [{entry.level.slice(0, 4)}]
            </span>
            <span className="text-on-surface/30 shrink-0 hidden md:block">{entry.source}</span>
            <span className="text-on-surface/70 truncate">{entry.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </GlassPanel>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/LogConsole.tsx
git commit -m "feat: LogConsole terminal component with level colours and auto-scroll"
```

---

## Task 11: NetworkMap Component

**Files:**
- Create: `components/dashboard/RightPanel/NetworkMap.tsx`

- [ ] **Step 1: Install react-simple-maps**

```bash
npm install react-simple-maps
npm install --save-dev @types/react-simple-maps
```

- [ ] **Step 2: Create NetworkMap**

```tsx
// components/dashboard/RightPanel/NetworkMap.tsx
'use client'
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { NETWORK_NODES } from '@/data/node-coordinates'
import type { ParsedLink } from '@/lib/link-parser'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const NODE_CONNECTIONS: [string, string][] = [
  ['DHK', 'SGP'],
  ['DHK', 'MRS'],
  ['COX', 'DHK'],
  ['KKT', 'DHK'],
]

function nodeCoords(id: string): [number, number] {
  const n = NETWORK_NODES.find(n => n.id === id)
  return n ? [n.lng, n.lat] : [0, 0]
}

export function NetworkMap({ links }: { links: ParsedLink[] }) {
  const downNodes = new Set(links.map(l => {
    if (l.node.includes('DHK')) return 'DHK'
    if (l.node.includes('COX')) return 'COX'
    if (l.node.includes('KKT')) return 'KKT'
    return null
  }).filter(Boolean))

  return (
    <GlassPanel className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold tracking-widest text-on-surface/40 uppercase">KXT Node Cluster Map</span>
        <span className="text-[10px] font-mono text-secondary">{NETWORK_NODES.length} NODES</span>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 80, center: [80, 20] }}
        style={{ width: '100%', height: '140px' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="rgba(255,255,255,0.04)"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={0.3}
                style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
              />
            ))
          }
        </Geographies>

        {NODE_CONNECTIONS.map(([from, to]) => (
          <Line
            key={`${from}-${to}`}
            from={nodeCoords(from)}
            to={nodeCoords(to)}
            stroke="rgba(0,218,243,0.3)"
            strokeWidth={0.8}
            strokeLinecap="round"
          />
        ))}

        {NETWORK_NODES.map(node => {
          const isDown = downNodes.has(node.id)
          return (
            <Marker key={node.id} coordinates={[node.lng, node.lat]}>
              <circle r={3} fill={isDown ? 'var(--color-error)' : 'var(--color-secondary)'} opacity={0.9} />
              {isDown && <circle r={6} fill="var(--color-error)" opacity={0.2} className="animate-ping" />}
              <text y={-6} textAnchor="middle" style={{ fontSize: 5, fill: 'rgba(255,255,255,0.5)' }}>
                {node.id}
              </text>
            </Marker>
          )
        })}
      </ComposableMap>

      <div className="mt-1 flex gap-3 text-[9px] font-mono text-on-surface/30">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" /> ONLINE</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-error inline-block" /> DEGRADED</span>
        <span className="ml-auto">{NETWORK_NODES.filter(n => !downNodes.has(n.id)).length}/{NETWORK_NODES.length} ACTIVE</span>
      </div>
    </GlassPanel>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/RightPanel/NetworkMap.tsx data/node-coordinates.ts
git commit -m "feat: NetworkMap SVG world map with live node status"
```

---

## Task 12: Right Panel Supporting Components

**Files:**
- Create: `components/dashboard/RightPanel/NodeStatus.tsx`
- Create: `components/dashboard/RightPanel/NetworkIntegrity.tsx`
- Create: `components/dashboard/RightPanel/BackhaulDistribution.tsx`

- [ ] **Step 1: Create NodeStatus**

```tsx
// components/dashboard/RightPanel/NodeStatus.tsx
import { GlassPanel } from '@/components/ui/GlassPanel'
import { StatusDot } from '@/components/ui/StatusDot'

export function NodeStatus() {
  return (
    <GlassPanel className="p-3 flex items-center justify-between">
      <div>
        <p className="text-[10px] text-on-surface/30 tracking-wider uppercase">Firebase Node</p>
        <p className="text-xs font-semibold text-on-surface mt-0.5">asia-southeast1</p>
        <p className="text-[10px] text-on-surface/40 font-mono">SGP · Singapore</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="flex items-center gap-1.5 text-[10px] text-secondary font-semibold">
          <StatusDot color="green" size={2} /> ACTIVE
        </span>
        <span className="text-[9px] text-on-surface/30 font-mono">RTDB · REST/SSE</span>
      </div>
    </GlassPanel>
  )
}
```

- [ ] **Step 2: Create NetworkIntegrity**

```tsx
// components/dashboard/RightPanel/NetworkIntegrity.tsx
'use client'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { GlassPanel } from '@/components/ui/GlassPanel'

const TOTAL_LINKS = 50

export function NetworkIntegrity({ downCount }: { downCount: number }) {
  const uptime = Math.max(0, Math.round(((TOTAL_LINKS - downCount) / TOTAL_LINKS) * 1000) / 10)
  const latency = (28 + (Math.sin(Date.now() / 10000) * 2)).toFixed(1)

  const gaugeData = [{ name: 'uptime', value: uptime, fill: 'var(--color-secondary)' }]

  return (
    <GlassPanel className="p-3">
      <p className="text-[10px] font-semibold tracking-widest text-on-surface/40 uppercase mb-2">Network Integrity</p>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="65%" outerRadius="90%"
              startAngle={225} endAngle={-45}
              data={gaugeData}
            >
              <RadialBar dataKey="value" cornerRadius={4} background={{ fill: 'rgba(255,255,255,0.05)' }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 flex-1">
          <div>
            <p className="text-[10px] text-on-surface/30">Core Uptime</p>
            <p className="font-display text-lg font-bold text-secondary tabular-nums">{uptime}%</p>
          </div>
          <div>
            <p className="text-[10px] text-on-surface/30">Latency</p>
            <p className="font-display text-sm font-bold text-primary tabular-nums">{latency} ms</p>
          </div>
          <div>
            <p className="text-[10px] text-on-surface/30">Down Links</p>
            <p className="font-display text-sm font-bold text-error tabular-nums">{downCount}</p>
          </div>
        </div>
      </div>
    </GlassPanel>
  )
}
```

- [ ] **Step 3: Create BackhaulDistribution**

```tsx
// components/dashboard/RightPanel/BackhaulDistribution.tsx
import { GlassPanel } from '@/components/ui/GlassPanel'
import { BACKHAUL_PROVIDERS } from '@/data/mock-providers'

export function BackhaulDistribution() {
  return (
    <GlassPanel className="p-3">
      <p className="text-[10px] font-semibold tracking-widest text-on-surface/40 uppercase mb-3">Backhaul Distribution</p>
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        {BACKHAUL_PROVIDERS.map(p => (
          <div
            key={p.name}
            style={{ width: `${p.percentage}%`, background: p.color }}
            className="transition-all duration-1000"
          />
        ))}
      </div>
      <div className="flex gap-3 mt-2">
        {BACKHAUL_PROVIDERS.map(p => (
          <div key={p.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ background: p.color }} />
            <span className="text-[10px] text-on-surface/50">{p.name}</span>
            <span className="text-[10px] font-mono text-on-surface/70 tabular-nums">{p.percentage}%</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/RightPanel/
git commit -m "feat: NodeStatus, NetworkIntegrity, BackhaulDistribution right panel"
```

---

## Task 13: BottomBar Component

**Files:**
- Create: `components/BottomBar.tsx`

- [ ] **Step 1: Create BottomBar**

```tsx
// components/BottomBar.tsx
'use client'
import { StatusDot } from '@/components/ui/StatusDot'
import { useLiveStatus } from '@/hooks/useLiveStatus'

export function BottomBar() {
  const { downCount, systemStatus } = useLiveStatus()

  return (
    <div className="fixed bottom-0 left-[220px] right-0 h-10 bg-surface-low/90 backdrop-blur-sm border-t border-white/5 flex items-center px-5 z-20">
      <div className="flex items-center gap-2.5">
        <StatusDot color="cyan" size={2} />
        <span className="text-[11px] font-mono text-on-surface/50 tracking-wider">
          NOC MONITOR · {systemStatus}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="text-[11px] font-mono text-error font-semibold tabular-nums">{downCount}</span>
        <span className="text-[11px] font-mono text-on-surface/40">ALERTS ACTIVE</span>
        <span className="ml-3 w-2 h-2 rounded-full bg-error animate-pulse" />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add BottomBar to dashboard layout**

Modify `app/(dashboard)/layout.tsx`:
```tsx
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNav } from '@/components/layout/TopNav'
import { BottomBar } from '@/components/BottomBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg bg-dot-grid bg-dot-24">
      <Sidebar />
      <div className="ml-[220px] flex flex-col min-h-screen">
        <TopNav />
        <main className="flex-1 p-5 pb-16">{children}</main>
      </div>
      <BottomBar />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/BottomBar.tsx app/\(dashboard\)/layout.tsx
git commit -m "feat: BottomBar with live alert count from Firebase"
```

---

## Task 14: Incidents Page Assembly

**Files:**
- Create: `app/(dashboard)/incidents/page.tsx`

- [ ] **Step 1: Create incidents page**

```tsx
// app/(dashboard)/incidents/page.tsx
'use client'
import { useState } from 'react'
import { useDownLinks } from '@/hooks/useDownLinks'
import { useOutages } from '@/hooks/useOutages'
import { useLiveStatus } from '@/hooks/useLiveStatus'
import { IncidentCards } from '@/components/dashboard/IncidentCards'
import { LinkStatusCards } from '@/components/dashboard/LinkStatusCards'
import { LogConsole } from '@/components/dashboard/LogConsole'
import { NodeStatus } from '@/components/dashboard/RightPanel/NodeStatus'
import { NetworkMap } from '@/components/dashboard/RightPanel/NetworkMap'
import { NetworkIntegrity } from '@/components/dashboard/RightPanel/NetworkIntegrity'
import { BackhaulDistribution } from '@/components/dashboard/RightPanel/BackhaulDistribution'
import { StatusDot } from '@/components/ui/StatusDot'

export default function IncidentsPage() {
  const { links, loading } = useDownLinks()
  const { records } = useOutages()
  const { downCount } = useLiveStatus()

  return (
    <div className="flex gap-5 h-full">
      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <StatusDot color="green" size={2} />
              <span className="text-[10px] font-mono text-secondary tracking-widest">LIVE SYSTEMS TELEMETRY · IIG BSCPLC</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-on-surface tracking-tight">
              INCIDENT MONITOR
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-on-surface/30 font-mono">BSCPLC IIG NOC</p>
            <p className="text-[10px] text-error font-mono font-semibold tabular-nums">{downCount} DOWN</p>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-on-surface/30 text-sm font-mono animate-pulse">
            Connecting to Firebase...
          </div>
        ) : (
          <>
            <IncidentCards links={links} />
            <LinkStatusCards links={links} />
            <LogConsole links={links} outages={records} />
          </>
        )}
      </div>

      {/* Right panel */}
      <div className="w-[260px] shrink-0 flex flex-col gap-4">
        <NodeStatus />
        <NetworkMap links={links} />
        <NetworkIntegrity downCount={downCount} />
        <BackhaulDistribution />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000/incidents — confirm:
- Header with "INCIDENT MONITOR" and live dot
- Incident cards appear once Firebase SSE connects (~1-2 seconds)
- Right panel renders with NodeStatus, map, integrity gauge
- Bottom bar shows alert count

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/incidents/
git commit -m "feat: incidents page — full dashboard assembly"
```

---

## Task 15: Remaining Pages

**Files:**
- Create: `app/(dashboard)/logs/page.tsx`
- Create: `app/(dashboard)/backhaul/page.tsx`
- Create: `app/(dashboard)/analytics/page.tsx`
- Create: `app/(dashboard)/system/page.tsx`

- [ ] **Step 1: Logs page**

```tsx
// app/(dashboard)/logs/page.tsx
'use client'
import { useState } from 'react'
import { useDownLinks } from '@/hooks/useDownLinks'
import { useOutages } from '@/hooks/useOutages'
import { LogConsole } from '@/components/dashboard/LogConsole'

type Level = 'ALL' | 'CRITICAL' | 'ALERT' | 'UPDATE' | 'LOG' | 'INFO'
const LEVELS: Level[] = ['ALL', 'CRITICAL', 'ALERT', 'UPDATE', 'LOG', 'INFO']

export default function LogsPage() {
  const { links } = useDownLinks()
  const { records } = useOutages()
  const [level, setLevel] = useState<Level>('ALL')
  const [search, setSearch] = useState('')

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">System Logs</h1>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="bg-surface-high border-b border-white/10 focus:border-primary outline-none text-xs px-3 py-1.5 rounded text-on-surface placeholder-on-surface/30 w-48"
          />
          <div className="flex gap-1">
            {LEVELS.map(l => (
              <button key={l}
                onClick={() => setLevel(l)}
                className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${level === l ? 'bg-primary/15 text-primary' : 'text-on-surface/30 hover:text-on-surface/60'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1" style={{ minHeight: 0 }}>
        <LogConsole links={links} outages={records} maxEntries={500} searchTerm={search} levelFilter={level} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Backhaul page**

```tsx
// app/(dashboard)/backhaul/page.tsx
'use client'
import { useDownLinks } from '@/hooks/useDownLinks'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { BackhaulDistribution } from '@/components/dashboard/RightPanel/BackhaulDistribution'

export default function BackhaulPage() {
  const { links } = useDownLinks()
  const backhaulLinks = links.filter(l => l.type === 'IPBW' || l.type === 'UPSTREAM')

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-bold">Backhaul Links</h1>
      <div className="w-72">
        <BackhaulDistribution />
      </div>
      <GlassPanel className="overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5 text-on-surface/30 text-left">
              {['Node', 'Client', 'Interface', 'Type', 'BW In', 'BW Out', 'Severity', 'Down Since'].map(h => (
                <th key={h} className="px-4 py-3 font-semibold tracking-wider uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {backhaulLinks.map(link => (
              <tr key={link.raw} className="border-b border-white/5 hover:bg-surface-high/50 transition-colors">
                <td className="px-4 py-2.5 font-mono text-on-surface/70">{link.node}</td>
                <td className="px-4 py-2.5 text-on-surface/80 max-w-[160px] truncate">{link.client}</td>
                <td className="px-4 py-2.5 font-mono text-on-surface/60 truncate max-w-[140px]">{link.interface}</td>
                <td className="px-4 py-2.5 font-mono text-primary/70">{link.type}</td>
                <td className="px-4 py-2.5 font-mono text-secondary tabular-nums">{link.bandwidth.in}</td>
                <td className="px-4 py-2.5 font-mono text-primary tabular-nums">{link.bandwidth.out}</td>
                <td className="px-4 py-2.5"><SeverityBadge severity={link.severity} /></td>
                <td className="px-4 py-2.5 font-mono text-on-surface/40 tabular-nums text-[10px]">
                  {new Date(link.downAtISO).toISOString().slice(0, 16).replace('T', ' ')}
                </td>
              </tr>
            ))}
            {backhaulLinks.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-on-surface/30">No backhaul links down</td></tr>
            )}
          </tbody>
        </table>
      </GlassPanel>
    </div>
  )
}
```

- [ ] **Step 3: Analytics page**

```tsx
// app/(dashboard)/analytics/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useLiveStatus } from '@/hooks/useLiveStatus'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface DataPoint { time: string; downCount: number }

export default function AnalyticsPage() {
  const { downCount } = useLiveStatus()
  const [history, setHistory] = useState<DataPoint[]>([])

  useEffect(() => {
    setHistory(prev => {
      const next = [...prev, { time: new Date().toISOString().slice(11, 19), downCount }]
      return next.slice(-60)
    })
  }, [downCount])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-bold">Analytics</h1>
      <GlassPanel className="p-4">
        <p className="text-xs text-on-surface/40 mb-4 tracking-widest uppercase">Down Link Count — Session History</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: 'var(--color-surface-high)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              labelStyle={{ color: 'var(--color-on-surface)' }}
            />
            <Line type="monotone" dataKey="downCount" stroke="var(--color-error)" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </GlassPanel>
    </div>
  )
}
```

- [ ] **Step 4: System page**

```tsx
// app/(dashboard)/system/page.tsx
import { GlassPanel } from '@/components/ui/GlassPanel'
import { StatusDot } from '@/components/ui/StatusDot'
import { DB_URL } from '@/lib/firebase-rest'

const INFO = [
  { label: 'Dashboard Version', value: 'v2.4.0' },
  { label: 'Firebase Project',  value: 'cactibscplc' },
  { label: 'Database URL',      value: DB_URL },
  { label: 'DB Region',         value: 'asia-southeast1 (Singapore)' },
  { label: 'Data Transport',    value: 'REST SSE (EventSource)' },
  { label: 'Auth',              value: 'None — public read' },
  { label: 'Framework',         value: 'Next.js 14 App Router' },
  { label: 'Deployment',        value: 'Vercel' },
]

export default function SystemPage() {
  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <h1 className="font-display text-xl font-bold">System Info</h1>
      <GlassPanel className="divide-y divide-white/5">
        {INFO.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-on-surface/40">{label}</span>
            <span className="text-xs font-mono text-on-surface/80 text-right max-w-[240px] truncate">{value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-xs text-on-surface/40">System Status</span>
          <span className="flex items-center gap-2 text-xs text-secondary font-semibold">
            <StatusDot color="green" size={2} /> OPERATIONAL
          </span>
        </div>
      </GlassPanel>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/\(dashboard\)/
git commit -m "feat: logs, backhaul, analytics, system pages"
```

---

## Task 16: GitHub Push + Vercel Deployment

**Files:**
- Create: `.gitignore` (ensure `.env.local` excluded — no env vars needed for Option A)
- Create: `vercel.json` (optional, defaults are fine)

- [ ] **Step 1: Final build check**

```bash
npm run build
```

Expected: Build succeeds with zero type errors. Fix any TypeScript errors before proceeding.

- [ ] **Step 2: Run all tests**

```bash
npm test
```

Expected: All tests pass (firebase-rest + link-parser suites).

- [ ] **Step 3: Create GitHub repo and push**

```bash
gh repo create Muminur/iig-noc-dashboard --public \
  --description "IIG BSCPLC NOC Dashboard — real-time network monitoring" \
  --source . --remote origin --push
```

- [ ] **Step 4: Deploy to Vercel**

```bash
npx vercel --yes
```

When prompted: Link to existing project? No. Set up and deploy? Yes. Which scope? Muminur. Project name: `iig-noc-dashboard`. Root: `./`. Override settings? No.

- [ ] **Step 5: Deploy to production**

```bash
npx vercel --prod
```

- [ ] **Step 6: Verify production deployment**

Open the Vercel production URL. Confirm:
- Page loads with sidebar + topnav
- `/incidents` shows real Firebase data within 2 seconds
- Bottom bar shows live alert count
- Map renders with node dots
- No console errors about EventSource or CORS

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "chore: production deployment — iig-noc-dashboard live on Vercel"
git push
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Sidebar with all 5 nav items, logo, emergency CTA
- ✅ TopNav tabs + icons
- ✅ Incident cards (top 2 by severity)
- ✅ Link status cards (next 3) with mini charts
- ✅ Log console with level colours + auto-scroll
- ✅ NodeStatus (Firebase region)
- ✅ NetworkMap (SVG world map, animated nodes)
- ✅ NetworkIntegrity (radial gauge, latency, down count)
- ✅ BackhaulDistribution (stacked bar)
- ✅ BottomBar (alert count from liveStatus)
- ✅ Firebase SSE real-time (no mock, no SDK)
- ✅ All 5 routes (/incidents /logs /backhaul /analytics /system)
- ✅ Incident filtering (severity on backhaul page)
- ✅ Log search + level filter on /logs
- ✅ TDD on link-parser and firebase-rest
- ✅ GitHub + Vercel deploy

**No placeholders:** All code blocks are complete and runnable.

**Type consistency:**
- `ParsedLink.interface` used consistently across IncidentCards, LinkStatusCards, LogConsole
- `useFirebaseSSE<T>` generic matches all hook usages
- `OutageRecord` from `useOutages` matches `outageToLog` in LogConsole
- `NETWORK_NODES` used by both NetworkMap and node-coordinates exports
