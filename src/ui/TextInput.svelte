<script lang="ts">
  import { preAddNode, selectedNode } from '../registry';
  import * as Edit from '../components/Edit';

  let { onsubmit, oncancel } = $props<{
    onsubmit?: (val: string) => void;
    oncancel?: () => void;
  }>();

  function selectOnEntry(node: HTMLElement) {
    setTimeout(() => { node.focus(); }, 0);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      onsubmit?.(target.value);
    } else if (event.key === 'Escape') {
      oncancel?.();
    }
  }

  function handleEditSubmit(event: KeyboardEvent, field: 'label' | 'body') {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      Edit.finishEdit({ [field]: target.value });
    } else if (event.key === 'Escape') {
      Edit.cancelEdit();
    }
  }

  function handleBlur(event: FocusEvent, field: 'label' | 'body') {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    Edit.finishEdit({ [field]: target.value });
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
      on:keydown={handleKeydown}
    />
  </div>
{/if}

{#if $selectedNode && !$preAddNode}
  <div class="p-4 bg-white rounded shadow flex flex-col gap-4">
    <div>
      <h3 class="text-lg font-semibold text-slate-900 mb-2">
        Title
      </h3>
      <input
        id="edit-node-input"
        class="border p-2 w-full text-black bg-white focus:outline-none"
        type="text"
        placeholder="Insert title here"
        value={$selectedNode.data.label}
        on:keydown={(e: KeyboardEvent) => handleEditSubmit(e, 'label')}
        on:blur={(e: FocusEvent) => handleBlur(e, 'label')}
      />
    </div>

    <div>
      <h3 class="text-lg font-semibold text-slate-900 mb-2">
        Body
      </h3>
      <textarea
        id="edit-node-body"
        class="border p-2 w-full text-black bg-white focus:outline-none min-h-[100px]"
        placeholder="Insert body here"
        value={$selectedNode.data.body}
        on:blur={(e: FocusEvent) => handleBlur(e, 'body')}
      ></textarea>
    </div>
  </div>
{/if}