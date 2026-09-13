/**
 * The metronome's scheduler.
 *
 * It schedules clicks ahead of the audio clock rather than firing them on a
 * timer, which is the only way to get steady time out of a browser — but it
 * means nothing here can be observed by waiting. jsdom has no Web Audio at all,
 * so the clock is a stub whose `currentTime` this file advances by hand, and
 * every assertion is about what was scheduled and when.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MetronomeEngine } from '@/lib/metronome'

// ── A controllable audio clock ───────────────────────────────────────────────

interface ScheduledClick {
  freq: number
  volume: number
  at: number
}

class FakeAudioContext {
  currentTime = 0
  state: 'running' | 'suspended' = 'running'
  destination = {}
  clicks: ScheduledClick[] = []
  resumed = 0
  closed = 0

  private pending: { freq: number; volume?: number; at?: number } | null = null

  createOscillator() {
    const osc = {
      frequency: { value: 0 },
      connect: () => {},
      start: (at: number) => {
        this.clicks.push({ freq: osc.frequency.value, volume: this.pending?.volume ?? 0, at })
        this.pending = null
      },
      stop: () => {},
    }
    return osc
  }

  createGain() {
    return {
      gain: {
        setValueAtTime: (volume: number) => { this.pending = { ...(this.pending ?? { freq: 0 }), volume } },
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => {},
    }
  }

  resume() { this.resumed++; this.state = 'running' }
  close() { this.closed++; return Promise.resolve() }
}

let ctx: FakeAudioContext

beforeEach(() => {
  vi.useFakeTimers()
  ctx = new FakeAudioContext()
  vi.stubGlobal('AudioContext', vi.fn(() => ctx))
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

/** Move the audio clock and the timers together, as real time would. */
function elapse(seconds: number) {
  const stepMs = 25
  for (let done = 0; done < seconds * 1000; done += stepMs) {
    ctx.currentTime += stepMs / 1000
    vi.advanceTimersByTime(stepMs)
  }
}

// ── Running state ────────────────────────────────────────────────────────────

describe('starting and stopping', () => {
  it('is not running until started', () => {
    expect(new MetronomeEngine().isRunning).toBe(false)
  })

  it('runs after start and stops after stop', () => {
    const m = new MetronomeEngine()
    m.start()
    expect(m.isRunning).toBe(true)
    m.stop()
    expect(m.isRunning).toBe(false)
  })

  it('ignores a second start rather than running two schedulers', () => {
    // Two intervals would schedule every click twice, an octave of flam.
    const m = new MetronomeEngine()
    m.start()
    m.start()
    elapse(1)
    const beats = ctx.clicks.length
    m.stop()

    const single = new MetronomeEngine()
    single.start()
    elapse(1)
    expect(ctx.clicks.length - beats).toBe(beats)
    single.stop()
  })

  it('does not throw when stopped without being started', () => {
    expect(() => new MetronomeEngine().stop()).not.toThrow()
  })

  it('schedules nothing further once stopped', () => {
    const m = new MetronomeEngine()
    m.start()
    elapse(1)
    const atStop = ctx.clicks.length
    m.stop()
    elapse(2)
    expect(ctx.clicks.length).toBe(atStop)
  })

  it('wakes a suspended context, as a browser hands it over after a gesture', () => {
    ctx.state = 'suspended'
    const m = new MetronomeEngine()
    m.start()
    expect(ctx.resumed).toBe(1)
    m.stop()
  })

  it('builds the audio clock once and reuses it across restarts', () => {
    const m = new MetronomeEngine()
    m.start(); m.stop(); m.start(); m.stop()
    expect((globalThis.AudioContext as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1)
  })
})

// ── Tempo ────────────────────────────────────────────────────────────────────

describe('tempo', () => {
  it('spaces clicks by the beat length the bpm asks for', () => {
    const m = new MetronomeEngine()
    m.bpm = 120                       // half a second a beat
    m.start()
    elapse(2)
    m.stop()

    expect(ctx.clicks.length).toBeGreaterThanOrEqual(4)
    const gaps = ctx.clicks.slice(1).map((c, i) => c.at - ctx.clicks[i].at)
    for (const gap of gaps) expect(gap).toBeCloseTo(0.5, 5)
  })

  it('plays a faster tempo more often over the same stretch', () => {
    const slow = new MetronomeEngine()
    slow.bpm = 60
    slow.start(); elapse(4); slow.stop()
    const slowCount = ctx.clicks.length

    ctx.clicks.length = 0
    ctx.currentTime = 0
    const fast = new MetronomeEngine()
    fast.bpm = 180
    fast.start(); elapse(4); fast.stop()

    expect(ctx.clicks.length).toBeGreaterThan(slowCount * 2)
  })

  it('schedules ahead of the clock, never behind it', () => {
    // The whole point of the design: a click is queued before it is due, so a
    // busy main thread cannot make it late.
    const m = new MetronomeEngine()
    m.bpm = 100
    m.start()
    elapse(1)
    m.stop()
    for (const click of ctx.clicks) expect(click.at).toBeGreaterThan(0)
  })
})

// ── Accent ───────────────────────────────────────────────────────────────────

describe('the downbeat', () => {
  it('marks beat one louder and higher than the rest', () => {
    const m = new MetronomeEngine()
    m.bpm = 240
    m.timeSignature = 4
    m.start()
    elapse(2)
    m.stop()

    const [first, second] = ctx.clicks
    expect(first.freq).toBe(1000)
    expect(second.freq).toBe(800)
    expect(first.volume).toBeGreaterThan(second.volume)
  })

  it('accents once per bar, at the length of the bar', () => {
    const m = new MetronomeEngine()
    m.bpm = 240
    m.timeSignature = 3
    m.start()
    elapse(2)
    m.stop()

    const pattern = ctx.clicks.slice(0, 6).map(c => c.freq)
    expect(pattern).toEqual([1000, 800, 800, 1000, 800, 800])
  })

  it('leaves every beat equal when the accent is switched off', () => {
    const m = new MetronomeEngine()
    m.bpm = 240
    m.accentBeat1 = false
    m.start()
    elapse(1)
    m.stop()

    expect(ctx.clicks.length).toBeGreaterThan(1)
    expect(new Set(ctx.clicks.map(c => c.freq))).toEqual(new Set([800]))
  })

  it('restarts the bar from beat one', () => {
    const m = new MetronomeEngine()
    m.bpm = 240
    m.timeSignature = 4
    m.start(); elapse(0.6); m.stop()       // stop mid-bar
    ctx.clicks.length = 0
    m.start(); elapse(0.3); m.stop()

    expect(ctx.clicks[0].freq).toBe(1000)
  })
})

// ── The visual callback ──────────────────────────────────────────────────────

describe('onBeat', () => {
  it('reports beats in bar order', () => {
    const seen: number[] = []
    const m = new MetronomeEngine()
    m.bpm = 240
    m.timeSignature = 4
    m.onBeat = beat => seen.push(beat)
    m.start()
    elapse(2)
    m.stop()

    expect(seen.length).toBeGreaterThan(4)
    expect(seen.slice(0, 5)).toEqual([0, 1, 2, 3, 0])
  })

  it('runs happily with no listener attached', () => {
    const m = new MetronomeEngine()
    m.start()
    expect(() => elapse(1)).not.toThrow()
    m.stop()
  })
})

// ── Teardown ─────────────────────────────────────────────────────────────────

describe('destroy', () => {
  it('stops the scheduler and closes the audio clock', () => {
    const m = new MetronomeEngine()
    m.start()
    m.destroy()

    expect(m.isRunning).toBe(false)
    expect(ctx.closed).toBe(1)
  })

  it('is safe to call on an engine that never started', () => {
    expect(() => new MetronomeEngine().destroy()).not.toThrow()
    expect(ctx.closed).toBe(0)
  })

  it('can be started again afterwards, on a fresh clock', () => {
    const m = new MetronomeEngine()
    m.start()
    m.destroy()
    m.start()
    expect(m.isRunning).toBe(true)
    expect((globalThis.AudioContext as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(2)
    m.stop()
  })
})
