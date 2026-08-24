<script>
  import WorkoutSelector from './screens/WorkoutSelector.svelte'
  import WorkoutPlayer from './screens/WorkoutPlayer.svelte'
  import WorkoutBuilder from './screens/WorkoutBuilder.svelte'
  import ExerciseLibrary from './screens/ExerciseLibrary.svelte'
  import Settings from './screens/Settings.svelte'
  import BottomNav from './components/BottomNav.svelte'

  let screen = 'selector'
  let activeWorkout = null
  let editingWorkout = null

  function navigate(to, data = null) {
    if (to === 'player') {
      activeWorkout = data
      screen = 'player'
    } else if (to === 'builder') {
      editingWorkout = data
      screen = 'builder'
    } else {
      screen = to
    }
  }

  $: showNav = screen !== 'player'
</script>

<div class="min-h-screen bg-[#0f0f0f] flex justify-center">
  <div class="w-full max-w-[430px] relative flex flex-col min-h-screen">

    {#if screen === 'player' && activeWorkout}
      <WorkoutPlayer
        workout={activeWorkout}
        onClose={() => navigate('selector')}
      />

    {:else if screen === 'builder'}
      <WorkoutBuilder
        workout={editingWorkout}
        onSave={() => navigate('selector')}
        onCancel={() => navigate('selector')}
      />

    {:else if screen === 'library'}
      <ExerciseLibrary />

    {:else if screen === 'settings'}
      <Settings />

    {:else}
      <WorkoutSelector
        onStart={(w) => navigate('player', w)}
        onEdit={(w) => navigate('builder', w)}
        onNew={() => navigate('builder', null)}
      />
    {/if}

    {#if showNav}
      <BottomNav
        currentScreen={screen === 'builder' ? 'selector' : screen}
        onNavigate={(s) => navigate(s)}
      />
    {/if}
  </div>
</div>
