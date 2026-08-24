<script>
  import { history } from '../lib/stores/history.js'

  // Calendar state
  const today = new Date()
  let viewYear = today.getFullYear()
  let viewMonth = today.getMonth() // 0-indexed

  const MONTH_NAMES = ['January','February','March','April','May','June',
                       'July','August','September','October','November','December']
  const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  // Build a Set of "YYYY-MM-DD" strings that have a logged workout
  $: workoutDays = new Set(
    $history.map(e => e.date.substring(0, 10))
  )

  // Build calendar grid for viewYear/viewMonth
  $: calendarDays = (() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay() // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null) // blank lead cells
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  })()

  $: todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  function dayKey(d) {
    if (!d) return null
    return `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  }

  function prevMonth() {
    if (viewMonth === 0) { viewMonth = 11; viewYear-- }
    else viewMonth--
  }
  function nextMonth() {
    if (viewMonth === 11) { viewMonth = 0; viewYear++ }
    else viewMonth++
  }

  // Selected day details
  let selectedDay = null
  $: selectedKey = selectedDay ? dayKey(selectedDay) : null
  $: selectedEntries = selectedKey
    ? $history.filter(e => e.date.substring(0,10) === selectedKey)
    : []

  function formatDuration(secs) {
    if (!secs) return '—'
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return m > 0 ? `${m}m ${s > 0 ? s+'s' : ''}` : `${s}s`
  }

  function formatDate(iso) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })
  }

  // Streak: count consecutive days up to today that have workouts
  $: streak = (() => {
    let count = 0
    const d = new Date(today)
    while (true) {
      const key = d.toISOString().substring(0,10)
      if (!workoutDays.has(key)) break
      count++
      d.setDate(d.getDate() - 1)
    }
    return count
  })()

  // This month count
  $: thisMonthKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`
  $: thisMonthCount = $history.filter(e => e.date.startsWith(thisMonthKey)).length

  // All time
  $: allTimeCount = $history.length
</script>

<div class="flex flex-col h-full pb-16 overflow-y-auto">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 pt-12 pb-4">
    <h1 class="text-2xl font-black text-white">Progress</h1>
  </div>

  <!-- Stats row -->
  <div class="grid grid-cols-3 gap-3 px-5 mb-5">
    <div class="bg-[#1a1a1a] rounded-2xl p-4 flex flex-col items-center">
      <span class="text-2xl font-black text-green-500">{streak}</span>
      <span class="text-[10px] text-gray-500 mt-1 uppercase tracking-wide text-center">Day Streak</span>
    </div>
    <div class="bg-[#1a1a1a] rounded-2xl p-4 flex flex-col items-center">
      <span class="text-2xl font-black text-green-500">{thisMonthCount}</span>
      <span class="text-[10px] text-gray-500 mt-1 uppercase tracking-wide text-center">This Month</span>
    </div>
    <div class="bg-[#1a1a1a] rounded-2xl p-4 flex flex-col items-center">
      <span class="text-2xl font-black text-green-500">{allTimeCount}</span>
      <span class="text-[10px] text-gray-500 mt-1 uppercase tracking-wide text-center">All Time</span>
    </div>
  </div>

  <!-- Calendar -->
  <div class="bg-[#1a1a1a] rounded-3xl mx-5 mb-5 p-4">
    <!-- Month nav -->
    <div class="flex items-center justify-between mb-4">
      <button on:click={prevMonth} class="w-8 h-8 rounded-full bg-[#252525] flex items-center justify-center text-gray-400 hover:text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <span class="text-white font-bold text-sm">{MONTH_NAMES[viewMonth]} {viewYear}</span>
      <button on:click={nextMonth} class="w-8 h-8 rounded-full bg-[#252525] flex items-center justify-center text-gray-400 hover:text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>

    <!-- Day-of-week labels -->
    <div class="grid grid-cols-7 mb-2">
      {#each DAY_LABELS as label}
        <div class="text-center text-[10px] text-gray-600 font-medium uppercase">{label}</div>
      {/each}
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7 gap-y-1">
      {#each calendarDays as day}
        {@const key = dayKey(day)}
        {@const hasWorkout = key && workoutDays.has(key)}
        {@const isToday = key === todayStr}
        {@const isSelected = key === selectedKey}
        <button
          class="aspect-square flex items-center justify-center rounded-full text-xs font-semibold mx-auto w-8 h-8 transition-all
            {!day ? 'invisible pointer-events-none' : ''}
            {isSelected ? 'ring-2 ring-green-500 ring-offset-1 ring-offset-[#1a1a1a]' : ''}
            {hasWorkout ? 'bg-green-500 text-black' : isToday ? 'bg-[#2a2a2a] text-white' : 'text-gray-500 hover:bg-[#252525]'}"
          on:click={() => { if (day) selectedDay = selectedDay === day ? null : day }}
        >
          {day ?? ''}
        </button>
      {/each}
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-4 mt-4 pt-3 border-t border-[#252525]">
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-full bg-green-500"></div>
        <span class="text-[10px] text-gray-500">Workout logged</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-full bg-[#2a2a2a] border border-gray-600"></div>
        <span class="text-[10px] text-gray-500">Today</span>
      </div>
    </div>
  </div>

  <!-- Selected day detail -->
  {#if selectedDay && selectedEntries.length > 0}
    <div class="px-5 mb-4">
      <p class="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-2">
        {formatDate(selectedEntries[0].date)}
      </p>
      {#each selectedEntries as entry}
        <div class="bg-[#1a1a1a] rounded-2xl p-4 mb-2">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-white font-bold text-sm">{entry.workoutName}</p>
              <p class="text-gray-500 text-xs mt-1">
                {entry.exercisesCompleted} exercises · {formatDuration(entry.durationSeconds)}
              </p>
            </div>
            <span class="text-green-500 text-lg">✓</span>
          </div>
        </div>
      {/each}
    </div>
  {:else if selectedDay}
    <div class="px-5 mb-4">
      <div class="bg-[#1a1a1a] rounded-2xl p-4 text-center">
        <p class="text-gray-600 text-sm">No workouts logged on this day</p>
      </div>
    </div>
  {/if}

  <!-- Recent history -->
  {#if $history.length > 0}
    <div class="px-5 mb-4">
      <p class="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-3">Recent Workouts</p>
      {#each $history.slice(0, 10) as entry}
        <div class="bg-[#1a1a1a] rounded-2xl p-4 mb-2 flex items-center justify-between">
          <div>
            <p class="text-white font-semibold text-sm">{entry.workoutName}</p>
            <p class="text-gray-500 text-xs mt-0.5">{formatDate(entry.date)} · {formatDuration(entry.durationSeconds)}</p>
          </div>
          <span class="text-green-500 text-lg">✓</span>
        </div>
      {/each}
    </div>
  {:else}
    <div class="px-5">
      <div class="bg-[#1a1a1a] rounded-3xl p-8 flex flex-col items-center text-center">
        <div class="text-4xl mb-3">📅</div>
        <p class="text-white font-bold mb-1">No workouts yet</p>
        <p class="text-gray-500 text-sm">Complete a workout and it'll show up here</p>
      </div>
    </div>
  {/if}
</div>
