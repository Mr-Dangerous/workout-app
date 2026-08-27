<script>
  import { settings } from '../lib/stores/settings.js'

  let s = { ...$settings }

  function save() {
    settings.set(s)
  }
</script>

<div class="flex flex-col h-full pb-16">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-4 flex-shrink-0">
    <h1 class="text-[22px] font-extrabold tracking-tight">Settings</h1>
  </div>

  <div class="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-4">
    <!-- Rest settings -->
    <div class="bg-[#161616] rounded-2xl border border-[#252525] p-4">
      <div class="text-[10px] font-bold tracking-[.12em] uppercase text-gray-600 mb-4">Timer Defaults</div>

      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-white">Rest Between Sets</div>
            <div class="text-xs text-gray-600 mt-0.5">Seconds</div>
          </div>
          <input
            type="number"
            bind:value={s.restBetweenSets}
            on:change={save}
            min="0"
            class="w-20 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-sm text-center outline-none focus:border-green-500/50"
          />
        </div>

        <div class="h-px bg-[#252525]"></div>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-white">Rest Between Groups</div>
            <div class="text-xs text-gray-600 mt-0.5">Seconds</div>
          </div>
          <input
            type="number"
            bind:value={s.restBetweenGroups}
            on:change={save}
            min="0"
            class="w-20 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-sm text-center outline-none focus:border-green-500/50"
          />
        </div>

        <div class="h-px bg-[#252525]"></div>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-white">Bilateral Gap</div>
            <div class="text-xs text-gray-600 mt-0.5">Seconds between sides</div>
          </div>
          <input
            type="number"
            bind:value={s.bilateralGap}
            on:change={save}
            min="0"
            class="w-20 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-sm text-center outline-none focus:border-green-500/50"
          />
        </div>

        <div class="h-px bg-[#252525]"></div>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-white">Prep Duration</div>
            <div class="text-xs text-gray-600 mt-0.5">Seconds before each exercise</div>
          </div>
          <input
            type="number"
            bind:value={s.prepDuration}
            on:change={save}
            min="0"
            class="w-20 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-sm text-center outline-none focus:border-green-500/50"
          />
        </div>
      </div>
    </div>

    <!-- Audio -->
    <div class="bg-[#161616] rounded-2xl border border-[#252525] p-4">
      <div class="text-[10px] font-bold tracking-[.12em] uppercase text-gray-600 mb-4">Audio</div>

      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-medium text-white">Audio Cues</div>
          <div class="text-xs text-gray-600 mt-0.5">Countdown beeps</div>
        </div>
        <button
          on:click={() => { s.audioCues = !s.audioCues; save() }}
          class="w-12 h-6 rounded-full transition-colors {s.audioCues ? 'bg-green-500' : 'bg-[#333]'} relative"
        >
          <div class="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform {s.audioCues ? 'translate-x-6' : 'translate-x-0.5'}"></div>
        </button>
      </div>
    </div>

    <!-- About -->
    <div class="bg-[#161616] rounded-2xl border border-[#252525] p-4">
      <div class="text-[10px] font-bold tracking-[.12em] uppercase text-gray-600 mb-3">About</div>
      <div class="text-sm text-gray-500">Workout Timer v1.0</div>
      <div class="text-xs text-gray-700 mt-1">Resistance band workouts, anywhere.</div>
    </div>
  </div>
</div>
