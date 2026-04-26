import { useState } from 'react'
import { YOGA_POSES, BREATHING_TECHNIQUES, getPosesBySequence } from '@/data/yoga-poses'
import type { YogaPose, SequenceTag, BreathCategory, BreathingTechnique } from '@/data/yoga-poses'
import { Card } from '@/components/ui/Card'
import { Badge, DifficultyBadge } from '@/components/ui/Badge'
import { AnimatedPose, hasPoseAnim } from '@/components/modules/yoga/AnimatedPose'
import { BreathingAnimation } from '@/components/modules/yoga/BreathingAnimation'
import { BreathingTimer } from '@/components/modules/yoga/BreathingTimer'
import { SequencePlayer } from '@/components/modules/yoga/SequencePlayer'
import { ChallengeTracker } from '@/components/modules/yoga/ChallengeTracker'
import { SequenceBuilder } from '@/components/modules/yoga/SequenceBuilder'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, Wind, Drum, Play, Timer } from 'lucide-react'

type Tab = 'sequences' | 'poses' | 'challenge' | 'build' | 'breathing'

const TABS: { id: Tab; label: string }[] = [
  { id: 'sequences', label: 'Flow' },
  { id: 'poses', label: 'Poses' },
  { id: 'challenge', label: '30-Day' },
  { id: 'build', label: 'Build' },
  { id: 'breathing', label: 'Breath' },
]

const SEQUENCES: { tag: SequenceTag; label: string; description: string; highlight?: boolean }[] = [
  { tag: 'sun-salutation-A', label: 'Sun Salutation A', description: 'Classic 11-pose flow' },
  { tag: 'sun-salutation-B', label: 'Sun Salutation B', description: 'Extended flow with Warriors' },
  { tag: 'pre-workout', label: 'Pre-Workout Warm-Up', description: 'Dynamic warm-up before training' },
  { tag: 'rest-day', label: 'Rest Day Recovery', description: 'Full body restoration' },
  { tag: 'drumming-recovery', label: 'Drummer Recovery', description: 'Wrist, forearm & shoulder release', highlight: true },
  { tag: 'pitta-cooling', label: 'Pitta Cooling', description: 'Reduce heat and inflammation' },
  { tag: 'core', label: 'Core Sequence', description: 'Core strength and stability' },
]

export default function Yoga() {
  const [tab, setTab] = useState<Tab>('sequences')
  const [player, setPlayer] = useState<{ poses: YogaPose[]; name: string } | null>(null)

  return (
    <div className="page-container space-y-4">
      <div className="pt-2">
        <div className="text-[11px] uppercase tracking-widest text-noir-muted">Practice</div>
        <div className="text-[18px] uppercase tracking-wide text-noir-white">Yoga</div>
      </div>

      {/* Tab bar — scrollable */}
      <div className="flex border border-noir-border rounded-[2px] overflow-hidden">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 py-2 text-[10px] uppercase tracking-widest transition-colors border-r border-noir-border last:border-r-0 whitespace-nowrap',
              tab === t.id ? 'bg-noir-elevated text-noir-white' : 'text-noir-dim hover:text-noir-muted hover:bg-noir-elevated/30'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'sequences' && (
        <SequencesTab onPlay={(poses, name) => setPlayer({ poses, name })} />
      )}
      {tab === 'poses' && (
        <PosesTab onPlay={(poses, name) => setPlayer({ poses, name })} />
      )}
      {tab === 'challenge' && <ChallengeTracker />}
      {tab === 'build' && (
        <SequenceBuilder onPlay={(poses, name) => setPlayer({ poses, name })} />
      )}
      {tab === 'breathing' && <BreathingTab />}

      {player && (
        <SequencePlayer
          poses={player.poses}
          sequenceName={player.name}
          onClose={() => setPlayer(null)}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sequences Tab
// ---------------------------------------------------------------------------

function SequencesTab({ onPlay }: { onPlay: (poses: YogaPose[], name: string) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      {SEQUENCES.map(seq => {
        const poses = getPosesBySequence(seq.tag)
        const isExpanded = expanded === seq.tag
        return (
          <Card key={seq.tag} noPadding className={seq.highlight ? 'border-yellow-700/40' : undefined}>
            <button
              onClick={() => setExpanded(isExpanded ? null : seq.tag)}
              className="w-full text-left p-4 flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  {seq.highlight && <Drum size={12} className="text-yellow-600 shrink-0" />}
                  <div className="text-[13px] text-noir-accent">{seq.label}</div>
                </div>
                <div className="text-[11px] text-noir-dim mt-0.5">{seq.description}</div>
                <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-1">{poses.length} poses</div>
              </div>
              {isExpanded
                ? <ChevronDown size={14} className="text-noir-dim shrink-0 mt-1" />
                : <ChevronRight size={14} className="text-noir-dim shrink-0 mt-1" />
              }
            </button>

            {isExpanded && (
              <div className="border-t border-noir-border">
                {/* Play button */}
                <button
                  onClick={() => onPlay(poses, seq.label)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-b border-noir-border text-[11px] uppercase tracking-widest text-noir-accent hover:bg-noir-elevated transition-colors"
                >
                  <Play size={12} />
                  Start Sequence
                </button>

                <div className="divide-y divide-noir-border">
                  {poses.map((pose, i) => (
                    <PoseRow key={pose.id} pose={pose} index={i} />
                  ))}
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

function PoseRow({ pose, index }: { pose: YogaPose; index: number }) {
  return (
    <div className="px-4 py-3 flex items-start gap-3">
      <div className="text-[10px] text-noir-dim shrink-0 w-4 mt-1">{index + 1}</div>
      {hasPoseAnim(pose.id) && (
        <div className="shrink-0">
          <AnimatedPose poseId={pose.id} size="small" autoPlay />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[12px] text-noir-accent">{pose.name}</div>
            {pose.sanskritName && (
              <div className="text-[10px] text-noir-dim italic">{pose.sanskritName}</div>
            )}
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Badge variant="dim">{pose.duration}</Badge>
            <DifficultyBadge difficulty={pose.difficulty} />
          </div>
        </div>
        {pose.pittaNote && (
          <div className="mt-1.5 text-[11px] text-noir-dim border-l border-noir-strong pl-2">
            Pitta: {pose.pittaNote}
          </div>
        )}
        {pose.drummerNote && (
          <div className="mt-1 text-[11px] text-noir-dim border-l border-yellow-700/60 pl-2">
            Drummer: {pose.drummerNote}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Poses Tab
// ---------------------------------------------------------------------------

function PosesTab({ onPlay }: { onPlay: (poses: YogaPose[], name: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [showDrummerOnly, setShowDrummerOnly] = useState(false)

  const categories = ['all', ...Array.from(new Set(YOGA_POSES.map(p => p.category)))]
  let filtered = filter === 'all' ? YOGA_POSES : YOGA_POSES.filter(p => p.category === filter)
  if (showDrummerOnly) filtered = filtered.filter(p => p.drummerRecovery)

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              'px-2 py-0.5 border rounded-[2px] text-[10px] uppercase tracking-widest transition-colors',
              filter === cat
                ? 'border-noir-accent text-noir-white bg-noir-elevated'
                : 'border-noir-border text-noir-dim hover:border-noir-strong'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowDrummerOnly(!showDrummerOnly)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 border rounded-[2px] text-[10px] uppercase tracking-widest transition-colors',
          showDrummerOnly
            ? 'border-yellow-700/60 text-yellow-600 bg-yellow-900/10'
            : 'border-noir-border text-noir-dim hover:border-noir-strong'
        )}
      >
        <Drum size={10} />
        Drumming Recovery Only
      </button>

      <div className="space-y-1.5">
        {filtered.map(pose => (
          <div key={pose.id}>
            <button
              onClick={() => setSelected(selected === pose.id ? null : pose.id)}
              className={cn(
                'w-full text-left p-3 border rounded-[2px] transition-colors',
                selected === pose.id
                  ? 'border-noir-strong bg-noir-elevated'
                  : 'border-noir-border bg-noir-surface hover:border-noir-strong'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  {hasPoseAnim(pose.id) && (
                    <AnimatedPose poseId={pose.id} size="small" autoPlay />
                  )}
                  <div>
                    <span className="text-[13px] text-noir-accent">{pose.name}</span>
                    {pose.day && <span className="text-[10px] text-noir-dim ml-2">Day {pose.day}</span>}
                    <div className="text-[11px] text-noir-dim mt-0.5 capitalize">{pose.category} · {pose.duration}</div>
                  </div>
                </div>
                <DifficultyBadge difficulty={pose.difficulty} />
              </div>
            </button>

            {selected === pose.id && (
              <div className="mt-0.5 p-3 border border-noir-strong border-t-0 rounded-b-[2px] bg-noir-elevated space-y-3">
                {hasPoseAnim(pose.id) && (
                  <div className="flex justify-center py-2 border-b border-noir-border">
                    <AnimatedPose poseId={pose.id} size="large" autoPlay showArrows />
                  </div>
                )}

                {/* Pitta note — prominent */}
                {pose.pittaNote && (
                  <div className="border-l-2 border-noir-strong pl-3">
                    <div className="text-[9px] uppercase tracking-widest text-noir-dim mb-0.5">Pitta Note</div>
                    <p className="text-[12px] text-noir-muted">{pose.pittaNote}</p>
                  </div>
                )}

                <div>
                  <div className="text-[9px] uppercase tracking-widest text-noir-dim mb-1.5">Steps</div>
                  <ol className="space-y-1.5">
                    {pose.steps.map((step, i) => (
                      <li key={i} className="text-[12px] text-noir-muted flex gap-2">
                        <span className="text-noir-dim shrink-0">{i + 1}.</span>{step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <div className="text-[9px] uppercase tracking-widest text-noir-dim mb-1.5">Cues</div>
                  <ul className="space-y-1">
                    {pose.cues.map((cue, i) => (
                      <li key={i} className="text-[12px] text-noir-accent flex gap-2">
                        <span className="text-noir-dim">·</span>{cue}
                      </li>
                    ))}
                  </ul>
                </div>

                {pose.drummerNote && (
                  <div className="border-l-2 border-yellow-700/60 pl-3">
                    <div className="text-[9px] uppercase tracking-widest text-noir-dim mb-0.5">Drummer Note</div>
                    <p className="text-[12px] text-noir-muted">{pose.drummerNote}</p>
                  </div>
                )}

                <button
                  onClick={() => onPlay([pose], pose.name)}
                  className="w-full flex items-center justify-center gap-2 py-2 border border-noir-border rounded-[2px] text-[10px] uppercase tracking-widest text-noir-muted hover:border-noir-strong hover:text-noir-accent transition-colors"
                >
                  <Play size={11} />
                  Start Timer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Breathing Tab
// ---------------------------------------------------------------------------

const BREATH_FILTER_TABS: { id: BreathCategory | 'all'; label: string }[] = [
  { id: 'all',        label: 'All' },
  { id: 'cooling',    label: 'Cooling' },
  { id: 'energizing', label: 'Energizing' },
  { id: 'balancing',  label: 'Balancing' },
  { id: 'sleep',      label: 'Sleep' },
]

const PITTA_QUICK_IDS = ['sheetali', 'chandra-bhedana', 'box-breathing', '4-7-8']

function BreathingTab() {
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter]     = useState<BreathCategory | 'all'>('all')
  const [timer, setTimer]       = useState<BreathingTechnique | null>(null)

  const filtered = filter === 'all'
    ? BREATHING_TECHNIQUES
    : BREATHING_TECHNIQUES.filter(t => t.category === filter)

  const pittaQuick = PITTA_QUICK_IDS
    .map(id => BREATHING_TECHNIQUES.find(t => t.id === id))
    .filter((t): t is BreathingTechnique => Boolean(t))

  return (
    <div className="space-y-4">

      {/* Pitta quick-access row */}
      <div>
        <div className="text-[9px] uppercase tracking-widest text-noir-dim mb-2">Pitta Priority</div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {pittaQuick.map(t => (
            <button
              key={t.id}
              onClick={() => setTimer(t)}
              className="shrink-0 flex flex-col items-center gap-1 px-3 py-2 border border-noir-border rounded-[2px] hover:border-noir-strong transition-colors"
              style={{ minWidth: 80 }}
            >
              <Wind size={12} className="text-noir-dim" />
              <span className="text-[9px] uppercase tracking-widest text-noir-dim text-center leading-tight">
                {t.name.split('(')[0].trim()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {BREATH_FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              'px-2.5 py-0.5 border rounded-[2px] text-[10px] uppercase tracking-widest transition-colors',
              filter === tab.id
                ? 'border-noir-accent text-noir-white bg-noir-elevated'
                : 'border-noir-border text-noir-dim hover:border-noir-strong'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Technique cards */}
      <div className="space-y-2">
        {filtered.map(technique => (
          <div key={technique.id}>
            <button
              onClick={() => setSelected(selected === technique.id ? null : technique.id)}
              className={cn(
                'w-full text-left p-3 border rounded-[2px] transition-colors flex items-start gap-3',
                selected === technique.id
                  ? 'border-noir-strong bg-noir-elevated'
                  : 'border-noir-border bg-noir-surface hover:border-noir-strong'
              )}
            >
              <Wind size={14} className="text-noir-dim mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-[13px] text-noir-accent">{technique.name}</div>
                  <Badge variant="dim">{technique.type}</Badge>
                </div>
                <div className="text-[10px] text-noir-dim mt-0.5">{technique.dosha} · {technique.duration}</div>
              </div>
            </button>

            {selected === technique.id && (
              <div className="mt-0.5 p-3 border border-noir-strong border-t-0 rounded-b-[2px] bg-noir-elevated space-y-3">
                <div className="border-b border-noir-border">
                  <BreathingAnimation techniqueId={technique.id} />
                </div>
                <p className="text-[12px] text-noir-muted">{technique.description}</p>
                {technique.warning && (
                  <div className="px-3 py-2 border border-noir-red/30 rounded-[2px] bg-noir-red/5">
                    <p className="text-[11px] text-noir-red">{technique.warning}</p>
                  </div>
                )}
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-noir-dim mb-1.5">Steps</div>
                  <ol className="space-y-1.5">
                    {technique.steps.map((step, i) => (
                      <li key={i} className="text-[12px] text-noir-muted flex gap-2">
                        <span className="text-noir-dim shrink-0">{i + 1}.</span>{step}
                      </li>
                    ))}
                  </ol>
                </div>
                {technique.pittaNote && (
                  <div className="border-l-2 border-noir-strong pl-3">
                    <div className="text-[9px] uppercase tracking-widest text-noir-dim mb-0.5">Pitta Note</div>
                    <p className="text-[12px] text-noir-muted">{technique.pittaNote}</p>
                  </div>
                )}
                <button
                  onClick={() => setTimer(technique)}
                  className="w-full flex items-center justify-center gap-2 py-2 border border-noir-border rounded-[2px] text-[10px] uppercase tracking-widest text-noir-muted hover:border-noir-strong hover:text-noir-accent transition-colors"
                >
                  <Timer size={11} />
                  Start Timer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Drummer's breath note */}
      <div className="p-3 border border-yellow-700/30 rounded-[2px] bg-yellow-900/5 space-y-1">
        <div className="flex items-center gap-2">
          <Drum size={10} className="text-yellow-700 shrink-0" />
          <span className="text-[9px] uppercase tracking-widest text-yellow-700">Drummer's Breath Guide</span>
        </div>
        <p className="text-[11px] text-noir-dim leading-relaxed">
          Before heavy pull sessions — 5 rounds Box Breathing.
          Post-workout — Chandra Bhedana or Sheetali to cool down.
          Before drum practice — Ujjayi to focus without tension.
        </p>
      </div>

      {/* Breathing Timer overlay */}
      {timer && (
        <BreathingTimer technique={timer} onClose={() => setTimer(null)} />
      )}
    </div>
  )
}
