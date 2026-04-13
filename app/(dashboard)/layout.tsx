import { Sidebar } from '@/components/layout/Sidebar'
import { TopNav } from '@/components/layout/TopNav'
import { BottomBar } from '@/components/BottomBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen dot-grid"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <Sidebar />
      <div className="flex flex-col min-h-screen" style={{ marginLeft: '220px' }}>
        <TopNav />
        <main className="flex-1 p-5 pb-16">{children}</main>
      </div>
      <BottomBar />
    </div>
  )
}
