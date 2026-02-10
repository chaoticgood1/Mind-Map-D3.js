<script lang="ts">
  import { get } from 'svelte/store';
  import { selectedNode, nodeData, isEditingNode, drawerOpen } from '../registry';

  let nodeTitle = $state<string>('');
  let nodeBody = $state<string>('');
  
  // Subscribe to update local state on selection (Replaces initial state setup)
  selectedNode.subscribe((node) => {
    if (node) {
      nodeTitle = node.data.label;
      nodeBody = node.data.body || ''; // Initialize body from store data
      console.log("Test", node)
    }
  });
  
  // Logic from startEdit() in Edit.ts
  export function startEdit() {
    const node = get(selectedNode);
    if (!node) return;

    isEditingNode.set(true);
    drawerOpen.set(true);
    
    // Set the input value to the current label (DOM manipulation required for focusing/selecting text)
    setTimeout(() => {
      // Using 'node-input' ID from existing markup
      const input = document.getElementById('node-input') as HTMLInputElement; 
      if (input) {
        input.value = node.data.label;
        input.focus();
        input.select();
      }
    }, 0);
  }
  
  // Logic from finishEdit() in Edit.ts
  export function finishEdit(updates: { label?: string; body?: string }) {
    const node = get(selectedNode);
    if (!node) return;

    // 1. Update the underlying data
    const currentData = get(nodeData);
    const newData = currentData.map((d) => {
      if (d.id === node.id) {
        return {
          ...d,
          ...updates,
        };
      }
      return d;
    });

    // 2. Update the hierarchy node label directly so the UI updates immediately
    if (updates.label !== undefined) node.data.label = updates.label;
    if (updates.body !== undefined) node.data.body = updates.body;

    nodeData.set(newData);
    // isEditingNode.set(false); // Kept commented out as in original Edit.ts

    // 3. Trigger a re-render to reflect the name change
    import('../main').then(m => m.refreshTree());
  }
  
  // Logic from cancelEdit() in Edit.ts
  export function cancelEdit() {
    isEditingNode.set(false);
  }
  
</script>

{#if $selectedNode}
  <div class="p-4 bg-white rounded shadow flex flex-col gap-4">
    <div>
      <input
        id="node-input"
        class="border p-2 w-full text-black bg-white focus:outline-none"
        type="text"
        placeholder="Insert title here"
        bind:value={nodeTitle}
      />
    </div>
  
    <div>
      <textarea
        id="node-body"
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
