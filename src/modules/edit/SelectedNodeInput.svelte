<script lang="ts">
  import { selectedNode } from '../../registry';
  import { init, finishEdit, cancelEdit } from './Edit.js';

  init();

  let nodeTitle = $state<string>('');
  let nodeBody = $state<string>('');
  
  selectedNode.subscribe((node) => {
    if (node) {
      nodeTitle = node.data.label;
      nodeBody = node.data.body || '';
      console.log("Test", node)
    }
  });

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
        oninput={() => {
          const event = new CustomEvent('node-input-changed', { detail: { label: nodeTitle } });
          window.dispatchEvent(event);
        }}
      />
    </div>
  
    <div>
      <textarea
        id="node-body"
        class="border p-2 w-full text-black bg-white focus:outline-none min-h-[100px]"
        placeholder="Insert body here"
        bind:value={nodeBody}
        oninput={() => {
          const event = new CustomEvent('node-body-changed', { detail: { body: nodeBody } });
          window.dispatchEvent(event);
        }}
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

