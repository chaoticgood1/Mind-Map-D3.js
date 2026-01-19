<script lang="ts">
  import { preAddNode } from '../registry';


  function selectOnEntry(node: HTMLInputElement) {
    setTimeout(() => { node.focus(); }, 0);
  }
</script>

{#if $preAddNode}
  <div class="p-4 bg-white rounded shadow">
    <h3 class="text-lg font-semibold text-slate-900 mb-2">
      Add Title
    </h3>
    <input
      id="add-node-input"
      class="border p-2 w-full text-black bg-white focus:outline-none"
      type="text" 
      placeholder="Insert text here" 
      use:selectOnEntry
    />
  </div>
{/if}