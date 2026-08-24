# Variant 002 — Dashboard

## Stance
More information at once. The timer is still large, but the screen also shows group tabs, set progress dots, the exercise queue, and a persistent nav tab bar. Two screens shown: the active player and the workout builder.

## Key Design Choices
- **Orange accent** (#f97316) — warmer, more energetic than green; distinct from typical "success" colors
- **Group tabs** across the top of the exercise card — one tap to see any group's status
- **Set progress dots** (segmented bar) — current and remaining sets visible at a glance
- **Queue panel** below controls — the next 2 exercises are always visible, no mystery about what's coming
- **Tab bar** — persistent nav between Player / Builder / Library
- **Workout Builder** shows group-level collapsible blocks, active group highlighted with accent left border
- Active exercise row in builder is visually distinct (white text, orange accents)

## Two Screens Shown
1. **Workout Player** — dashboard layout with tabs, set dots, timer card, and queue
2. **Workout Builder** — collapsed/expanded superset groups, bilateral badges, active exercise highlight

## Trade-offs
- ✅ Maximum situational awareness — group, set, timer, next exercises all on one screen
- ✅ Builder shows workout structure clearly; can edit mid-session
- ❌ More visual elements = more to scan under duress
- ❌ Timer is smaller (72px vs 80px ring) to fit info below it
- ❌ Tab bar eats vertical space

## Best For
Users who want to track overall progress and know what's coming, not just the current countdown.
