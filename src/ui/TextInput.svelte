<script lang="ts">
  import { get } from 'svelte/store';
  import { selectedNode } from '../registry';

  let title = $state('');
  let body = $state('');

  selectedNode.subscribe((node) => {
    title = node.data.label;
    console.log("Test", node)
  });
</script>

<div class="p-4 bg-white rounded shadow flex flex-col gap-4">
  <div>
    <h3 class="text-lg font-semibold text-slate-900 mb-2">
      Title
    </h3>
    <input
      id="node-input"
      class="border p-2 w-full text-black bg-white focus:outline-none"
      type="text"
      placeholder="Insert title here"
      value={title}
      oninput={(e) => {
        window.dispatchEvent(
          new CustomEvent('node-input-changed', { detail: e.target.value })
        );
      }}
    />
  </div>

  <div>
    <h3 class="text-lg font-semibold text-slate-900 mb-2">
      Body
    </h3>
    <textarea
      id="node-body"
      class="border p-2 w-full text-black bg-white focus:outline-none min-h-[100px]"
      placeholder="Insert body here"
      value={body}
      oninput={(e) => {
        window.dispatchEvent(
          new CustomEvent('node-body-changed', { detail: e.value })
        );
      }}
    ></textarea>
  </div>
</div>