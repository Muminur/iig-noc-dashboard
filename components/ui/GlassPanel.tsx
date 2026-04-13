import { cn } from '@/lib/utils'

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  innerClassName?: string
  style?: React.CSSProperties
}

export function GlassPanel({ children, className, innerClassName, style }: GlassPanelProps) {
  return (
    <div
      style={style}
      className={cn(
        'relative rounded-[12px] shadow-[var(--shadow-glow)]',
        'backdrop-blur-xl overflow-hidden',
        className
      )}
    >
      {/* Glass gradient edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[12px]"
        style={{
          background: 'linear-gradient(135deg, rgba(195,245,255,0.08) 0%, transparent 60%)',
          backgroundBlendMode: 'overlay',
        }}
      />
      {/* Surface background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'rgba(58,60,64,0.6)', backdropFilter: 'blur(20px)' }}
      />
      <div className={cn('relative z-10', innerClassName)}>{children}</div>
    </div>
  )
}
