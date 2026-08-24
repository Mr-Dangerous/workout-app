# Product Requirements Document — Workout Timer App

> **Version:** 1.0  
> **Date:** 2026-08-24  
> **Status:** Planning Complete / Ready to Build  
> **Author:** MrDangerous  

---

## 1. Overview

A personal workout application for building and executing timed workouts. The user creates workout routines from an exercise library, then runs them in a distraction-free timer interface that guides them through each set, including bilateral side splits and automatic rest periods.

**Start:** Svelte PWA hosted on GitHub Pages  
**Future:** Package via Capacitor for Android/iOS; eventual ESP32 standalone device

---

## 2. Goals

- Replace mental tracking / stopwatch during workouts with an automatic guided timer
- Build a personal exercise library organized by muscle group and training mode
- Handle the specifics of resistance band training: bilateral exercises, superset groups, variable durations
- Be usable while sweating — large text, minimal taps, audio cues

---

## 3. Non-Goals (Phase 1)

- No user accounts or cloud sync
- No social / sharing features
- No video demonstrations
- No calorie tracking or rep counting
- No free weights / barbell mode (those are Phase 2+)

---

## 4. Training Modes

The app is mode-aware. Each mode scopes the exercise library and future UI defaults.

| Mode | Phase |
|------|-------|
| Resistance Bands | ✅ Phase 1 |
| Free Weights / Dumbbells | Phase 2 |
| Barbell | Phase 2 |
| Bodyweight / Calisthenics | Phase 2 |
| Cardio / Conditioning | Phase 2 |
| ESP32 Physical Display | Phase 3 |

---

## 5. Core Features

### 5.1 Workout Selector (Home Screen)

The default landing screen after launch.

**Layout:**
- Training mode pill selector (horizontal scroll) — active mode filters workout list
- Muscle coverage map — shows which muscles the selected workout hits (front + back body diagram, powered by `body-highlighter`)
  - Primary muscles: bright green
  - Secondary muscles: dimmer green
- Selected workout summary: name, exercise count, set count, estimated time, last used date
- Large **START** button
- Scrollable workout list — each card shows:
  - Workout name
  - Mode tag
  - Stats (exercises · sets · est. time)
  - Last used date
  - Mini muscle map thumbnail
- Tapping a card selects it (updates muscle map + summary); tapping START launches the player

### 5.2 Workout Player (Focus Mode)

The active workout execution screen. Designed to be readable at a glance while exercising.

**Display:**
- Workout name (small, top)
- Group label (e.g. "GROUP B") and set progress (e.g. "SET 2 OF 3") as badge pills
- Exercise name — large bold text
- Side indicator — "▶ RIGHT" or "▶ LEFT" in green (bilateral only)
- Circular countdown ring — SVG arc that depletes as time runs out
- Timer digits — very large (80px+), center of ring
- Playback controls: ‹ Previous | ⏸ Pause | › Skip
- Next exercise preview — subtle bar at bottom ("NEXT: Overhead Tricep Ext.")
- Overall progress bar at top of screen

**Rest screen** (auto-shown between sets):
- "REST" label
- Large countdown timer
- "After Set N of N" subtitle
- "UP NEXT" label with next exercise name + side
- "Skip Rest" button

**Bilateral execution sequence:**
```
[Exercise START]
  → Timer: RIGHT side (e.g. 30s)
  → Beeps at T-5, T-4, T-3, T-2 (440Hz / 100ms)
  → Beep at T-1: louder + longer (880Hz / 300ms)
  → Auto-gap: 5s (or per-exercise override) — gap timer shown
  → Timer: LEFT side (e.g. 30s)
  → Same beep sequence
[Exercise END → Rest period → Next exercise]
```

**Superset sequencing:**
- Within a group: A1 → A2 → A3 → A4, then rest, then repeat N times
- After all sets of Group A complete: auto-roll into Group B (no pause)
- After all groups complete: workout summary screen

### 5.3 Workout Builder

Create and edit workout routines.

**Structure:**
- Workout name (editable)
- Training mode selector
- Superset groups (A, B, C...):
  - Each group has a set count (e.g. "3 sets")
  - Exercises listed as A1, A2, A3... with name + duration
  - Bilateral exercises show R/L duration (e.g. "30s / 30s")
  - Per-exercise rest override (optional)
  - Reorder exercises (drag or up/down arrows)
  - Delete exercise
  - + Add Exercise (opens Exercise Library picker)
- + Add Group button
- Reorder groups
- Save / Cancel

### 5.4 Exercise Library

Browse, search, and manage exercises.

**Search methods:**
1. **By name** — live text search
2. **By muscle group** — tappable body map (front/back toggle)
   - Powered by `body-highlighter`
   - Tap a muscle region → filters list to exercises targeting that muscle

**Exercise card shows:**
- Name
- Primary muscle(s)
- Secondary muscle(s)
- Bilateral badge (if applicable)
- Default duration
- "Learned" badge (if in personal library)

**Actions per exercise:**
- **Learn** — adds to personal library (persisted in LocalStorage)
- **Add to Workout** — directly adds to a workout in progress (if opened from Builder)
- **View Detail** — form tips, full muscle list

**Custom exercises:**
- User can create exercises not in the default database
- Custom exercises are always "learned" automatically

### 5.5 Settings

- Rest between sets (global default, seconds)
- Rest between groups (global default, seconds)
- Bilateral gap (global default, seconds — default: 5)
- Audio cues on/off

---

## 6. Audio Cue Spec

Implemented via Web Audio API (`AudioContext`) — no external audio files.

| Event | Frequency | Duration | Notes |
|-------|-----------|----------|-------|
| Countdown T-5 through T-2 | 440 Hz | 100ms | Moderate volume |
| Countdown T-1 (final) | 880 Hz | 300ms | Louder — signals "almost done" |
| Bilateral gap start | 440 Hz | 150ms | Signals switching sides |
| Set complete | 660 Hz | 200ms | TBD |
| Rest over / exercise start | 880 Hz | 300ms | TBD |

---

## 7. Data Model

```typescript
type TrainingMode = 'resistance-bands' | 'free-weights' | 'barbell' | 'bodyweight' | 'cardio'

interface Exercise {
  id: string
  name: string
  modes: TrainingMode[]
  primaryMuscles: string[]       // body-highlighter muscle IDs
  secondaryMuscles: string[]
  bilateral: boolean
  bilateralGap: number           // seconds between R and L (default: 5)
  defaultDuration: number        // seconds per side
  restOverride?: number          // overrides global rest if set
  description: string
  formTips: string
  isLearned: boolean
  isCustom: boolean
}

interface WorkoutSet {
  exerciseId: string
  duration: number               // seconds per side if bilateral
  bilateralGap?: number          // overrides exercise default
  notes?: string
}

interface SupersetGroup {
  label: string                  // "A", "B", "C"...
  exercises: WorkoutSet[]
  sets: number
}

interface Workout {
  id: string
  name: string
  mode: TrainingMode
  groups: SupersetGroup[]
  restBetweenSets: number        // seconds (overridable per exercise)
  restBetweenGroups: number      // seconds
  createdAt: string              // ISO date
  lastUsed?: string
}

interface AppSettings {
  restBetweenSets: number        // default: 60
  restBetweenGroups: number      // default: 90
  bilateralGap: number           // default: 5
  audioCues: boolean             // default: true
  defaultMode: TrainingMode
}
```

**Persistence:** All data stored in `localStorage` under namespaced keys:
- `workout-app:exercises` — learned/custom exercises
- `workout-app:workouts` — saved workouts
- `workout-app:settings` — app settings

---

## 8. UX Flow

```
App Launch
  └── Workout Selector (Home)
        ├── Tap workout card → updates muscle map + summary
        ├── Tap START → Workout Player (Focus Mode)
        │     ├── Exercise timer → bilateral gap → next exercise
        │     ├── Rest screen (auto) → next set or next group
        │     └── Workout Complete screen
        ├── Tap + (New Workout) → Workout Builder
        │     └── Tap "Add Exercise" → Exercise Library (picker mode)
        ├── Bottom nav: Library → Exercise Library (browse mode)
        │     ├── Search by name
        │     └── Tap muscle on body map → filtered list
        └── Bottom nav: Settings → Settings screen
```

---

## 9. Screen Inventory

| Screen | Status | Mockup |
|--------|--------|--------|
| Workout Selector | ✅ Designed | `sketches/005-workout-selector-v2/` |
| Workout Player (Focus Mode) | ✅ Designed | `sketches/001-focus-mode/` |
| Workout Builder | 🔲 Not designed | — |
| Exercise Library | 🔲 Not designed | — |
| Exercise Detail | 🔲 Not designed | — |
| Settings | 🔲 Not designed | — |
| Workout Complete | 🔲 Not designed | — |

**Rejected variants (kept for reference):**
- `sketches/002-dashboard/` — too much info density for in-workout use
- `sketches/003-card-stack/` — elegant but more complex to build
- `sketches/004-workout-selector/` — v1 with hand-crafted SVG body map (replaced by v2)

---

## 10. Tech Stack

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | **Svelte** | Lightweight, reactive, compiles to vanilla JS, ideal for Capacitor later |
| Styling | **Tailwind CSS** | Utility-first, fast to build, consistent dark mode |
| Body map | **body-highlighter** (inlined) | Purpose-built muscle highlighting, front+back SVG, named muscle IDs |
| Audio | **Web Audio API** | No external files, works offline, precise timing |
| Data | **localStorage** | Simple, zero-backend, sufficient for Phase 1 |
| Hosting | **GitHub Pages** | Free static hosting; Svelte build output is pure static files |
| Deployment | **GitHub Actions** | Auto-deploy on push to `main` (build → `gh-pages` branch) |
| Future mobile | **Capacitor** | Wraps the Svelte PWA into a native Android/iOS app shell |
| Future hardware | **ESP32** | Minimal display mode, buzzer audio, WiFi sync |

### GitHub Pages Hosting Plan

1. Create repo `Mr-Dangerous/workout-app` on GitHub
2. Svelte project configured with `base` path matching the repo name
3. GitHub Actions workflow: on push to `main` → `npm run build` → deploy `dist/` to `gh-pages` branch
4. Live URL: `https://mr-dangerous.github.io/workout-app/`
5. Future: custom domain possible via CNAME

---

## 11. Resistance Band Exercise Seed Database

Full list in `resistance_band_exercises.csv`. Summary by category:

| Category | Count | Notable Bilateral |
|----------|-------|-------------------|
| Shoulders | 7 | Shoulder Press, Lateral Raise, Front Raise |
| Back | 5 | Single Arm Row |
| Chest | 3 | — |
| Biceps | 5 | Bicep Curl, Hammer Curl, Reverse Curl |
| Triceps | 3 | — |
| Legs / Glutes | 12 | Step Back Lunge, Clamshell, Hip Abduction |
| Core | 5 | Pallof Press, Standing Oblique Crunch |
| **Total** | **40** | |

---

## 12. Decisions Log

| # | Question | Decision |
|---|----------|----------|
| 1 | Framework | Svelte |
| 2 | Bilateral split | Two separate timers with configurable auto-gap (default 5s) |
| 3 | Rest timers | Global defaults; per-exercise override allowed |
| 4 | Audio cues | Beep only via Web Audio API; 5s countdown; final beep louder + longer |
| 5 | Body map | `body-highlighter` JS library (inlined — no CDN available) |
| 6 | Styling | Tailwind CSS, dark mode default |
| 7 | Data storage | localStorage (migrate to IndexedDB if needed) |
| 8 | Superset sequencing | Auto-roll (Group A → B without pause) |
| 9 | Hosting | GitHub Pages via GitHub Actions CI/CD |

---

## 13. Open Questions

- [ ] Should "learned" exercises sync across devices in a future phase? (iCloud / Google Drive JSON export?)
- [ ] Workout Complete screen: show stats? (total time, exercises done, sets completed)
- [ ] Should the app support multiple profiles (e.g. one per family member)?

---

## 14. Reference Workouts

### Full Body Bands A (Primary reference workout)
```
Group A — 3 sets
  A1: Shoulder Press (R/L)        30s / 30s
  A2: Banded Squat                40s
  A3: Seated Row                  40s
  A4: Romanian Deadlift           40s

Group B — 3 sets
  B1: Floor Press                 40s
  B2: Overhead Tricep Extensions  40s
  B3: Hammer Curls (R/L)          30s / 30s
  B4: Lateral Raises              40s

Rest between sets: 60s (global default)
Rest between groups: 90s (global default)
Bilateral gap: 5s (global default)
Estimated total: ~32 min
```
