import type { Severity } from '@/lib/link-parser'

const styles: Record<Severity, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'rgba(255,180,171,0.15)', text: 'var(--color-error)',    border: 'rgba(255,180,171,0.3)' },
  HIGH:     { bg: 'rgba(255,231,226,0.15)', text: 'var(--color-tertiary)', border: 'rgba(255,231,226,0.3)' },
  MEDIUM:   { bg: 'rgba(251,191,36,0.15)',  text: 'var(--color-amber)',    border: 'rgba(251,191,36,0.3)'  },
  LOW:      { bg: 'rgba(226,226,232,0.1)',  text: 'var(--color-on-surface)', border: 'rgba(226,226,232,0.1)' },
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const s = styles[severity]
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded tracking-widest tabular-nums"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {severity}
    </span>
  )
}
