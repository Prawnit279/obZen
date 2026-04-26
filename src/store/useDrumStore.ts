import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DrumState = {
  metronome: {
    bpm: number
    isPlaying: boolean
    timeSignature: number
    accentBeat1: boolean
  }
  activeSessionId: number | null
  setBpm: (bpm: number) => void
  setMetronomePlaying: (playing: boolean) => void
  setTimeSignature: (ts: number) => void
  toggleAccentBeat1: () => void
  setActiveSessionId: (id: number | null) => void
}

export const useDrumStore = create<DrumState>()(
  persist(
    (set) => ({
      metronome: {
        bpm: 80,
        isPlaying: false,
        timeSignature: 4,
        accentBeat1: true,
      },
      activeSessionId: null,
      setBpm: (bpm) =>
        set(s => ({ metronome: { ...s.metronome, bpm: Math.min(300, Math.max(20, bpm)) } })),
      setMetronomePlaying: (playing) =>
        set(s => ({ metronome: { ...s.metronome, isPlaying: playing } })),
      setTimeSignature: (ts) =>
        set(s => ({ metronome: { ...s.metronome, timeSignature: ts } })),
      toggleAccentBeat1: () =>
        set(s => ({ metronome: { ...s.metronome, accentBeat1: !s.metronome.accentBeat1 } })),
      setActiveSessionId: (id) => set({ activeSessionId: id }),
    }),
    { name: 'obzen-drum' }
  )
)
