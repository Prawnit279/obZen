import { describe, it, expect } from 'vitest'
import {
  cn, todayISO, currentSeason,
  clamp, pct, generateId,
  pluralize, formatDuration, getPlanetaryDay, getMoonPhaseName,
} from '@/lib/utils'

describe('cn', () => {
  it('joins class strings', () => {
    expect(cn('a', 'b')).toBe('a b')
  })
  it('filters falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })
  it('handles empty input', () => {
    expect(cn()).toBe('')
  })
})

describe('clamp', () => {
  it('clamps below min', () => expect(clamp(-1, 0, 10)).toBe(0))
  it('clamps above max', () => expect(clamp(15, 0, 10)).toBe(10))
  it('passes through in-range value', () => expect(clamp(5, 0, 10)).toBe(5))
})

describe('pct', () => {
  it('calculates percentage', () => expect(pct(50, 100)).toBe(50))
  it('clamps at 100', () => expect(pct(150, 100)).toBe(100))
  it('returns 0 for zero max', () => expect(pct(10, 0)).toBe(0))
})

describe('generateId', () => {
  it('returns a string', () => expect(typeof generateId()).toBe('string'))
  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, generateId))
    expect(ids.size).toBe(100)
  })
})

describe('pluralize', () => {
  it('uses singular for 1', () => expect(pluralize(1, 'day')).toBe('day'))
  it('uses plural for 0', () => expect(pluralize(0, 'day')).toBe('days'))
  it('uses plural for 2', () => expect(pluralize(2, 'day')).toBe('days'))
  it('uses custom plural', () => expect(pluralize(2, 'person', 'people')).toBe('people'))
})

describe('formatDuration', () => {
  it('formats minutes under 60', () => expect(formatDuration(45)).toBe('45m'))
  it('formats exact hours', () => expect(formatDuration(60)).toBe('1h'))
  it('formats hours and minutes', () => expect(formatDuration(90)).toBe('1h 30m'))
})

describe('getPlanetaryDay', () => {
  it('returns planet and day', () => {
    const result = getPlanetaryDay()
    expect(result).toHaveProperty('planet')
    expect(result).toHaveProperty('day')
  })
  it('returns valid values', () => {
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
    expect(planets).toContain(getPlanetaryDay().planet)
  })
})

describe('todayISO', () => {
  it('returns a valid ISO date string', () => {
    const result = todayISO()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('getMoonPhaseName', () => {
  it('returns a valid moon phase', () => {
    const phases = [
      'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
      'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
    ]
    expect(phases).toContain(getMoonPhaseName())
  })
})

describe('currentSeason', () => {
  it('returns a valid season', () => {
    const seasons = ['spring', 'summer', 'fall', 'winter']
    expect(seasons).toContain(currentSeason())
  })
})
