import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { programById } from '@/data/programs'

/**
 * The training block currently being run.
 *
 * Nothing else records which programme you are on, and every method tracker
 * needs to know — a 5/3/1 wave card cannot say which week it is without a start
 * date, and showing one at all is noise if you are not running 5/3/1.
 *
 * Null until a block is started. That is a real state, not a missing one: the
 * app worked without a programme before and still does, so the trackers simply
 * do not appear rather than guessing at a default.
 */
export interface ActiveBlock {
  programId: string
  /** The chosen variant, for programmes that offer several. Null when it has one shape. */
  templateId: string | null
  /** ISO date the block began, which is what cycle weeks are counted from. */
  startedOn: string
  /** Training maxes in pounds, by exercise id, as the block was started with. */
  trainingMaxLb: Record<string, number>
}

interface BlockState {
  block: ActiveBlock | null
  start: (block: ActiveBlock) => void
  /** Corrects a training max mid-block, as a reset or a jump does. */
  setTrainingMax: (exerciseId: string, lb: number) => void
  end: () => void
}

export const useBlockStore = create<BlockState>()(
  persist(
    set => ({
      block: null,

      start: (block) => set({ block }),

      setTrainingMax: (exerciseId, lb) =>
        set(s => (s.block === null || !(lb > 0) ? s : {
          block: { ...s.block, trainingMaxLb: { ...s.block.trainingMaxLb, [exerciseId]: lb } },
        })),

      end: () => set({ block: null }),
    }),
    {
      name: 'obzen-active-block',
      /**
       * Storage outlives the programme list. A block naming a programme this
       * build no longer has would put the trackers into a state with nothing
       * behind it, so it is dropped rather than carried forward.
       */
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<BlockState>
        const b = saved.block
        const valid =
          b != null
          && typeof b.programId === 'string'
          && programById(b.programId) !== undefined
          && typeof b.startedOn === 'string'
          && /^\d{4}-\d{2}-\d{2}$/.test(b.startedOn)
        return {
          ...current,
          block: valid
            ? {
                programId: b!.programId,
                templateId: typeof b!.templateId === 'string' ? b!.templateId : null,
                startedOn: b!.startedOn,
                trainingMaxLb: Object.fromEntries(
                  Object.entries(b!.trainingMaxLb ?? {})
                    .filter(([, v]) => typeof v === 'number' && Number.isFinite(v) && v > 0)
                ),
              }
            : null,
        }
      },
    }
  )
)
