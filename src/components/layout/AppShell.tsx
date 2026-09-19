import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

interface Props {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  return (
    <div className="flex h-full overflow-hidden bg-noir-bg">
      {/* Something behind the status bar.
          `apple-mobile-web-app-status-bar-style` is `black-translucent` and the
          viewport is `viewport-fit=cover`, so the clock and battery are painted
          straight onto the page. `.page-container` pads itself past the inset,
          which keeps the first screenful clear — but it is also the scroller,
          so anything scrolled up passes under the status bar with nothing
          between them and the title ends up sharing a line with the time.

          The bottom nav has always painted its own inset for exactly this
          reason; this is the same thing at the top. Zero height wherever there
          is no inset to clear, so it costs nothing on a desktop or a phone
          without a notch. `z-40` matches the nav: above the page, below the
          sheets at `z-50`, which are meant to cover the whole screen. */}
      <div
        aria-hidden
        className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
        style={{ height: 'env(safe-area-inset-top)', background: 'var(--bg)' }}
      />
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
