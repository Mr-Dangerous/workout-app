# Variant 003 — Card Stack

## Stance
Each exercise is a physical card. Exercises advance by swiping left (next) or right (prev). The active card sits on top of a visible stack — peeking cards behind communicate the queue depth visually.

## Key Design Choices
- **Electric blue accent** (#3b82f6) — cool, technical, high-contrast. Distinct from both green (focus) and orange (dashboard).
- **Card depth effect** — two scale-transformed cards peek behind the active one. Users instantly understand there are more exercises coming.
- **Timer lives inside the card** — the card is the exercise unit; timer, set pips, and side label are all scoped to it.
- **Timer at 88px** — still enormous, still the visual center of the card even though it's nested inside.
- **Set complete card** — instead of a modal, the set-complete/rest state is itself a card in the stack (same visual language).
- **"Swipe to skip" hint text** — ghosted into the card header so power users discover the gesture affordance
- **Thin progress bar** at top with percentage + time remaining — more informative than just a fill bar

## Two States Shown
1. **Active exercise card** — hammer curls, timer counting down, set pips, back/pause/skip controls
2. **Set complete / rest card** — checkmark animation state, blue rest timer, auto-start behavior indicated

## Trade-offs
- ✅ Swipe-to-advance maps perfectly to the bilateral L/R flow — each side is its own card
- ✅ Stack depth communicates "how much is left" without a number
- ✅ Rest state is part of the same card metaphor — zero context switch
- ❌ No scrollable queue list — you can only see one card at a time
- ❌ Implementation is more complex (swipe gesture handling, card animation)
- ❌ Timer is slightly less dominant than Focus Mode (it lives inside the card)

## Best For
Users who think in terms of "what's the next thing I do" rather than "track my overall progress."
The swiping gesture is natural on mobile and maps well to quick bilateral alternation.
