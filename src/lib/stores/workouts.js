import { writable } from 'svelte/store'
import { defaultWorkouts } from '../data/defaultWorkouts.js'

const STORAGE_KEY = 'workout-app:workouts'

function loadWorkouts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : defaultWorkouts
  } catch {
    return defaultWorkouts
  }
}

export const workouts = writable(loadWorkouts())

workouts.subscribe(value => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {}
})
