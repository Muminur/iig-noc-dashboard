type StatusColor = 'green' | 'red' | 'amber' | 'cyan'

const colorVar: Record<StatusColor, string> = {
  green: 'var(--color-secondary)',
  red:   'var(--color-error)',
  amber: 'var(--color-amber)',
  cyan:  'var(--color-primary)',
}

export function StatusDot({ color = 'green', size = 8 }: { color?: StatusColor; size?: number }) {
  const c = colorVar[color]
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-full animate-ping"
        style={{ background: c, opacity: 0.2 }}
      />
      <span
        className="relative inline-flex rounded-full"
        style={{ width: size, height: size, background: c }}
      />
    </span>
  )
}
