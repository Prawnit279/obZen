# obZen — Build Status
Last updated: 2026-05-02 | SHA: cfcf2d16

---

## ✅ Completed

### Infrastructure
- Vite + React 18 + TypeScript (strict)
- Tailwind + Noircut design system (6 themes, localStorage persist)
- Dexie.js v4 schema — 24 tables, all defined
- React Router v6 with AppShell layout
- PWA: service worker, manifest, offline-first
- GitHub Pages deploy via GitHub Actions
- Vitest — 44 passing unit tests

### Dashboard
- Daily check-in modal (mood, energy, soreness, forearm fatigue)
- Weekly volume chart
- Progressive overload chart
- Macro compliance chart
- Drum practice pie chart

### Workout
- Full session logging (set-by-set: weight, reps, warmup)
- 3-day program (Push / Pull / Legs)
- 50+ exercise library
- Drag-to-reorder exercises within session
- Add exercises from library mid-session
- Progressive overload tracking + session history

### Drum Studio
- Practice session timer with focus area tagging
- 39 PAS rudiments with notation viewer
- Song library CRUD (status: learning / ready / performed)
- Jam session scheduler
- Drum book library — 11 books pre-seeded on first load (meta guard)
- PDF upload + viewer (page nav, invert mode)
- navigator.storage.persist()

### Yoga
- 30-day challenge tracker
- 38 animated pose SVGs (line/circle elements — rewrite pending)
- Breathing timer (box, 4-7-8, etc.)
- Custom sequence builder + timed player

### Ayurveda
- Pitta dosha profile
- Daily dinacharya checklist (morning + evening)
- Auto-reset per day, history persisted to Dexie (ayurvedaLogs)
- Seasonal remedies (static)

### Vedic Remedies
- Planetary remedy log
- Mantra tracking with count

### Calendar
- Monthly grid with event dots
- Day detail sheet (view + add from same sheet)
- Add event: title, date, time, category, notes
- Full Dexie CRUD

### Meetings
- Meeting log: title, date, time, agenda, notes
- Status cycling: open → in-progress → done
- Full Dexie CRUD

### Projects (Kanban)
- Board creation (work / creative / personal / courses)
- Tasks: Todo / In Progress / Done columns
- Priority (low / medium / high), due dates, notes
- Drag-and-drop via @dnd-kit

### Settings
- 6-theme switcher
- User profile (Ayurvedic + astrological)
- Live storage usage (used / quota / persisted)
- Image cache management

---

## ❌ Remaining

### Deferred — agreed to skip for now
- Yoga pose animation rewrite (Axis-Master rect-limb SVGs, 38 poses)
- Streaks (daily/weekly habit streaks across modules)
- Focus timer (Pomodoro-style)
- Weekly review screen
- Global search
- Data export (JSON backup)
- Progress photos
- Analytics (decided: external tool)

### Partially built — UI incomplete
| Area | What's missing |
|---|---|
| Nutrition | Meal logging, saved meals, daily log history (schema exists, UI is stub) |
| Meetings | Action items UI (table exists in Dexie, not surfaced) |
| Calendar | Week / day view (tabs exist, only month view renders) |
| Projects | Live task count on board list cards (shows 0) |
| Vedic | Needs refinement / fuller logging UI |

### Infrastructure
- SSH key auth (currently using token per push)
- Native iOS App Store (needs Capacitor wrapper)
