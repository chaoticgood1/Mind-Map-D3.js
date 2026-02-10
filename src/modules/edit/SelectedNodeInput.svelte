<script lang="ts">
  import { onMount } from 'svelte';
  import { selectedNode } from '../../registry';
  import { finishEdit, cancelEdit, setupInputListeners } from './Edit.js';

  let nodeTitle = $state<string>('');
  let nodeBody = $state<string>('');
  let nodeInput = $state.raw<HTMLInputElement>();
  let nodeBodyElement = $state.raw<HTMLTextAreaElement>();
  
  selectedNode.subscribe((node) => {
    if (node) {
      nodeTitle = node.data.label;
      nodeBody = node.data.body || '';
    }
  });

  onMount(() => {
    console.log("onMount")
  });

  $effect(() => {
    if (nodeInput && nodeBodyElement) {
      setupInputListeners(nodeInput, nodeBodyElement);
    }
  });

  // Event handlers are now in Edit.ts

</script>

{#if $selectedNode}
  <div class="p-4 bg-white rounded shadow flex flex-col gap-4">
    <div>
      <input
      bind:this={nodeInput}
        class="border p-2 w-full text-black bg-white focus:outline-none"
        type="text"
        placeholder="Insert title here"
        bind:value={nodeTitle}
      />
    </div>
  
    <div>
      <textarea
      bind:this={nodeBodyElement}
        class="border p-2 w-full text-black bg-white focus:outline-none min-h-[100px]"
        placeholder="Insert body here"
        bind:value={nodeBody}
      ></textarea>
    </div>
    
    <div class="flex justify-end gap-2">
      <button onclick={cancelEdit}>
          Cancel
        </button>
        <button onclick={() => finishEdit({ label: nodeTitle, body: nodeBody })}>
          Save
        </button>
    </div>
  </div>
{/if}

