type BeatCallback = (beat: number) => void

export class MetronomeEngine {
  private audioCtx: AudioContext | null = null
  private nextBeatTime = 0
  private beatNumber = 0
  private schedulerHandle: ReturnType<typeof setInterval> | null = null

  private readonly lookaheadMs = 25
  private readonly scheduleAheadSec = 0.1

  bpm = 80
  timeSignature = 4
  accentBeat1 = true
  onBeat: BeatCallback | null = null

  get isRunning() {
    return this.schedulerHandle !== null
  }

  start() {
    if (this.isRunning) return
    if (!this.audioCtx) this.audioCtx = new AudioContext()
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume()
    this.beatNumber = 0
    this.nextBeatTime = this.audioCtx.currentTime + 0.05
    this.schedulerHandle = setInterval(() => this.tick(), this.lookaheadMs)
  }

  stop() {
    if (this.schedulerHandle !== null) {
      clearInterval(this.schedulerHandle)
      this.schedulerHandle = null
    }
  }

  private tick() {
    if (!this.audioCtx) return
    while (this.nextBeatTime < this.audioCtx.currentTime + this.scheduleAheadSec) {
      this.scheduleClick(this.beatNumber, this.nextBeatTime)
      this.advance()
    }
  }

  private scheduleClick(beat: number, time: number) {
    if (!this.audioCtx) return
    const isAccent = this.accentBeat1 && beat === 0
    const freq = isAccent ? 1000 : 800
    const volume = isAccent ? 0.8 : 0.5

    const osc = this.audioCtx.createOscillator()
    const gain = this.audioCtx.createGain()
    osc.connect(gain)
    gain.connect(this.audioCtx.destination)
    osc.frequency.value = freq
    gain.gain.setValueAtTime(volume, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06)
    osc.start(time)
    osc.stop(time + 0.06)

    // Fire visual callback timed to approximate beat
    const delayMs = (time - this.audioCtx.currentTime) * 1000
    setTimeout(() => { this.onBeat?.(beat) }, Math.max(0, delayMs))
  }

  private advance() {
    this.nextBeatTime += 60 / this.bpm
    this.beatNumber = (this.beatNumber + 1) % this.timeSignature
  }

  destroy() {
    this.stop()
    this.audioCtx?.close()
    this.audioCtx = null
  }
}
