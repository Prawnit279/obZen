import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { HardDrive, Trash2, ImageIcon, CheckCircle2 } from 'lucide-react'
import { db } from '@/db/dexie'
import type { CachedImage } from '@/db/dexie'
import { Button } from './Button'
import { cn } from '@/lib/utils'

type ImageType = CachedImage['type']

const TYPE_LABELS: Record<ImageType, string> = {
  yoga:      'Yoga Poses',
  rudiment:  'Rudiments',
  exercise:  'Exercises',
  ayurveda:  'Ayurveda',
  vedic:     'Vedic',
  progress:  'Progress',
}

const TYPE_ORDER: ImageType[] = ['yoga', 'rudiment', 'exercise', 'ayurveda', 'vedic', 'progress']

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function StoragePanel() {
  const [clearing, setClearing] = useState<ImageType | 'all' | null>(null)
  const [cleared, setCleared] = useState<string | null>(null)

  const images = useLiveQuery(() => db.cachedImages.toArray(), [])

  const stats = (images ?? []).reduce<Record<ImageType, { count: number; size: number }>>(
    (acc, img) => {
      if (!acc[img.type]) acc[img.type] = { count: 0, size: 0 }
      acc[img.type].count += 1
      acc[img.type].size  += img.size
      return acc
    },
    {} as Record<ImageType, { count: number; size: number }>
  )

  const totalCount = Object.values(stats).reduce((s, v) => s + v.count, 0)
  const totalSize  = Object.values(stats).reduce((s, v) => s + v.size, 0)

  async function clearByType(type: ImageType) {
    setClearing(type)
    try {
      await db.cachedImages.where('type').equals(type).delete()
      setCleared(TYPE_LABELS[type])
      setTimeout(() => setCleared(null), 2000)
    } finally {
      setClearing(null)
    }
  }

  async function clearAll() {
    setClearing('all')
    try {
      await db.cachedImages.clear()
      setCleared('All cache')
      setTimeout(() => setCleared(null), 2000)
    } finally {
      setClearing(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Summary row */}
      <div className="flex items-center gap-3 p-3 bg-noir-elevated border border-noir-border rounded-[2px]">
        <HardDrive size={14} className="text-noir-dim shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[12px] text-noir-accent">
            {totalCount} cached image{totalCount !== 1 ? 's' : ''}
          </div>
          <div className="text-[10px] text-noir-dim">{formatBytes(totalSize)} estimated</div>
        </div>
        {cleared && (
          <div className="flex items-center gap-1 text-[10px] text-green-400">
            <CheckCircle2 size={11} />
            <span>{cleared} cleared</span>
          </div>
        )}
      </div>

      {/* Per-type rows */}
      {TYPE_ORDER.map(type => {
        const s = stats[type]
        if (!s) return null
        return (
          <div key={type} className="flex items-center gap-2 text-[12px]">
            <ImageIcon size={11} className="text-noir-dim shrink-0" />
            <span className="flex-1 text-noir-muted">{TYPE_LABELS[type]}</span>
            <span className="text-noir-dim tabular-nums">{s.count}</span>
            <span className="text-noir-dim tabular-nums w-16 text-right">{formatBytes(s.size)}</span>
            <button
              onClick={() => clearByType(type)}
              disabled={clearing !== null}
              aria-label={`Clear ${TYPE_LABELS[type]} cache`}
              className={cn(
                'p-1 text-noir-dim hover:text-noir-red transition-colors',
                clearing !== null && 'opacity-40 pointer-events-none'
              )}>
              <Trash2 size={11} />
            </button>
          </div>
        )
      })}

      {/* Empty state */}
      {totalCount === 0 && (
        <p className="text-[11px] text-noir-dim text-center py-2">
          No cached images. Cache is populated when AI generation runs.
        </p>
      )}

      {/* Clear all */}
      {totalCount > 0 && (
        <Button
          variant="ghost"
          fullWidth
          onClick={clearAll}
          disabled={clearing !== null}
          className="mt-1"
        >
          <Trash2 size={12} className="inline mr-1.5" />
          Clear All Cache
        </Button>
      )}

      {/* Future generation notice */}
      <div className="text-[10px] text-noir-dim border border-dashed border-noir-border rounded-[2px] p-2.5 leading-relaxed">
        Images are generated via the Nanobanana service and stored locally for offline use.
        Clearing cache does not delete any session data.
      </div>
    </div>
  )
}
