# obZen

> Personal command center. Fully offline. Built for one.

![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![Tests](https://img.shields.io/badge/tests-44_passing-brightgreen?style=flat-square)
![Offline](https://img.shields.io/badge/offline--first-IndexedDB-0a0a0a?style=flat-square)

**[→ Live App](https://prawnit279.github.io/obZen)**

---

## What It Is

obZen is a fully offline, self-hosted personal operating system built as a React + TypeScript PWA.

- No backend. No accounts. No cloud sync.
- All data lives in the browser's IndexedDB via Dexie.js — schema version 4, 24 tables.
- Installable on iOS via Safari → Share → Add to Home Screen.
- Installable on Android via Chrome → Install App.
- Deployed to GitHub Pages via GitHub Actions CI/CD.

The name is taken from the Meshuggah album — reflecting the owner's identity as a drummer and the app's precision-focused, no-nonsense philosophy.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript (strict mode), Vite, React Router v6 |
| Styling | Tailwind CSS + Noircut design system (CSS custom properties) |
| State | Zustand + localStorage for UI state |
| Database | Dexie.js (IndexedDB) — fully offline, all data |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| PDF | PDF.js via pdfjs-dist |
| PWA | vite-plugin-pwa + Workbox service worker |
| Icons | Lucide React |
| Tests | Vitest — 44 passing unit tests |
| Deploy | GitHub Pages via GitHub Actions CI/CD |

---

## Design System — Noircut

Black/white aesthetic. No gradients. No shadows. No decorative elements.

- 1px borders · 2px border-radius · uppercase labels · Inter font
- CSS custom property token prefix: `noir-*`

**Themes (6)**

| Theme | Palette |
|---|---|
| Noircut | Pure black / white (default) |
| Crimson | Deep red |
| Ember | Dark orange |
| Ash | Cool grey |
| Jade | Forest green |
| Frost | Steel blue |

---

## Modules (12)

### 1. Dashboard
- Daily check-in: mood, energy, soreness, forearm fatigue
- Weekly volume chart (workout sets per muscle group)
- Progressive overload chart (weight over time per exercise)
- Macro compliance chart (protein / carbs / fat vs targets)
- Drum practice pie chart (time by focus area)

### 2. Workout
- Full session logging — set-by-set (weight, reps, warmup flag)
- 3-day program: Day 1 Push / Day 2 Pull / Day 3 Legs
- 50+ exercise library, drag-to-reorder within session
- Add exercises from library mid-session
- Progressive overload tracking + session history

### 3. Drum Studio
- Practice session timer with focus area tagging (BPM, notes)
- 39 PAS-standard rudiments with notation viewer
- Song library CRUD: title, artist, BPM, status (learning / ready / performed)
- Jam session scheduler
- 11 pre-indexed reference books + PDF upload support
- PDF viewer: page nav, invert mode (dark paper for readability)
- Reference library: Stick Control, Syncopation, Chapin, The New Breed, Master Studies, Bass Drum Control, Realistic Rock, The Drummer's Bible, Groove Essentials, Language of Drumming, Sticking Patterns

### 4. Yoga
- 30-day challenge tracker with completion history
- 38 animated pose SVGs (days 1–30 + bonus poses)
- Breathing timer: box breathing, 4-7-8, and more
- Custom sequence builder + timed sequence player

### 5. Ayurveda
- Pitta dosha profile: elements, qualities, imbalances, diet
- Daily dinacharya checklist (morning + evening practices)
- Auto-resets each day; history persisted to Dexie
- Seasonal remedies reference

### 6. Vedic Remedies
- Saturn / Rahu / Ketu / planetary remedy log
- Mantra tracking with count
- Practice history

### 7. Calendar
- Monthly grid with event dots on days
- Day detail sheet: list events, add from same sheet
- Event fields: title, date, start/end time, category, notes
- Categories: personal, work, meeting, workout, drum, yoga, jam, ayurveda
- All events stored in Dexie — fully offline

### 8. Nutrition
- Pitta-optimized macro targets (training day vs rest day)
- Protein / carbs / fat / calorie display with progress bars
- Training / rest day toggle

### 9. Projects (Kanban)
- Create boards: work, creative, personal, courses
- Tasks with status: Todo / In Progress / Done
- Priority: low / medium / high + due dates + notes
- Drag-and-drop between columns via @dnd-kit

### 10. Meetings
- Meeting log: title, date, time
- Agenda items (add line by line)
- Notes / outcomes field
- Status: open / in-progress / done

### 11. Settings
- 6-theme switcher (persisted in localStorage)
- User profile: Ayurvedic + astrological reference
- Live storage usage: used / quota / persistent flag
- Image cache management

### 12. More
- Overflow navigation for secondary modules

---

## Data Architecture

All data in IndexedDB via Dexie.js — database name: `obzen`, schema version: `4`.

**24 tables:**

```
workoutSessions · workoutDaySessions · exerciseLogs · drumSessions · rudimentLogs
songs · jamSessions · calendarEvents · nutritionLogs · savedMeals · boards · tasks
meetings · actionItems · yogaSessions · checkIns · progressPhotos · ayurvedaLogs
vedicLogs · drumBooks · drumNotations · drumPDFs · cachedImages · meta
```

The `meta` table acts as a seeding guard — ensures one-time operations (e.g. drum book pre-seeding) only run once per device.

---

## PWA Capabilities

- Installable on iOS via Safari → Share → Add to Home Screen
- Installable on Android via Chrome → Install App
- Offline-first: service worker via Workbox (auto-update strategy)
- `navigator.storage.persist()` — prevents browser from evicting IndexedDB data
- Standalone display mode, portrait orientation, theme-color `#0a0a0a`
- 11 drum reference books pre-seeded into IndexedDB on first load

---

## Running Locally

```bash
git clone https://github.com/Prawnit279/obZen.git
cd obZen
npm install
npm run dev
```

```bash
# Run tests
npm run test

# Build for production
npm run build
```

---

## Current Status

**Live:** [prawnit279.github.io/obZen](https://prawnit279.github.io/obZen) — in private beta.

**Functional modules:** Dashboard · Workout · Drum Studio · Yoga · Ayurveda · Calendar · Meetings · Projects · Settings

**Roadmap:**
- Yoga pose animation rewrite (Axis-Master rect-limb SVG pattern)
- Phase 7: streaks, focus timer, weekly review, global search, data export
- Beta feedback features

---

## Philosophy

Built for one person. No compromises for a general audience. Every module reflects Pronit's actual life — drumming practice, Ayurvedic constitution, Vedic astrological context, training program, and yoga practice.

The app evolves based on real usage, not hypothetical users.

**No analytics. No tracking. No ads. No subscriptions. Data never leaves the device.**

---

*Owner: Pronit · Pitta dosha · INTJ-A · Active drummer · Saturn Atmakaraka*
