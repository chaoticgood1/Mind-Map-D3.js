<script lang="ts">
  import { preAddNode } from '../registry';

  // This function runs every time the input enters the DOM
  function selectOnEntry(node: HTMLInputElement) {
    // Timeout ensures the browser is ready to receive focus
    setTimeout(() => {
      node.focus();
    }, 0);
  }
</script>

{#if $preAddNode}
  <div class="p-4 bg-white rounded shadow">
    <h3 class="text-lg font-semibold text-slate-900 mb-2">
      Add Title
    </h3>
    <input 
      type="text" 
      placeholder="Insert text here" 
      class="border p-2 w-full text-black bg-white"
      use:selectOnEntry 
    />
  </div>
{/if}