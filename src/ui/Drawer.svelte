<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { drawerOpen, addNode } from '../registry';
</script>

{#if $drawerOpen}


  <div
    transition:fly={{ x: 320, duration: 300 }}
    class="fixed right-0 top-0 h-full w-80
           bg-white
           border-l border-gray-200
           shadow-2xl overflow-y-auto z-50"
  >
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-slate-900">
          Mind Map Controls
        </h2>
        <button
          class="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          on:click={() => drawerOpen.set(false)}
        >✕</button>
      </div>

      <div class="space-y-4">

        <div class="p-4 bg-white border border-slate-200 rounded-lg">
          <h3 class="text-lg font-semibold mb-3 text-slate-800">
            Actions
          </h3>
          <div class="grid grid-cols-1 gap-2">
            <button class="px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded-md transition-colors flex items-center gap-2"
            on:click={() => addNode.set(true)}>➕ Add Node
            </button>
            <button class="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors flex items-center gap-2">🗑️ Delete Node</button>
          </div>
        </div>
      </div>

      <div class="mt-6 p-3 bg-slate-100 rounded text-sm text-slate-600">
        <p><strong>Tip:</strong> Press <kbd class="kbd bg-white border-slate-300 text-slate-900">Tab</kbd> to toggle this drawer</p>
      </div>
    </div>
  </div>
{/if}