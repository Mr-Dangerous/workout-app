import { writable } from 'svelte/store'

const STORAGE_KEY = 'workout-app:history'

// Each entry: { id, workoutId, workoutName, date (ISO string), durationSeconds, groupsCompleted, exercisesCompleted }
function loadHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export const history = writable(loadHistory())

history.subscribe(value => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {}
})

export function logWorkout(entry) {
  history.update(h => [
    {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      ...entry,
    },
    ...h,
  ])
}
