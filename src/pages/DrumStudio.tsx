import { useState, useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { RUDIMENTS, getRudimentsByFamily } from '@/data/rudiments'
import { DRUM_BOOKS } from '@/data/drum-lessons'
import { db } from '@/db/dexie'
import type { Song } from '@/db/dexie'
import { deleteSong } from '@/lib/drum'
import { MetronomeEngine } from '@/lib/metronome'
import { useDrumStore } from '@/store/useDrumStore'
import { getNotationForRudiment } from '@/data/rudiment-notation'
import type { NotationData } from '@/data/notation-types'
import { Card } from '@/components/ui/Card'
import { Badge, DifficultyBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { SongModal } from '@/components/modules/drum/SongModal'
import { PracticeSession } from '@/components/modules/drum/PracticeSession'
import { NotationViewer } from '@/components/modules/drum/NotationViewer'
import { NotationUpload, loadSavedNotation } from '@/components/modules/drum/NotationUpload'
import { DrumLibrary } from '@/components/modules/drum/DrumLibrary'
import { cn } from '@/lib/utils'
import { Minus, Plus, Play, Square, Trash2, Edit2, Music, Music2, Upload } from 'lucide-react'

type Tab = 'rudiments' | 'lessons' | 'songs' | 'metronome' | 'library'

export default function DrumStudio() {
  const [tab, setTab] = useState<Tab>('metronome')

  return (
    <div className="page-container space-y-4">
      <div className="pt-2">
        <div className="text-[11px] uppercase tracking-widest text-noir-muted">Practice</div>
        <div className="text-[18px] uppercase tracking-wide text-noir-white">Drum Studio</div>
      </div>

      <div className="flex border border-noir-border rounded-[2px] overflow-hidden">
        {(['metronome', 'rudiments', 'lessons', 'songs', 'library'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-[10px] uppercase tracking-widest transition-colors border-r border-noir-border last:border-r-0',
              tab === t
                ? 'bg-noir-elevated text-noir-white'
                : 'text-noir-dim hover:text-noir-muted hover:bg-noir-elevated/30'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'metronome' && <MetronomeTab />}
      {tab === 'rudiments' && <RudimentsTab />}
      {tab === 'lessons' && <LessonsTab />}
      {tab === 'songs' && <SongsTab />}
      {tab === 'library' && <DrumLibrary />}
    </div>
  )
}

// ─── Metronome Tab ────────────────────────────────────────────────────────────

function MetronomeTab() {
  const { metronome, setBpm, setMetronomePlaying, setTimeSignature, toggleAccentBeat1 } = useDrumStore()
  const { bpm, isPlaying, timeSignature, accentBeat1 } = metronome

  const engineRef = useRef<MetronomeEngine | null>(null)
  const [activeBeat, setActiveBeat] = useState<number | null>(null)

  useEffect(() => {
    if (!engineRef.current) engineRef.current = new MetronomeEngine()
    const eng = engineRef.current
    eng.bpm = bpm
    eng.timeSignature = timeSignature
    eng.accentBeat1 = accentBeat1
    eng.onBeat = (beat) => {
      setActiveBeat(beat)
      setTimeout(() => setActiveBeat(null), 80)
    }
  }, [bpm, timeSignature, accentBeat1])

  useEffect(() => {
    if (!engineRef.current) return
    if (isPlaying) engineRef.current.start()
    else { engineRef.current.stop(); setActiveBeat(null) }
  }, [isPlaying])

  useEffect(() => { return () => { engineRef.current?.destroy() } }, [])

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            {Array.from({ length: timeSignature }).map((_, i) => (
              <div key={i} className={cn(
                'rounded-full transition-all duration-75',
                activeBeat === i
                  ? i === 0 ? 'w-4 h-4 bg-noir-white' : 'w-3 h-3 bg-noir-accent'
                  : 'w-2.5 h-2.5 bg-noir-border'
              )} />
            ))}
          </div>
          <div className="text-[56px] text-noir-white font-light tracking-tight leading-none">{bpm}</div>
          <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-1">BPM</div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={() => setBpm(bpm - 5)} className="p-3 border border-noir-border rounded-[2px] text-noir-muted hover:border-noir-strong hover:text-noir-accent transition-colors"><Minus size={16} /></button>
          <div className="flex gap-1.5">
            {[-1, 1].map(d => (
              <button key={d} onClick={() => setBpm(bpm + d)} className="px-3 py-2 border border-noir-border rounded-[2px] text-[11px] text-noir-muted hover:border-noir-strong hover:text-noir-accent transition-colors">
                {d > 0 ? '+1' : '−1'}
              </button>
            ))}
          </div>
          <button onClick={() => setBpm(bpm + 5)} className="p-3 border border-noir-border rounded-[2px] text-noir-muted hover:border-noir-strong hover:text-noir-accent transition-colors"><Plus size={16} /></button>
        </div>

        <div className="mt-4 px-1">
          <input type="range" min={20} max={300} value={bpm} onChange={e => setBpm(parseInt(e.target.value, 10))} className="w-full accent-noir-accent" />
          <div className="flex justify-between text-[9px] text-noir-dim mt-0.5"><span>20</span><span>160</span><span>300</span></div>
        </div>

        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-widest text-noir-dim mb-2">Time Signature</div>
          <div className="flex gap-1.5">
            {[2, 3, 4, 5, 6, 7].map(ts => (
              <button key={ts} onClick={() => setTimeSignature(ts)}
                className={cn('flex-1 py-1.5 border rounded-[2px] text-[11px] uppercase tracking-widest transition-colors',
                  timeSignature === ts ? 'border-noir-accent text-noir-white bg-noir-elevated' : 'border-noir-border text-noir-dim hover:border-noir-strong')}>
                {ts}/4
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] text-noir-muted">Accent Beat 1</span>
          <button onClick={toggleAccentBeat1} className={cn('w-10 h-5 rounded-full border transition-colors flex items-center', accentBeat1 ? 'border-noir-accent bg-noir-accent/20' : 'border-noir-border')}>
            <div className={cn('w-3.5 h-3.5 rounded-full bg-noir-accent transition-transform mx-0.5', accentBeat1 ? 'translate-x-5' : 'translate-x-0')} />
          </button>
        </div>

        <button onClick={() => setMetronomePlaying(!isPlaying)}
          className={cn('w-full mt-5 py-3 border rounded-[2px] text-[12px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2',
            isPlaying ? 'border-noir-accent text-noir-accent hover:bg-noir-accent/10' : 'border-noir-border text-noir-muted hover:border-noir-strong hover:text-noir-accent')}>
          {isPlaying ? <Square size={14} /> : <Play size={14} />}
          {isPlaying ? 'Stop' : 'Start'}
        </button>
      </Card>

      <PracticeSession currentBpm={bpm} onComplete={() => setMetronomePlaying(false)} />
    </div>
  )
}

// ─── Rudiments Tab ────────────────────────────────────────────────────────────

function RudimentsTab() {
  const [selected, setSelected] = useState<string | null>(null)
  const [notationModal, setNotationModal] = useState<string | null>(null)
  const families = [...new Set(RUDIMENTS.map(r => r.family))]

  const getNotation = (rudimentId: string): NotationData | null => {
    // Check pre-seeded first
    const preseeded = getNotationForRudiment(rudimentId)
    if (preseeded) return preseeded
    // Check localStorage saved
    return loadSavedNotation(rudimentId)
  }

  return (
    <div className="space-y-4">
      {families.map(family => {
        const rudiments = getRudimentsByFamily(family)
        return (
          <div key={family}>
            <div className="text-[10px] uppercase tracking-widest text-noir-muted mb-2 capitalize">
              {family.replace(/-/g, ' ')} ({rudiments.length})
            </div>
            <div className="space-y-1.5">
              {rudiments.map(r => (
                <div key={r.id}>
                  <button
                    onClick={() => setSelected(selected === r.id ? null : r.id)}
                    className={cn('w-full text-left p-3 border rounded-[2px] transition-colors',
                      selected === r.id ? 'border-noir-strong bg-noir-elevated' : 'border-noir-border bg-noir-surface hover:border-noir-strong')}>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-noir-accent">{r.name}</span>
                      <DifficultyBadge difficulty={r.difficulty} />
                    </div>
                    <div className="text-[11px] text-noir-dim font-mono mt-1">{r.notation}</div>
                  </button>

                  {selected === r.id && (
                    <div className="p-3 bg-noir-elevated border border-noir-strong border-t-0 rounded-b-[2px] space-y-3">
                      <p className="text-[12px] text-noir-muted">{r.description}</p>
                      <div className="flex gap-3">
                        <div>
                          <div className="text-[9px] uppercase tracking-widest text-noir-dim mb-1">BPM Range</div>
                          <div className="text-[13px] text-noir-accent">{r.bpmRange.min} – {r.bpmRange.max}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-widest text-noir-dim mb-1.5">Practice Tips</div>
                        <ul className="space-y-1">
                          {r.tips.map((tip, i) => (
                            <li key={i} className="text-[12px] text-noir-muted flex gap-2">
                              <span className="text-noir-dim shrink-0">{i + 1}.</span>{tip}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Notation viewer */}
                      {getNotation(r.id) ? (
                        <div>
                          <div className="text-[9px] uppercase tracking-widest text-noir-dim mb-2">Notation</div>
                          <NotationViewer data={getNotation(r.id)!} />
                        </div>
                      ) : (
                        <button
                          onClick={() => setNotationModal(r.id)}
                          className="w-full py-2 border border-dashed border-noir-border rounded-[2px] text-[10px] uppercase tracking-widest text-noir-dim hover:border-noir-strong hover:text-noir-muted transition-colors flex items-center justify-center gap-2">
                          <Music2 size={12} />
                          Add Notation
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Notation upload modal */}
      {notationModal && (
        <Modal open title="Add Notation" onClose={() => setNotationModal(null)}>
          <NotationUpload
            lessonId={notationModal}
            onSaved={() => setNotationModal(null)}
          />
        </Modal>
      )}
    </div>
  )
}

// ─── Lessons Tab ──────────────────────────────────────────────────────────────

function LessonsTab() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [uploadModal, setUploadModal] = useState<{ lessonId: string; title: string } | null>(null)
  const [notationMap, setNotationMap] = useState<Record<string, NotationData>>({})

  const handleNotationSaved = (lessonId: string, data: NotationData) => {
    setNotationMap(prev => ({ ...prev, [lessonId]: data }))
    setUploadModal(null)
  }

  return (
    <div className="space-y-3">
      {DRUM_BOOKS.map(book => (
        <Card key={book.id} noPadding>
          <button onClick={() => setExpanded(expanded === book.id ? null : book.id)} className="w-full text-left p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[13px] text-noir-accent">{book.title}</div>
                <div className="text-[11px] text-noir-muted">{book.author}</div>
              </div>
              <Badge variant="dim">{book.lessons.length} lessons</Badge>
            </div>
            <div className="text-[11px] text-noir-dim mt-1">{book.focus}</div>
          </button>

          {expanded === book.id && (
            <div className="border-t border-noir-border divide-y divide-noir-border">
              {book.lessons.map(lesson => {
                const notation = notationMap[lesson.id] ?? loadSavedNotation(lesson.id)
                return (
                  <div key={lesson.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-[12px] text-noir-accent">{lesson.concept}</div>
                        <div className="text-[11px] text-noir-dim mt-0.5">{lesson.exerciseRef}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DifficultyBadge difficulty={lesson.difficulty} />
                        <button
                          onClick={() => setUploadModal({ lessonId: lesson.id, title: lesson.concept })}
                          className="p-1 text-noir-dim hover:text-noir-muted transition-colors"
                          title="Add notation from PDF or text">
                          <Upload size={11} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-noir-dim">Goal: </span>
                      <span className="text-[11px] text-noir-muted">{lesson.practiceGoal}</span>
                    </div>
                    {lesson.bpmTarget && (
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-noir-dim">Target: </span>
                        <span className="text-[11px] text-noir-accent">{lesson.bpmTarget} BPM</span>
                      </div>
                    )}
                    {notation && (
                      <NotationViewer data={notation} />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      ))}

      {uploadModal && (
        <Modal open title="Add Notation" onClose={() => setUploadModal(null)}>
          <div className="text-[11px] text-noir-muted mb-3">{uploadModal.title}</div>
          <NotationUpload
            lessonId={uploadModal.lessonId}
            onSaved={(data) => handleNotationSaved(uploadModal.lessonId, data)}
          />
        </Modal>
      )}
    </div>
  )
}

// ─── Songs Tab ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<Song['status'], 'dim' | 'accent'> = {
  learning: 'dim',
  ready: 'accent',
  performed: 'accent',
}

function SongsTab() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Song | undefined>(undefined)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [filter, setFilter] = useState<Song['status'] | 'all'>('all')

  const songs = useLiveQuery(() => db.songs.orderBy('title').toArray(), [])
  const filtered = songs?.filter(s => filter === 'all' || s.status === filter) ?? []

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {(['all', 'learning', 'ready', 'performed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-2.5 py-1 border rounded-[2px] text-[9px] uppercase tracking-widest transition-colors',
                filter === f ? 'border-noir-accent text-noir-white bg-noir-elevated' : 'border-noir-border text-noir-dim hover:border-noir-strong')}>
              {f}
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={() => { setEditing(undefined); setModalOpen(true) }}>
          <Plus size={13} className="inline mr-1" />Add
        </Button>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 space-y-2">
          <Music size={24} className="text-noir-dim mx-auto" />
          <div className="text-[12px] text-noir-muted">
            {songs?.length === 0 ? 'No songs yet. Add your first.' : 'No songs in this category.'}
          </div>
        </div>
      )}

      {filtered.map(song => (
        <Card key={song.id}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] text-noir-accent truncate">{song.title}</span>
                <Badge variant={STATUS_COLORS[song.status]}>{song.status}</Badge>
                <Badge variant="dim">{song.purpose}</Badge>
              </div>
              {song.artist && <div className="text-[11px] text-noir-muted mt-0.5">{song.artist}</div>}
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {song.bpm && <span className="text-[10px] text-noir-dim">{song.bpm} BPM</span>}
                {song.timeSignature && <span className="text-[10px] text-noir-dim">{song.timeSignature}</span>}
              </div>
              {song.notes && <div className="text-[11px] text-noir-dim mt-1.5 border-l border-noir-strong pl-2">{song.notes}</div>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => { setEditing(song); setModalOpen(true) }} className="p-1.5 text-noir-dim hover:text-noir-muted transition-colors" aria-label="Edit"><Edit2 size={12} /></button>
              {confirmDelete === song.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => { deleteSong(song.id!); setConfirmDelete(null) }} className="text-[10px] text-noir-red uppercase tracking-widest px-1.5 py-0.5 border border-noir-red/40 rounded-[2px]">Confirm</button>
                  <button onClick={() => setConfirmDelete(null)} className="text-[10px] text-noir-dim uppercase tracking-widest">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(song.id!)} className="p-1.5 text-noir-dim hover:text-noir-red transition-colors" aria-label="Delete"><Trash2 size={12} /></button>
              )}
            </div>
          </div>
        </Card>
      ))}

      <SongModal open={modalOpen} existing={editing} onClose={() => setModalOpen(false)} onSaved={() => setModalOpen(false)} />
    </div>
  )
}
