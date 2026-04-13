import type { Metadata } from 'next'
import { Inter, Space_Grotesk, Roboto_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'IIG BSCPLC NOC',
  description: 'Network Operations Center — Live Systems Telemetry',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${robotoMono.variable}`}
        style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-on-surface)' }}
      >
        {children}
      </body>
    </html>
  )
}
