<script>
  export let currentScreen = 'selector'
  export let onNavigate = () => {}

  const tabs = [
    { id: 'selector', label: 'Workouts', icon: '🏠' },
    { id: 'library', label: 'Library', icon: '📚' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]
</script>

<nav class="fixed bottom-0 left-0 right-0 flex justify-center z-50">
  <div class="w-full max-w-[430px] bg-[#0f0f0f] border-t border-[#252525] flex">
    {#each tabs as tab}
      <button
        class="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors
          {currentScreen === tab.id ? 'text-green-500' : 'text-gray-600'}"
        on:click={() => onNavigate(tab.id)}
      >
        <span class="text-lg leading-none">{tab.icon}</span>
        <span>{tab.label}</span>
      </button>
    {/each}
  </div>
</nav>
