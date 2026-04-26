import { useEffect, useRef } from 'react'
import type { NotationData, NotationNote } from '@/data/notation-types'
import { PITCH_KEYS, X_NOTEHEAD_PITCHES } from '@/data/notation-types'
import { MetronomeEngine } from '@/lib/metronome'

interface Props {
  data: NotationData
}

// Lazily build a click engine for tap-to-hear
let _clickEngine: MetronomeEngine | null = null
function playClick() {
  if (!_clickEngine) {
    _clickEngine = new MetronomeEngine()
    _clickEngine.bpm = 120
    _clickEngine.timeSignature = 1
    _clickEngine.accentBeat1 = false
  }
  // One-shot click via AudioContext directly
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = 900
  gain.gain.setValueAtTime(0.5, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.06)
}

export function NotationViewer({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Dynamically import VexFlow to avoid SSR issues and reduce initial bundle
    import('vexflow').then(({ Renderer, Stave, StaveNote, Voice, Formatter, Annotation, Articulation }) => {
      container.innerHTML = ''

      const STAVE_W = 300
      const STAVE_H = 80
      const PAD_X = 12
      const PAD_Y = 30
      const totalWidth = data.measures.length * STAVE_W + PAD_X * 2

      const renderer = new Renderer(container, Renderer.Backends.SVG)
      renderer.resize(totalWidth, STAVE_H + PAD_Y * 2)

      const context = renderer.getContext()
      context.setFont('Arial', 9)
      // Set overall SVG color
      const svgEl = container.querySelector('svg')
      if (svgEl) {
        svgEl.style.background = '#0a0a0a'
      }

      let x = PAD_X

      data.measures.forEach((measure, mIdx) => {
        const isFirst = mIdx === 0
        const stave = new Stave(x, PAD_Y, STAVE_W)
        stave.setStyle({ fillStyle: '#f0f0f0', strokeStyle: '#f0f0f0' })

        if (isFirst) {
          stave.addClef('percussion')
          stave.addTimeSignature(`${data.timeSignature.beats}/${data.timeSignature.value}`)
        }
        stave.setContext(context).draw()

        // Build VexFlow notes
        const vfNotes = measure.notes.map((note: NotationNote) => {
          const key = PITCH_KEYS[note.pitch]
          const dur = note.rest ? `${note.duration}r` : note.duration
          const isX = X_NOTEHEAD_PITCHES.includes(note.pitch)

          const staveNote = new StaveNote({
            keys: [key],
            duration: dur,
            type: isX ? 'x' : 'n',
          })
          staveNote.setStyle({ fillStyle: '#f0f0f0', strokeStyle: '#f0f0f0' })

          if (note.accent) {
            try {
              staveNote.addModifier(new Articulation('a>').setPosition(3))
            } catch { /* skip if articulation fails */ }
          }

          if (note.sticking && !note.rest) {
            const label = note.flam ? `*${note.sticking}` : note.drag ? `~${note.sticking}` : note.sticking
            const ann = new Annotation(label)
              .setFont('Arial', 8, 'normal')
              .setVerticalJustification(3) // BOTTOM
            ann.setStyle({ fillStyle: '#555555', strokeStyle: '#555555' })
            staveNote.addModifier(ann)
          }

          return staveNote
        })

        try {
          const voice = new Voice({
            numBeats: data.timeSignature.beats,
            beatValue: data.timeSignature.value,
          }).setMode(2) // SOFT mode — don't throw on beat count mismatch
          voice.addTickables(vfNotes)

          new Formatter().joinVoices([voice]).format([voice], STAVE_W - 30)
          voice.draw(context, stave)
        } catch {
          // If voice fails, skip this measure silently
        }

        x += STAVE_W
      })

      // Restyle all generated SVG elements to white-on-black
      container.querySelectorAll('svg path, svg rect, svg polygon').forEach(el => {
        const htmlEl = el as SVGElement
        const fill = htmlEl.getAttribute('fill')
        const stroke = htmlEl.getAttribute('stroke')
        if (fill && fill !== 'none' && fill !== '#555555') htmlEl.setAttribute('fill', '#f0f0f0')
        if (stroke && stroke !== 'none' && stroke !== '#555555') htmlEl.setAttribute('stroke', '#f0f0f0')
      })
      container.querySelectorAll('svg text').forEach(el => {
        const htmlEl = el as SVGElement
        const fill = htmlEl.getAttribute('fill')
        if (fill !== '#555555') {
          htmlEl.setAttribute('fill', '#d4d4d4')
        }
      })
    })
  }, [data])

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as SVGElement
    if (target.closest('.vf-stavenote')) {
      playClick()
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-noir-dim">{data.title}</span>
        <span className="text-[10px] text-noir-dim">{data.tempo} BPM · {data.timeSignature.beats}/{data.timeSignature.value}</span>
      </div>
      <div
        className="overflow-x-auto rounded-[2px] border border-noir-border cursor-pointer select-none"
        onClick={handleContainerClick}
        title="Tap a note to hear a click"
      >
        <div ref={containerRef} />
      </div>
      <div className="text-[9px] text-noir-dim">* = flam  ~ = drag  &gt; = accent · tap note to hear click</div>
    </div>
  )
}
