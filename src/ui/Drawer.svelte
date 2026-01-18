<script lang="ts">
  import { fly } from 'svelte/transition';
  import { drawerOpen } from '../registry';
  import TextInput from './TextInput.svelte';
</script>

{#if $drawerOpen}
  <div
    transition:fly={{ x: 320, duration: 300 }}
    class="fixed right-0 top-0 h-full w-80
           bg-gray-600/80
           border-l border-gray-200
           shadow-2xl overflow-y-auto z-50"
  >
    <div class="p-6">
      <TextInput />
    </div>
  </div>
{/if}