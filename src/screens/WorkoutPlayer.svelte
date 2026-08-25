<script>
  import { onMount, onDestroy } from 'svelte'
  import { exercises as exercisesStore } from '../lib/stores/exercises.js'
  import { settings } from '../lib/stores/settings.js'
  import { countdownBeep, resumeContext } from '../lib/audio.js'
  import { logWorkout } from '../lib/stores/history.js'
  import { bandSelections, toggleBand } from '../lib/stores/bandSelections.js'

  // Band definitions — order = lightest → thickest
  const BANDS = [
    { id: 'orange', label: 'Orange', color: '#f97316', glow: 'rgba(249,115,22,.5)' },
    { id: 'red',    label: 'Red',    color: '#ef4444', glow: 'rgba(239,68,68,.5)'  },
    { id: 'black',  label: 'Black',  color: '#9ca3af', glow: 'rgba(156,163,175,.5)'},
    { id: 'purple', label: 'Purple', color: '#a855f7', glow: 'rgba(168,85,247,.5)' },
    { id: 'green',  label: 'Green',  color: '#22c55e', glow: 'rgba(34,197,94,.5)'  },
  ]

  // Active exercise id for the current step (null during GAP/REST/COMPLETE)
  $: activeExerciseId = (currentStep?.type === 'EXERCISE' ||
                         currentStep?.type === 'EXERCISE_RIGHT' ||
                         currentStep?.type === 'EXERCISE_LEFT')
    ? currentStep.exercise?.id
    : null

  $: activeBands = activeExerciseId ? ($bandSelections[activeExerciseId] ?? []) : []

  export let workout = null
  export let onClose = () => {}

  let startTime = Date.now()
  let logged = false

  // ── State machine states ──
  // EXERCISE_RIGHT, GAP, EXERCISE_LEFT, EXERCISE (unilateral), REST, COMPLETE

  let exMap = Object.fromEntries($exercisesStore.map(e => [e.id, e]))

  // Build a flat sequence of steps from workout
  function buildSequence(w) {
    if (!w) return []
    const steps = []
    for (let gi = 0; gi < w.groups.length; gi++) {
      const group = w.groups[gi]
      for (let si = 0; si < group.sets; si++) {
        for (let ei = 0; ei < group.exercises.length; ei++) {
          const wex = group.exercises[ei]
          const ex = exMap[wex.exerciseId]
          if (!ex) continue
          const dur = wex.duration ?? ex.defaultDuration ?? 30
          const gap = wex.bilateralGap ?? ex.bilateralGap ?? $settings.bilateralGap ?? 5

          if (ex.bilateral) {
            steps.push({ type: 'EXERCISE_RIGHT', exercise: ex, wex, duration: dur, group: group.label, set: si + 1, totalSets: group.sets, gi, si, ei })
            steps.push({ type: 'GAP', exercise: ex, wex, duration: gap, group: group.label, set: si + 1, totalSets: group.sets, gi, si, ei })
            steps.push({ type: 'EXERCISE_LEFT', exercise: ex, wex, duration: dur, group: group.label, set: si + 1, totalSets: group.sets, gi, si, ei })
          } else {
            steps.push({ type: 'EXERCISE', exercise: ex, wex, duration: dur, group: group.label, set: si + 1, totalSets: group.sets, gi, si, ei })
          }
        }
        // After each set (except last in last group), add rest
        const isLastSet = si === group.sets - 1
        const isLastGroup = gi === w.groups.length - 1
        if (!isLastSet) {
          steps.push({ type: 'REST', duration: w.restBetweenSets, label: `After Set ${si + 1} of ${group.sets}`, group: group.label })
        } else if (!isLastGroup) {
          steps.push({ type: 'REST', duration: w.restBetweenGroups, label: `After Group ${group.label}`, group: group.label, isGroupRest: true })
        }
      }
    }
    steps.push({ type: 'COMPLETE' })
    return steps
  }

  let sequence = buildSequence(workout)
  let stepIndex = 0
  let timeLeft = 0
  let stepDuration = 0   // stable plain var — NOT reactive, set once per step
  let isPaused = false
  let intervalId = null

  $: currentStep = sequence[stepIndex] ?? { type: 'COMPLETE' }
  $: nextStep = findNextExerciseStep(stepIndex + 1)

  function findNextExerciseStep(fromIdx) {
    for (let i = fromIdx; i < sequence.length; i++) {
      const s = sequence[i]
      if (s.type === 'EXERCISE' || s.type === 'EXERCISE_RIGHT') return s
    }
    return null
  }

  $: totalSteps = sequence.filter(s => s.type !== 'REST' && s.type !== 'COMPLETE').length
  $: completedSteps = sequence.slice(0, stepIndex).filter(s => s.type !== 'REST' && s.type !== 'COMPLETE').length
  $: progress = totalSteps > 0 ? completedSteps / totalSteps : 0

  // Ring: uses stepDuration (plain var) so both numerator and denominator
  // are always in sync — no reactive lag between them.
  // ringProgress goes 1→0 as time runs out.
  // dashOffset = circumference*(1-ringProgress) → ring starts FULL, depletes to empty.
  $: ringProgress = stepDuration > 0 ? timeLeft / stepDuration : 0
  $: circumference = 2 * Math.PI * 108
  $: dashOffset = circumference * (1 - ringProgress)

  function startStep() {
    clearInterval(intervalId)
    // Read sequence[stepIndex] directly — never rely on the reactive $: currentStep
    // which may not have settled yet in Svelte 5's async effect scheduling.
    const step = sequence[stepIndex]
    if (!step || step.type === 'COMPLETE') return
    timeLeft = step.duration
    stepDuration = step.duration   // set denominator atomically with numerator
    if (!isPaused) tick()
  }

  function tick() {
    clearInterval(intervalId)
    intervalId = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--
        if ($settings.audioCues) countdownBeep(timeLeft)
        if (timeLeft === 0) {
          advance()
        }
      }
    }, 1000)
  }

  function advance() {
    clearInterval(intervalId)
    if (stepIndex < sequence.length - 1) {
      stepIndex++
      // Log workout the moment we hit COMPLETE
      if (sequence[stepIndex]?.type === 'COMPLETE' && !logged) {
        logged = true
        const durationSeconds = Math.round((Date.now() - startTime) / 1000)
        const exercisesCompleted = sequence.filter(
          s => s.type === 'EXERCISE' || s.type === 'EXERCISE_LEFT'
        ).length
        const groupsDone = workout?.groups?.length ?? 0
        logWorkout({
          workoutId: workout?.id,
          workoutName: workout?.name,
          durationSeconds,
          exercisesCompleted,
          groupsCompleted: groupsDone,
        })
      }
      startStep()
    } else {
      stepIndex = sequence.length - 1 // COMPLETE
    }
  }

  function goBack() {
    clearInterval(intervalId)
    if (stepIndex > 0) {
      stepIndex--
      startStep()
    }
  }

  function skip() {
    advance()
  }

  function togglePause() {
    resumeContext()
    if (isPaused) {
      isPaused = false
      tick()
    } else {
      isPaused = true
      clearInterval(intervalId)
    }
  }

  function formatTime(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  // Initialize in onMount — guarantees Svelte's reactive graph has fully
  // settled before we start the timer (fixes "first set broken" bug).
  onMount(() => {
    sequence = buildSequence(workout)
    stepIndex = 0
    isPaused = false
    startTime = Date.now()
    logged = false
    startStep()
  })

  onDestroy(() => clearInterval(intervalId))
</script>

<div class="flex flex-col h-full">
  {#if currentStep.type === 'COMPLETE'}
    <!-- COMPLETE SCREEN -->
    <div class="flex-1 flex flex-col items-center justify-center px-7 pb-16">
      <div class="text-6xl mb-6">🎉</div>
      <h2 class="text-3xl font-black text-white mb-2">Workout Done!</h2>
      <p class="text-gray-500 text-sm mb-10">{workout?.name}</p>
      <button
        on:click={onClose}
        class="bg-green-500 text-black font-bold text-sm px-8 py-3.5 rounded-xl"
        style="box-shadow: 0 0 24px rgba(34,197,94,.4)"
      >
        Back to Workouts
      </button>
    </div>

  {:else if currentStep.type === 'REST'}
    <!-- REST SCREEN -->
    <!-- Progress bar -->
    <div class="h-[3px] bg-[#1f1f1f] flex-shrink-0">
      <div class="h-full bg-green-500 transition-all duration-300" style="width: {progress * 100}%"></div>
    </div>

    <div class="flex items-center justify-between px-7 py-4 flex-shrink-0">
      <span class="text-xs font-bold tracking-[.1em] uppercase text-gray-600">{workout?.name}</span>
      <button on:click={onClose} class="w-8 h-8 rounded-full bg-[#1e1e1e] flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="flex-1 flex flex-col items-center justify-center px-7 pb-8">
      <div class="text-xs font-bold tracking-[.14em] uppercase text-gray-500 mb-4">Rest</div>
      <div class="text-[96px] font-black text-white leading-none tracking-[-0.05em] tabular-nums mb-3"
        style="font-variant-numeric: tabular-nums">
        {formatTime(timeLeft)}
      </div>
      <div class="text-sm text-gray-600">{currentStep.label}</div>

      {#if nextStep}
        <div class="mt-10 text-center">
          <div class="text-[11px] font-bold tracking-[.12em] uppercase text-gray-700 mb-2">Up Next</div>
          <div class="text-xl font-bold text-white">{nextStep.exercise?.name}</div>
          {#if nextStep.exercise?.bilateral}
            <div class="text-xs font-bold tracking-[.14em] uppercase text-green-500 mt-1">RIGHT SIDE</div>
          {/if}
        </div>
      {/if}

      <button
        on:click={skip}
        class="mt-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-9 py-3.5 text-sm font-semibold text-gray-500"
      >
        Skip Rest
      </button>
    </div>

  {:else}
    <!-- EXERCISE SCREEN -->
    <!-- Progress bar -->
    <div class="h-[3px] bg-[#1f1f1f] flex-shrink-0">
      <div class="h-full bg-green-500 transition-all duration-300" style="width: {progress * 100}%"></div>
    </div>

    <!-- Top strip -->
    <div class="flex items-center justify-between px-7 py-4 flex-shrink-0">
      <span class="text-xs font-bold tracking-[.1em] uppercase text-gray-600">{workout?.name}</span>
      <button on:click={onClose} class="w-8 h-8 rounded-full bg-[#1e1e1e] flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Main area: band column + content -->
    <div class="flex flex-1 min-h-0">

      <!-- Band selector — left rail -->
      <div class="flex flex-col items-center justify-center gap-3 pl-4 pr-2 flex-shrink-0">
        {#if activeExerciseId}
          {#each BANDS as band}
            {@const active = activeBands.includes(band.id)}
            <button
              on:click={() => toggleBand(activeExerciseId, band.id)}
              aria-label="{band.label} band{active ? ' (selected)' : ''}"
              class="w-9 h-9 rounded-full border-2 transition-all duration-150 flex items-center justify-center"
              style="
                background-color: {active ? band.color : 'transparent'};
                border-color: {active ? band.color : 'rgba(255,255,255,0.12)'};
                box-shadow: {active ? `0 0 10px ${band.glow}` : 'none'};
                opacity: {active ? 1 : 0.35};
              "
            ></button>
          {/each}
        {:else}
          <!-- Spacer so layout stays stable during GAP -->
          <div class="w-9" style="height: {BANDS.length * 48}px"></div>
        {/if}
      </div>

      <!-- Exercise content -->
      <div class="flex flex-col flex-1 pr-5 min-w-0">

        <!-- Group / Set badges -->
        <div class="flex items-center gap-2.5 flex-wrap">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-[.08em] uppercase bg-[#1e1e1e] text-gray-500">
            Group {currentStep.group}
          </span>
          <div class="w-1.5 h-1.5 rounded-full bg-[#333]"></div>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-[.08em] uppercase bg-[#1e1e1e] text-gray-500">
            Set {currentStep.set} of {currentStep.totalSets}
          </span>
        </div>

        <!-- Exercise name -->
        <div class="mt-5 text-[32px] font-extrabold text-white leading-[1.1] tracking-[-0.02em]">
          {currentStep.type === 'GAP' ? 'Switch Sides' : currentStep.exercise?.name}
        </div>

        {#if currentStep.type === 'EXERCISE_RIGHT'}
          <div class="mt-2.5 text-sm font-bold tracking-[.18em] uppercase text-green-500">▶ RIGHT</div>
        {:else if currentStep.type === 'EXERCISE_LEFT'}
          <div class="mt-2.5 text-sm font-bold tracking-[.18em] uppercase text-green-500">▶ LEFT</div>
        {:else if currentStep.type === 'GAP'}
          <div class="mt-2.5 text-sm font-bold tracking-[.18em] uppercase text-green-500">GET READY</div>
        {/if}

        <!-- Timer ring -->
        <div class="flex-1 flex items-center justify-center flex-col">
          <div class="relative w-[220px] h-[220px] flex items-center justify-center">
            <svg width="220" height="220" viewBox="0 0 240 240" class="absolute top-0 left-0">
              <circle cx="120" cy="120" r="108" fill="none" stroke="#1e1e1e" stroke-width="6"/>
              <circle
                cx="120" cy="120" r="108"
                fill="none"
                stroke="#22c55e"
                stroke-width="6"
                stroke-linecap="round"
                stroke-dasharray="{circumference}"
                stroke-dashoffset="{dashOffset}"
                transform="rotate(-90 120 120)"
                style="filter: drop-shadow(0 0 8px rgba(34,197,94,.6)); transition: stroke-dashoffset 0.8s linear"
              />
            </svg>
            <span class="relative text-[72px] font-black text-white leading-none tracking-[-0.04em]"
              style="font-variant-numeric: tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center justify-center gap-6 pb-2">
          <button on:click={goBack} class="w-[52px] h-[52px] rounded-full bg-[#1e1e1e] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button
            on:click={togglePause}
            class="w-[72px] h-[72px] rounded-full bg-green-500 flex items-center justify-center"
            style="box-shadow: 0 0 32px rgba(34,197,94,.35)"
          >
            {#if isPaused}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            {:else}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5">
                <line x1="10" y1="7" x2="10" y2="17"/><line x1="14" y1="7" x2="14" y2="17"/>
              </svg>
            {/if}
          </button>
          <button on:click={skip} class="w-[52px] h-[52px] rounded-full bg-[#1e1e1e] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <!-- Next exercise -->
        {#if nextStep}
          <div class="mt-4 bg-[#161616] rounded-[14px] p-3.5 flex items-center gap-3 mb-1">
            <span class="text-[10px] font-bold tracking-[.12em] uppercase text-gray-700 flex-shrink-0">Next</span>
            <span class="text-sm font-medium text-gray-500 truncate">{nextStep.exercise?.name}</span>
            <span class="ml-auto flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </span>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
