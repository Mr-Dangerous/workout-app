# 004 — Workout Selector Screen

## Purpose
Pre-workout screen that lets the user browse, preview, and launch a workout. Acts as the entry point into the Focus Mode player (screen 001).

## Design Decisions

### Visual Language
- Matches the established dark aesthetic: `#0f0f0f` background, Inter font, `#22c55e` green accent
- Phone frame consistent with 001-focus-mode (375px, 48px border-radius, 2px border + 8px shadow ring)

### Layout (top → bottom)
1. **Status bar** — 9:41, signal/wifi/battery icons
2. **Header** — "My Workouts" title + settings gear + green ＋ button
3. **Training Mode pills** — horizontal scroll row; active pill (Resistance Bands) shown with green border, check mark, and tinted background; inactive pills use surface-dark style
4. **Muscle Coverage Map** — hand-crafted SVG (130×220px) showing front-view human body silhouette. Separate `<ellipse>` and `<path>` elements for each muscle region with individual IDs (left-shoulder, chest, left-bicep, abs, left-quad, etc.). Primary muscles (#22c55e at ~80% opacity via radialGradient), secondary muscles (calves/forearms at ~40%). Legend shows Primary / Secondary dot key.
5. **Selected Workout Summary Bar** — workout name + stats + full-width-adjacent START button with green glow shadow
6. **Workout List** — 5 scrollable cards; selected card has green left border, `#192b1f` background tint, green tag pill; unselected cards are neutral dark. Each card includes a 50×80px mini muscle map SVG unique to that workout's coverage.

### SVG Body Map
Built as a pure SVG (no external assets). Uses:
- Radial gradients for primary/secondary fill
- Separate named elements per muscle group for future JS interactivity
- Outlined body silhouette path as the neutral base

### Fake Data
| Workout | Mode | Exercises | Sets | Time | Last Used |
|---|---|---|---|---|---|
| Full Body Bands A ✓ | Resistance Bands | 8 | 3 | ~32 min | Aug 22 |
| Full Body Bands B | Resistance Bands | 7 | 3 | ~28 min | Aug 19 |
| Upper Body Focus | Resistance Bands | 6 | 4 | ~30 min | Aug 15 |
| Leg Day | Resistance Bands | 5 | 3 | ~22 min | Aug 10 |
| Core & Conditioning | Resistance Bands | 6 | 2 | ~18 min | Never |

## File
Single self-contained `index.html` — no external dependencies except Google Fonts + no build step needed.
