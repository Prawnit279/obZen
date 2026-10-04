import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { buildDefines } from './build-id'

export default defineConfig({
  plugins: [react()],
  // Same stamps as the build. Without these, any component reading them
  // throws at render time rather than failing at config time.
  define: buildDefines(),
  test: {
    environment: 'jsdom',
    globals: true,
    // Pinned, because almost every date helper here works in local time and
    // the suite otherwise tests whatever zone the machine happens to be in. A
    // week-counting bug that only appeared across a spring-forward boundary
    // passed on CI and on a UTC laptop and failed in Toronto.
    env: { TZ: 'America/Toronto' },
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // `dist/` and `scripts/` are not source: counting the built bundles as
      // uncovered files put the headline figure at 19% while `src/lib` was
      // near 70%, which made the number useless as a gate.
      exclude: [
        'node_modules/',
        'dist/',
        'scripts/',
        'src/test/',
        'src/data/',
        'src/vite-env.d.ts',
        '*.config.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
