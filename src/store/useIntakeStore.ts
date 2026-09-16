import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { INTAKE_QUESTIONS } from '@/data/intake-questions'
import type { IntakeAnswer, IntakeAnswers } from '@/lib/intake'

/**
 * Answers to the goal questionnaire.
 *
 * localStorage rather than Dexie, for the same reason the bodyweight log and
 * the other preferences live there: twenty small values written a handful of
 * times would not earn a table and a schema version.
 *
 * `seen` records questions that were reached and passed, which is not the same
 * as never having got to them. Without that distinction the questionnaire could
 * never be finished by someone who wanted to skip something — it would always
 * look unfinished and keep asking.
 */
interface IntakeState {
  answers: IntakeAnswers
  /** Ids reached and moved past, answered or not. */
  seen: string[]
  /** When it was last finished, or null if it never has been. */
  completedAt: string | null

  setAnswer: (id: string, answer: IntakeAnswer) => void
  clearAnswer: (id: string) => void
  markSeen: (id: string) => void
  markComplete: () => void
  reset: () => void
}

const EMPTY = { answers: {} as IntakeAnswers, seen: [] as string[], completedAt: null }

/** Ids the current question set actually has, for filtering what storage returns. */
const KNOWN = new Set(INTAKE_QUESTIONS.map(q => q.id))

export const useIntakeStore = create<IntakeState>()(
  persist(
    set => ({
      ...EMPTY,

      setAnswer: (id, answer) =>
        set(s => ({
          answers: { ...s.answers, [id]: answer },
          seen: s.seen.includes(id) ? s.seen : [...s.seen, id],
        })),

      // Clearing is not the same as never answering, so the question stays seen.
      clearAnswer: (id) =>
        set(s => {
          const { [id]: _removed, ...rest } = s.answers
          return { answers: rest }
        }),

      markSeen: (id) =>
        set(s => (s.seen.includes(id) ? s : { seen: [...s.seen, id] })),

      markComplete: () => set({ completedAt: new Date().toISOString() }),

      reset: () => set({ ...EMPTY }),
    }),
    {
      name: 'obzen-intake',
      /**
       * Storage survives app versions, so what comes back may answer questions
       * that no longer exist or carry shapes this build cannot read. Anything
       * unrecognised is dropped rather than handed to the programme logic.
       */
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<IntakeState>
        const answers: IntakeAnswers = {}
        for (const [id, a] of Object.entries(saved.answers ?? {})) {
          if (KNOWN.has(id) && a && typeof a === 'object' && 'kind' in a) {
            answers[id] = a as IntakeAnswer
          }
        }
        return {
          ...current,
          answers,
          seen: Array.isArray(saved.seen) ? saved.seen.filter(id => KNOWN.has(id)) : [],
          completedAt: typeof saved.completedAt === 'string' ? saved.completedAt : null,
        }
      },
    }
  )
)
