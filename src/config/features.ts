/**
 * Feature flags for reversibly hiding modules from the UI.
 *
 * These only gate navigation, routes, and dashboard/settings surfaces — the
 * underlying page components and all Dexie tables/data (nutritionLogs,
 * savedMeals, vedicLogs) are left fully intact. Flip a flag to `true` to
 * restore the module with no data loss.
 */
export const SHOW_NUTRITION = false
export const SHOW_VEDIC = false

/**
 * Yoga. Hidden from navigation and routing; the page component, the pose data
 * and the `yogaSessions` table are all untouched, so flipping this back to
 * `true` restores the module with nothing lost.
 */
export const SHOW_YOGA = false

/**
 * Astrology surfaces outside the Vedic module — the planetary day, moon phase
 * and Saturn-day prompt on Home, and the moon/Saturn line on the Calendar.
 * Ayurveda (dosha, Pitta season) is a separate system and stays visible.
 */
export const SHOW_ASTROLOGY = false
