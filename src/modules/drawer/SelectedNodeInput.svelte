<script lang="ts">
  import { selectedNode } from '../../registry';
  import { editingTitle, editingBody, syncWithNode } from './registry';

  // Sync with selected node using local registry
  $effect(() => {
    const node = $selectedNode;
    syncWithNode(node);
  });
  
  // Update node when local state changes
  $effect(() => {
    const node = $selectedNode;
    const title = $editingTitle;
    const body = $editingBody;
    
    if (node && (node.data.label !== title || node.data.body !== body)) {
      node.data.label = title;
      node.data.body = body;
      window.dispatchEvent(new CustomEvent('update-tree'));
    }
  });
</script>

{#if $selectedNode}
  <div class="p-4 bg-white rounded shadow flex flex-col gap-4">
    <div>
      <input
        class="border p-2 w-full text-black bg-white focus:outline-none"
        type="text"
        placeholder="Insert title here"
        bind:value={$editingTitle}
      />
    </div>
  
    <div>
      <textarea
        class="border p-2 w-full text-black bg-white focus:outline-none min-h-[100px]"
        placeholder="Insert body here"
        bind:value={$editingBody}
      ></textarea>
    </div>
  </div>
{/if}

