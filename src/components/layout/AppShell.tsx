import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { SpeechUI } from '@/components/speech/SpeechUI'

interface Props {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  return (
    <div className="flex h-full overflow-hidden bg-noir-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
      <BottomNav />
      <SpeechUI />
    </div>
  )
}
