import { writable } from 'svelte/store'

const STORAGE_KEY = 'workout-app:settings'

const defaultSettings = {
  restBetweenSets: 60,
  restBetweenGroups: 90,
  bilateralGap: 5,
  prepDuration: 20,
  audioCues: true,
  defaultMode: 'resistance-bands',
}

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

export const settings = writable(loadSettings())

settings.subscribe(value => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {}
})
