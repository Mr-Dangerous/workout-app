# Workout App — Brainstorm & Planning

> Created: 2026-08-24
> Status: Planning

---

## Vision

A personal workout application that lets me **build and execute workouts** with a real-time timer. Starts as an HTML web app, with a future goal of packaging for **mobile (Android/iOS)** or even running on an **ESP32** as a standalone device.

---

## Core Modes / Training Methods

The app supports multiple training "modes" — each mode tailors the exercise library, defaults, and UI to the activity type.

| Mode | Status |
|------|--------|
| Resistance Bands | 🟢 Primary Focus |
| Free Weights / Dumbbells | 🔲 Future |
| Barbell | 🔲 Future |
| Bodyweight / Calisthenics | 🔲 Future |
| Cardio / Conditioning | 🔲 Future |
| ESP32 Physical Display | 🔲 Far Future |

---

## Key Features

### 1. Workout Builder
- User creates named workouts (e.g., "Full Body Bands A")
- Exercises are organized into **superset groups** (A1, A2, A3... B1, B2...)
- Each exercise has:
  - Name
  - Duration (seconds) — bilateral exercises split into R/L (e.g., 30/30)
  - Optional: sets count, notes
- **Rest periods** are added automatically between sets/supersets (configurable)
- Sets per group (e.g., "3 sets of everything")

#### Example Workout (Resistance Bands)
```
Group A — 3 sets
  A1: Shoulder Press Right/Left   30s / 30s
  A2: Banded Squat                40s
  A3: Seated Row                  40s
  A4: Romanian Deadlift           40s

Group B — 3 sets
  B1: Floor Press                 40s
  B2: Overhead Tricep Extensions  40s
  B3: Hammer Curls Right/Left     30s / 30s
  B4: Lateral Raises              40s
```

---

### 2. Workout Player / Execution Mode
- **Big, bold display** of:
  - Current exercise name
  - Countdown timer (large font, center screen)
  - Which side if bilateral (RIGHT → LEFT)
  - Current set / total sets
  - Next exercise preview
- Visual or audio cue when set ends / transitions
- Pause / skip / go-back controls
- Rest timer automatically inserted between sets
- Progress bar showing overall workout completion

---

### 3. Exercise Library
- Searchable database of exercises, scoped by training mode
- Each exercise has:
  - Name
  - Primary muscle group(s)
  - Secondary muscle group(s)
  - Description / form tips
  - Default duration
  - Bilateral flag (R/L)
  - Equipment required (band, dumbbell, bodyweight, etc.)
- Exercises can be **"learned"** — added to the user's personal library from the global database
- Users can also create **custom exercises**

#### Search Methods
1. **By name** — text search
2. **By muscle group** — tap a region on an interactive body diagram
   - Front / back view toggle
   - Tap shoulder → see deltoid exercises
   - Tap back → see lat/rhomboid exercises
   - Tap legs → quads, hamstrings, glutes, calves

---

### 4. Body Map (Muscle Group Selector)
- SVG or illustrated front/back human body
- Tap a muscle region → filters exercise library
- Regions:
  - Deltoids (shoulders)
  - Chest (pec major/minor)
  - Back (lats, rhomboids, traps)
  - Biceps
  - Triceps
  - Forearms
  - Core / Abs
  - Glutes
  - Quadriceps
  - Hamstrings
  - Calves

---

## Data Model (Draft)

```
Exercise {
  id
  name
  mode[]               // training modes this applies to
  primaryMuscles[]
  secondaryMuscles[]
  bilateral: bool
  bilateralGap: int    // seconds between R and L sides (default: 5, per-exercise override)
  defaultDuration: int // seconds (per side if bilateral)
  restOverride?: int   // overrides global rest if set
  description: string
  formTips: string
  isLearned: bool      // in user's library
  isCustom: bool
}

WorkoutSet {
  exerciseId
  duration: int        // per side if bilateral
  bilateralGap?: int   // overrides exercise default if set
  notes?: string
}

SupersetGroup {
  label: string        // "A", "B", etc.
  exercises: WorkoutSet[]
  sets: int            // how many times to repeat the group
}

Workout {
  id
  name
  mode: TrainingMode
  groups: SupersetGroup[]
  restBetweenSets: int       // global default (seconds) — overridable per exercise
  restBetweenGroups: int     // seconds between superset groups
  createdAt: Date
  lastUsed?: Date
}

AppSettings {
  restBetweenSets: int       // global default
  restBetweenGroups: int     // global default
  bilateralGap: int          // global default (5s)
  audioCues: bool
}
```

### Bilateral Exercise Execution Flow

```
[Exercise START]
  → Countdown timer (right side): 30s
  → Beeps at 5, 4, 3, 2, 1 (beep each second; "1" is louder + longer)
  → Auto-gap: 5s rest (or per-exercise override) — short beep at end
  → Countdown timer (left side): 30s
  → Beeps at 5, 4, 3, 2, 1
[Exercise END → Rest period → Next exercise]
```

### Audio Cue Spec

- Countdown beep fires at T-5, T-4, T-3, T-2, T-1 (where T = end of interval)
- Beeps 5 through 2: short, moderate volume (~440Hz, ~100ms)
- Beep at T-1 (final): louder + longer (~880Hz, ~300ms)
- Uses Web Audio API (`AudioContext`) — no external audio files needed

---

## UX Flow

```
Home
 ├── My Workouts
 │    ├── [Workout Card] → Edit / Play
 │    └── + New Workout → Workout Builder
 ├── Exercise Library
 │    ├── Search by name
 │    ├── Filter by muscle (Body Map)
 │    └── Exercise Detail → Learn / Add to Workout
 └── Settings
      ├── Rest period defaults
      ├── Audio cues on/off
      └── Training mode preference
```

---

## Platform Targets

### Phase 1 — HTML Web App
- Vanilla HTML/CSS/JS or lightweight framework (React? Svelte?)
- LocalStorage or IndexedDB for data persistence
- Responsive design (mobile-first, works in phone browser)
- PWA-ready (installable, offline capable)

### Phase 2 — Native Mobile
- Options: React Native, Capacitor (wraps HTML app), Flutter
- Push notifications for rest timers
- Keep-awake screen lock during workout

### Phase 3 — ESP32
- Minimal display mode (OLED or small TFT)
- Physical buttons: start / pause / skip
- Buzzer for audio cues
- Workout data synced via WiFi or pre-flashed

---

## Decisions Log

| # | Question | Decision |
|---|----------|----------|
| 1 | Framework | **Svelte** — clean, fast, ideal for Capacitor packaging later |
| 2 | Bilateral split | **Two separate countdown segments** (R → auto-gap → L). Gap is per-exercise configurable, default **5 seconds** |
| 3 | Rest timers | **Global defaults**, but individual exercises can override |
| 4 | Audio cues | **Beep only.** 5-second countdown beeps; final beep is louder + longer |
| 5 | Body map | **`body-highlighter` JS library** |

### Remaining Open Questions

~~- [ ] Styling: Tailwind? Custom CSS? Dark mode default?~~
~~- [ ] Data: LocalStorage vs IndexedDB vs backend/sync?~~
~~- [ ] Superset auto-sequencing: after group A completes 3 sets, auto-advance to B?~~
- [ ] Should "learned" exercises sync across devices?

| # | Question | Decision |
|---|----------|----------|
| 6 | Styling | **Tailwind CSS, dark mode default** |
| 7 | Data storage | **LocalStorage** (migrate to IndexedDB later if needed) |
| 8 | Superset sequencing | **Auto-roll** — Group A → Group B without pause |

---

## Initial Resistance Bands Exercise Database (Seed Data)

### Shoulders
- Shoulder Press (R/L bilateral)
- Lateral Raises
- Front Raises
- Reverse Flys (Rear Deltoid)

### Back
- Seated Row
- Lat Pulldown (band over door)
- Reverse Pulls / Face Pulls

### Chest
- Floor Press
- Band Flys

### Arms
- Hammer Curls (R/L bilateral)
- Bicep Curls
- Overhead Tricep Extensions
- Tricep Pushdowns

### Legs
- Banded Squat
- Romanian Deadlift
- Glute Bridges
- Lateral Band Walks

### Core
- Pallof Press (R/L bilateral)
- Standing Oblique Crunches

---

## Notes & Scratch Pad

> Add anything here as we brainstorm further...

