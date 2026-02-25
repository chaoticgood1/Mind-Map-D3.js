<script lang="ts">
  import { selectedNode } from "../../../registry";
  import { body, title, titlePlaceholder, bodyPlaceholder, currentMode, Mode, focusTarget } from "./internal";
  import { Edit } from "./Edit";
  import { AddNode } from "./AddNode";

  let titleInput: HTMLInputElement;
  let bodyInput: HTMLElement;

  $: if ($focusTarget === 'title') {
    titleInput?.focus();
    focusTarget.set(null);
  } else if ($focusTarget === 'body') {
    bodyInput?.focus();
    focusTarget.set(null);
  }

  Edit.init();
  AddNode.init();
</script>

{#if $selectedNode}
  <div id="node-input" data-testid="node-input" class="p-4 bg-white rounded shadow flex flex-col gap-4">
    <text class="text-black">{Mode[$currentMode]}</text>
    <div>
      <input
        data-testid="title-input"
        class="border p-2 w-full text-black bg-white focus:outline-none"
        type="text"
        placeholder={$titlePlaceholder}
        bind:value={$title}
        bind:this={titleInput}
      />
    </div>
  
    <div
      contenteditable
      data-testid="body-input"
      data-placeholder={$bodyPlaceholder}
      class="border p-2 w-full text-black bg-white focus:outline-none min-h-[100px] whitespace-pre-wrap"
      role="textbox"
      tabindex="0"
      on:keydown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' && e.shiftKey) {
          e.preventDefault();
          document.execCommand('insertText', false, '\n');
        }
      }}
      bind:innerText={$body}
      bind:this={bodyInput}
    ></div>

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

