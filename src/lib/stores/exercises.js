import { writable } from 'svelte/store'
import { defaultExercises } from '../data/exercises.js'

const STORAGE_KEY = 'workout-app:exercises'

function loadExercises() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : defaultExercises
  } catch {
    return defaultExercises
  }
}

export const exercises = writable(loadExercises())

exercises.subscribe(value => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {}
})
