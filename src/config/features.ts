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
