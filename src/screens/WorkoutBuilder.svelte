<script>
  import { workouts } from '../lib/stores/workouts.js'
  import { exercises as exercisesStore } from '../lib/stores/exercises.js'

  export let workout = null
  export let onSave = () => {}
  export let onCancel = () => {}

  let name = workout?.name ?? 'New Workout'
  let restBetweenSets = workout?.restBetweenSets ?? 60
  let restBetweenGroups = workout?.restBetweenGroups ?? 90
  let groups = workout ? JSON.parse(JSON.stringify(workout.groups)) : [
    { label: 'A', sets: 3, exercises: [] }
  ]

  const exMap = Object.fromEntries($exercisesStore.map(e => [e.id, e]))

  function addGroup() {
    const labels = 'ABCDEFGHIJ'
    groups = [...groups, { label: labels[groups.length] || String(groups.length + 1), sets: 3, exercises: [] }]
  }

  function removeGroup(gi) {
    groups = groups.filter((_, i) => i !== gi)
  }

  function removeExercise(gi, ei) {
    groups[gi].exercises = groups[gi].exercises.filter((_, i) => i !== ei)
    groups = [...groups]
  }

  function moveUp(gi, ei) {
    if (ei === 0) return
    const ex = groups[gi].exercises
    ;[ex[ei - 1], ex[ei]] = [ex[ei], ex[ei - 1]]
    groups = [...groups]
  }

  function moveDown(gi, ei) {
    const ex = groups[gi].exercises
    if (ei === ex.length - 1) return
    ;[ex[ei], ex[ei + 1]] = [ex[ei + 1], ex[ei]]
    groups = [...groups]
  }

  function save() {
    const updated = {
      ...(workout ?? {}),
      id: workout?.id ?? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now(),
      name,
      mode: 'resistance-bands',
      restBetweenSets: Number(restBetweenSets),
      restBetweenGroups: Number(restBetweenGroups),
      createdAt: workout?.createdAt ?? new Date().toISOString(),
      lastUsed: workout?.lastUsed ?? null,
      groups,
    }
    workouts.update(ws => {
      const idx = ws.findIndex(w => w.id === updated.id)
      if (idx >= 0) {
        ws[idx] = updated
        return [...ws]
      }
      return [...ws, updated]
    })
    onSave(updated)
  }
</script>

<div class="flex flex-col h-full pb-16">
  <!-- Header -->
  <div class="flex items-center gap-3 px-5 py-4 border-b border-[#252525] flex-shrink-0">
    <button on:click={onCancel} class="text-gray-500 text-sm">Cancel</button>
    <div class="flex-1 text-center">
      <span class="text-sm font-bold">Edit Workout</span>
    </div>
    <button on:click={save} class="text-green-500 text-sm font-bold">Save</button>
  </div>

  <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
    <!-- Name -->
    <div>
      <label class="text-[10px] font-bold tracking-[.12em] uppercase text-gray-600 block mb-1.5">Workout Name</label>
      <input
        bind:value={name}
        class="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-green-500/50"
      />
    </div>

    <!-- Rest settings -->
    <div class="flex gap-3">
      <div class="flex-1">
        <label class="text-[10px] font-bold tracking-[.12em] uppercase text-gray-600 block mb-1.5">Rest/Set (s)</label>
        <input
          type="number"
          bind:value={restBetweenSets}
          class="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-green-500/50"
        />
      </div>
      <div class="flex-1">
        <label class="text-[10px] font-bold tracking-[.12em] uppercase text-gray-600 block mb-1.5">Rest/Group (s)</label>
        <input
          type="number"
          bind:value={restBetweenGroups}
          class="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-green-500/50"
        />
      </div>
    </div>

    <!-- Groups -->
    {#each groups as group, gi}
      <div class="bg-[#161616] rounded-2xl border border-[#252525] p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold tracking-[.1em] uppercase text-green-500">Group {group.label}</span>
          </div>
          <div class="flex items-center gap-3">
            <label class="text-[11px] text-gray-600 flex items-center gap-1.5">
              Sets:
              <input
                type="number"
                bind:value={group.sets}
                min="1"
                max="10"
                class="w-12 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-2 py-1 text-white text-xs text-center outline-none"
              />
            </label>
            <button on:click={() => removeGroup(gi)} class="text-gray-700 hover:text-red-500 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {#each group.exercises as wex, ei}
          {@const ex = exMap[wex.exerciseId]}
          <div class="flex items-center gap-2 py-2 border-b border-[#252525] last:border-0">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-white truncate">{ex?.name ?? wex.exerciseId}</div>
              <div class="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  bind:value={wex.duration}
                  class="w-14 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-2 py-0.5 text-white text-xs text-center outline-none"
                />
                <span class="text-[11px] text-gray-700">sec</span>
                {#if ex?.bilateral}
                  <span class="text-[10px] text-green-500/60">bilateral</span>
                {/if}
              </div>
            </div>
            <div class="flex flex-col gap-0.5">
              <button on:click={() => moveUp(gi, ei)} class="text-gray-700 hover:text-gray-400 p-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
              </button>
              <button on:click={() => moveDown(gi, ei)} class="text-gray-700 hover:text-gray-400 p-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
            <button on:click={() => removeExercise(gi, ei)} class="text-gray-700 hover:text-red-500 p-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        {/each}

        {#if group.exercises.length === 0}
          <div class="text-center text-sm text-gray-700 py-4">No exercises yet</div>
        {/if}
      </div>
    {/each}

    <button
      on:click={addGroup}
      class="w-full py-3 rounded-xl border border-dashed border-[#333] text-sm text-gray-600 hover:text-gray-400 hover:border-[#444] transition-colors"
    >
      + Add Group
    </button>
  </div>
</div>
