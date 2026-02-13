<script lang="ts">
    import { selectedNode } from "../../registry";
    import { editingBody, editingTitle } from "./registry";
</script>

{#if $selectedNode}
  <div id="drawer" data-testid="drawer" class="p-4 bg-white rounded shadow flex flex-col gap-4">
    <div>
      <input
        data-testid="title-input"
        class="border p-2 w-full text-black bg-white focus:outline-none"
        type="text"
        placeholder="Insert title here"
        bind:value={$editingTitle}
      />
    </div>
  
    <div>
      <textarea
        data-testid="body-input"
        class="border p-2 w-full text-black bg-white focus:outline-none min-h-[100px]"
        placeholder="Insert body here"
        bind:value={$editingBody}
      ></textarea>
    </div>
  </div>
{/if}

