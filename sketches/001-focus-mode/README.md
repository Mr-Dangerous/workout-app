# Variant 001 — Focus Mode

## Stance
Ultra-minimal. The timer is everything. All navigation chrome fades to near-invisible.

## Key Design Choices
- **Massive circular timer** with SVG ring progress — user sees elapsed/remaining at a glance
- **Green accent** (#22c55e) — high-contrast on dark, universally understood as "go"
- Group/Set badges are muted (#888) — present but not competing for attention
- Exercise name at 36px bold — readable from arm's length, mid-set
- Side label (RIGHT/LEFT) in accent green below name — impossible to miss
- Rest screen is its own full-screen state, just as minimal
- "Next exercise" row is visually quiet (dark card, muted text)

## Two States Shown
1. **Active exercise** — countdown ring, pause/back/skip controls
2. **Rest screen** — big rest timer, upcoming exercise preview, skip button

## Trade-offs
- ✅ Zero visual noise while exercising — nothing to misread under duress
- ✅ Ring communicates remaining time intuitively (no reading needed)
- ❌ No volume/settings access from this screen (intentional)
- ❌ Can't see future sets or overall group progress without leaving screen
- ❌ Only one exercise visible at a time — no queue visibility

## Best For
Users who want to lock in and have the timer fill their whole phone screen.
