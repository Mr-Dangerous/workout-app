<script>
  import { exercises } from '../lib/stores/exercises.js'

  export let pickerMode = false
  export let onPick = () => {}

  let search = ''
  let modeFilter = 'resistance-bands'

  $: filtered = $exercises.filter(ex => {
    const matchesMode = ex.modes.includes(modeFilter)
    const matchesSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase())
    return matchesMode && matchesSearch
  })

  function getMuscleLabel(muscles) {
    if (!muscles || muscles.length === 0) return ''
    return muscles.slice(0, 2).map(m => m.replace(/-/g, ' ')).join(', ')
  }
</script>

<div class="flex flex-col h-full pb-16">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-4 flex-shrink-0">
    <h1 class="text-[22px] font-extrabold tracking-tight">Exercise Library</h1>
  </div>

  <!-- Search -->
  <div class="px-5 mb-3 flex-shrink-0">
    <div class="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        bind:value={search}
        placeholder="Search exercises..."
        class="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-700"
      />
    </div>
  </div>

  <!-- Mode filter -->
  <div class="px-5 mb-3 flex gap-2 flex-shrink-0">
    {#each ['resistance-bands'] as mode}
      <button
        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border
          {modeFilter === mode ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-[#1e1e1e] border-[#252525] text-gray-500'}"
        on:click={() => modeFilter = mode}
      >
        {#if modeFilter === mode}
          <div class="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        {/if}
        Resistance Bands
      </button>
    {/each}
  </div>

  <!-- Exercise count -->
  <div class="px-5 pb-2 text-[10px] font-bold tracking-[.12em] uppercase text-gray-700 flex-shrink-0">
    {filtered.length} exercises
  </div>

  <!-- Exercise List -->
  <div class="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-2">
    {#each filtered as ex}
      <div class="bg-[#161616] rounded-[14px] border border-[#252525] p-3.5 flex items-center gap-3">
        <div class="flex-1 min-w-0">
          <div class="text-sm font-bold text-white">{ex.name}</div>
          <div class="text-[11px] text-gray-600 mt-0.5">
            {getMuscleLabel(ex.primaryMuscles)}
            {#if ex.bilateral}
              · <span class="text-green-500/60">bilateral</span>
            {/if}
          </div>
        </div>
        {#if pickerMode}
          <button
            on:click={() => onPick(ex)}
            class="flex-shrink-0 text-xs font-bold text-green-500 bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-lg"
          >
            Add
          </button>
        {:else}
          <button class="flex-shrink-0 text-xs text-gray-600 bg-[#1e1e1e] px-3 py-1.5 rounded-lg">
            Learn
          </button>
        {/if}
      </div>
    {/each}
  </div>
</div>
