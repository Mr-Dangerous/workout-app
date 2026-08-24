export const defaultWorkouts = [
  {
    id: 'full-body-bands-a',
    name: 'Full Body Bands A',
    mode: 'resistance-bands',
    restBetweenSets: 60,
    restBetweenGroups: 90,
    createdAt: new Date().toISOString(),
    lastUsed: null,
    groups: [
      {
        label: 'A',
        sets: 3,
        exercises: [
          { exerciseId: 'shoulder-press', duration: 30, bilateralGap: 5 },
          { exerciseId: 'banded-squat', duration: 40 },
          { exerciseId: 'seated-row', duration: 40 },
          { exerciseId: 'romanian-deadlift', duration: 40 },
        ],
      },
      {
        label: 'B',
        sets: 3,
        exercises: [
          { exerciseId: 'floor-press', duration: 40 },
          { exerciseId: 'overhead-tricep-extension', duration: 40 },
          { exerciseId: 'hammer-curl', duration: 30, bilateralGap: 5 },
          { exerciseId: 'lateral-raise', duration: 40 },
        ],
      },
    ],
  },
  {
    id: 'full-body-bands-b',
    name: 'Full Body Bands B',
    mode: 'resistance-bands',
    restBetweenSets: 60,
    restBetweenGroups: 90,
    createdAt: new Date().toISOString(),
    lastUsed: null,
    groups: [
      {
        label: 'A',
        sets: 3,
        exercises: [
          { exerciseId: 'arnold-press', duration: 30, bilateralGap: 5 },
          { exerciseId: 'glute-bridge', duration: 40 },
          { exerciseId: 'lat-pulldown', duration: 40 },
          { exerciseId: 'step-back-lunge', duration: 30, bilateralGap: 5 },
        ],
      },
      {
        label: 'B',
        sets: 3,
        exercises: [
          { exerciseId: 'chest-press-standing', duration: 40 },
          { exerciseId: 'bicep-curl', duration: 30, bilateralGap: 5 },
          { exerciseId: 'tricep-pushdown', duration: 30, bilateralGap: 5 },
        ],
      },
    ],
  },
  {
    id: 'upper-body-focus',
    name: 'Upper Body Focus',
    mode: 'resistance-bands',
    restBetweenSets: 60,
    restBetweenGroups: 90,
    createdAt: new Date().toISOString(),
    lastUsed: null,
    groups: [
      {
        label: 'A',
        sets: 3,
        exercises: [
          { exerciseId: 'shoulder-press', duration: 30, bilateralGap: 5 },
          { exerciseId: 'seated-row', duration: 40 },
          { exerciseId: 'band-pull-apart', duration: 40 },
        ],
      },
      {
        label: 'B',
        sets: 3,
        exercises: [
          { exerciseId: 'floor-press', duration: 40 },
          { exerciseId: 'hammer-curl', duration: 30, bilateralGap: 5 },
          { exerciseId: 'overhead-tricep-extension', duration: 40 },
        ],
      },
    ],
  },
  {
    id: 'leg-day',
    name: 'Leg Day',
    mode: 'resistance-bands',
    restBetweenSets: 60,
    restBetweenGroups: 90,
    createdAt: new Date().toISOString(),
    lastUsed: null,
    groups: [
      {
        label: 'A',
        sets: 4,
        exercises: [
          { exerciseId: 'banded-squat', duration: 40 },
          { exerciseId: 'romanian-deadlift', duration: 40 },
          { exerciseId: 'glute-bridge', duration: 40 },
          { exerciseId: 'lateral-band-walk', duration: 40 },
          { exerciseId: 'leg-curl', duration: 30, bilateralGap: 5 },
        ],
      },
    ],
  },
]
