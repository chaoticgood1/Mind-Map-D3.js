<script lang="ts">
  import { selectedNode } from "../../registry";
  import { body, title, titlePlaceholder, bodyPlaceholder } from "./LocalRegistry";
  import { Edit } from "./Edit";
  import { AddNode } from "./AddNode";

  Edit.init();
  AddNode.init();
</script>

{#if $selectedNode}
  <div id="node-input" data-testid="node-input" class="p-4 bg-white rounded shadow flex flex-col gap-4">
    <div>
      <input
        data-testid="title-input"
        class="border p-2 w-full text-black bg-white focus:outline-none"
        type="text"
        placeholder={$titlePlaceholder}
        bind:value={$title}
      />
    </div>
  
    <div>
      <textarea
        data-testid="body-input"
        class="border p-2 w-full text-black bg-white focus:outline-none min-h-[100px]"
        placeholder={$bodyPlaceholder}
        bind:value={$body}
      ></textarea>
    </div>

    <div class="flex gap-2">
      <button id="save-button" data-testid="save-button" class="border p-2 bg-blue-500 text-white">
        Save
      </button>
      <button id="cancel-button" data-testid="cancel-button" class="border p-2 bg-gray-500 text-white">
        Cancel
      </button>
    </div>
  </div>
{:else}
  <!-- Debug: Show when selectedNode is falsy -->
  <div style="display: none;" data-testid="drawer-hidden">No node selected</div>
{/if}

