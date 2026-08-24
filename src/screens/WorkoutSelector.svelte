<script>
  import { onMount } from 'svelte'
  import { workouts } from '../lib/stores/workouts.js'
  import { exercises } from '../lib/stores/exercises.js'

  export let onStart = () => {}
  export let onEdit = () => {}
  export let onNew = () => {}

  let selectedId = $workouts[0]?.id ?? null
  let frontContainer, backContainer
  let bodyHighlighterLib = null

  $: selectedWorkout = $workouts.find(w => w.id === selectedId)

  $: allMuscles = (() => {
    if (!selectedWorkout) return { primary: [], secondary: [] }
    const exMap = Object.fromEntries($exercises.map(e => [e.id, e]))
    const primary = new Set()
    const secondary = new Set()
    for (const group of selectedWorkout.groups) {
      for (const ex of group.exercises) {
        const exercise = exMap[ex.exerciseId]
        if (exercise) {
          exercise.primaryMuscles.forEach(m => primary.add(m))
          exercise.secondaryMuscles.forEach(m => secondary.add(m))
        }
      }
    }
    // Remove from secondary what's already primary
    primary.forEach(m => secondary.delete(m))
    return { primary: [...primary], secondary: [...secondary] }
  })()

  $: totalExercises = selectedWorkout
    ? selectedWorkout.groups.reduce((acc, g) => acc + g.exercises.length * g.sets, 0)
    : 0

  $: totalTime = (() => {
    if (!selectedWorkout) return 0
    const exMap = Object.fromEntries($exercises.map(e => [e.id, e]))
    let t = 0
    for (const group of selectedWorkout.groups) {
      for (let s = 0; s < group.sets; s++) {
        for (const ex of group.exercises) {
          const exercise = exMap[ex.exerciseId]
          const dur = ex.duration || exercise?.defaultDuration || 30
          if (exercise?.bilateral) {
            t += dur * 2 + (ex.bilateralGap ?? exercise.bilateralGap ?? 5)
          } else {
            t += dur
          }
        }
        // rest between sets (not after last set in group)
        if (s < group.sets - 1) t += selectedWorkout.restBetweenSets
      }
    }
    // rest between groups
    t += (selectedWorkout.groups.length - 1) * selectedWorkout.restBetweenGroups
    return t
  })()

  $: if (bodyHighlighterLib && frontContainer && backContainer && allMuscles) {
    renderBodyMaps()
  }

  // Refs to body-highlighter instances so we can .update() instead of re-creating
  let frontHighlighter = null
  let backHighlighter = null

  function buildMuscleData(muscles) {
    // body-highlighter data format: [{ muscles: [muscleId, ...], frequency: N }]
    // frequency 2 = primary color, frequency 1 = secondary color
    const entries = [
      ...muscles.primary.map(m => ({ muscles: [m], frequency: 2 })),
      ...muscles.secondary.map(m => ({ muscles: [m], frequency: 1 })),
    ]
    return entries
  }

  function renderBodyMaps() {
    if (!bodyHighlighterLib || !frontContainer || !backContainer) return
    try {
      const data = buildMuscleData(allMuscles)
      const sharedOpts = {
        highlightedColors: ['#15803d', '#22c55e'], // [secondary, primary] indexed by frequency-1
        bodyColor: '#374151',  // visible gray on dark bg
        data,
      }

      if (frontHighlighter) {
        frontHighlighter.update({ ...sharedOpts, type: 'anterior' })
      } else {
        frontHighlighter = bodyHighlighterLib.createBodyHighlighter({
          ...sharedOpts,
          container: frontContainer,
          type: 'anterior',
        })
      }

      if (backHighlighter) {
        backHighlighter.update({ ...sharedOpts, type: 'posterior' })
      } else {
        backHighlighter = bodyHighlighterLib.createBodyHighlighter({
          ...sharedOpts,
          container: backContainer,
          type: 'posterior',
        })
      }
    } catch (e) {
      console.error('Body highlighter error:', e)
    }
  }

  onMount(async () => {
    try {
      bodyHighlighterLib = await import('../lib/bodyHighlighter.js')
      renderBodyMaps()
    } catch (e) {
      console.error('Failed to load body highlighter:', e)
    }
  })

  function formatTime(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec > 0 ? sec + 's' : ''}` : `${sec}s`
  }
</script>

<div class="flex flex-col h-full pb-16">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-4 flex-shrink-0">
    <h1 class="text-[22px] font-extrabold tracking-tight">Workouts</h1>
    <div class="flex gap-2">
      <button
        on:click={onNew}
        class="w-9 h-9 rounded-full bg-[#1e1e1e] flex items-center justify-center"
        title="New Workout"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- Muscle Map -->
  <div class="mx-5 mb-3 bg-[#161616] rounded-[18px] border border-[#252525] p-3.5 flex-shrink-0">
    <div class="flex items-center justify-between mb-3">
      <span class="text-[10px] font-bold tracking-[.12em] uppercase text-gray-600">Muscles Worked</span>
      <div class="flex gap-3">
        <div class="flex items-center gap-1.5 text-[10px] text-gray-500">
          <div class="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Primary</span>
        </div>
        <div class="flex items-center gap-1.5 text-[10px] text-gray-500">
          <div class="w-2 h-2 rounded-full bg-green-500/40"></div>
          <span>Secondary</span>
        </div>
      </div>
    </div>
    <div class="flex justify-center items-start gap-3">
      <div class="flex flex-col items-center gap-1">
        <div bind:this={frontContainer} class="w-[90px] h-[180px]"></div>
        <span class="text-[9px] font-bold tracking-[.1em] uppercase text-gray-700">Front</span>
      </div>
      <div class="flex flex-col items-center gap-1">
        <div bind:this={backContainer} class="w-[90px] h-[180px]"></div>
        <span class="text-[9px] font-bold tracking-[.1em] uppercase text-gray-700">Back</span>
      </div>
    </div>
  </div>

  <!-- Summary + Start Bar -->
  {#if selectedWorkout}
    <div class="mx-5 mb-3 bg-[#161616] rounded-2xl border border-[#252525] p-3 flex items-center gap-3 flex-shrink-0">
      <div class="flex-1 min-w-0">
        <div class="text-sm font-bold text-white truncate">{selectedWorkout.name}</div>
        <div class="text-[11px] text-gray-600 mt-0.5">
          {totalExercises} segments · ~{formatTime(totalTime)}
        </div>
      </div>
      <button
        on:click={() => onStart(selectedWorkout)}
        class="bg-green-500 text-black text-sm font-extrabold tracking-wide px-5 py-2.5 rounded-xl flex-shrink-0"
        style="box-shadow: 0 0 20px rgba(34,197,94,.35)"
      >
        START
      </button>
    </div>
  {/if}

  <!-- List label -->
  <div class="px-5 pb-2 text-[10px] font-bold tracking-[.12em] uppercase text-gray-700 flex-shrink-0">All Workouts</div>

  <!-- Workout List -->
  <div class="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-2">
    {#each $workouts as workout}
      {@const exCount = workout.groups.reduce((a, g) => a + g.exercises.length * g.sets, 0)}
      <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
      <div
        class="w-full text-left bg-[#161616] rounded-[14px] border border-[#252525] border-l-[3px] p-3 flex items-center gap-3 cursor-pointer transition-colors
          {workout.id === selectedId ? 'bg-[#192b1f] border-[#1e3b28] border-l-green-500' : 'border-l-transparent'}"
        on:click={() => { selectedId = workout.id }}
      >
        <div class="flex-1 min-w-0">
          <div class="text-sm font-bold {workout.id === selectedId ? 'text-white' : 'text-[#ccc]'} truncate">{workout.name}</div>
          <div class="mt-1">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold
              {workout.id === selectedId ? 'bg-green-500/10 text-green-500' : 'bg-[#1e1e1e] text-gray-600'}">
              Resistance Bands
            </span>
          </div>
          <div class="text-[11px] text-gray-700 mt-1">{exCount} sets</div>
        </div>
        {#if workout.id === selectedId}
          <button
            on:click|stopPropagation={() => onEdit(workout)}
            class="flex-shrink-0 text-[11px] text-gray-600 hover:text-gray-400 transition-colors px-2 py-1"
          >
            Edit
          </button>
        {/if}
      </div>
    {/each}
  </div>
</div>
