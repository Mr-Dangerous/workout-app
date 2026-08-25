import { writable } from 'svelte/store'

const STORAGE_KEY = 'workout-app:band-selections'

// Shape: { [exerciseId]: string[] }  e.g. { 'hammer-curl': ['red', 'black'] }
function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export const bandSelections = writable(load())

bandSelections.subscribe(value => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {}
})

export function toggleBand(exerciseId, bandId) {
  bandSelections.update(all => {
    const current = all[exerciseId] ?? []
    const next = current.includes(bandId)
      ? current.filter(b => b !== bandId)
      : [...current, bandId]
    return { ...all, [exerciseId]: next }
  })
}
