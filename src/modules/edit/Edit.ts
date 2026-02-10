import { get } from 'svelte/store';
import { selectedNode, nodeData, isEditingNode, drawerOpen, state, AppState } from '../../registry';

export function init() {
  window.addEventListener('node-input-changed', (e: Event) => {
    const event = e as CustomEvent;
    const node = get(selectedNode);
    if (!node) return;
    node.data.label = event.detail.label;
    state.set(AppState.EDITING);
    console.log(event.detail.label);
  });
  window.addEventListener('node-body-changed', (e: Event) => {
    console.log("Body changed:", (e as CustomEvent).detail);
  });
  window.addEventListener('start-edit', () => {
    // startEdit();
    console.log("Start edit");
  });
  // Add when enter key is pressed
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && get(state) === AppState.EDITING) {
      // startEdit();
      console.log("Enter key pressed while editing");
      // Broadcast the finish edit event
      window.dispatchEvent(new CustomEvent('update-tree'));
    }
  });
}


export function startEdit() {
  const node = get(selectedNode);
  if (!node) return;

  isEditingNode.set(true);
  drawerOpen.set(true);
  
  // Set the input value to the current label
  setTimeout(() => {
    const input = document.getElementById('edit-node-input') as HTMLInputElement;
    if (input) {
      input.value = node.data.label;
      input.focus();
      input.select();
    }
  }, 0);
}

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
  // isEditingNode.set(false);

  // 3. Trigger a re-render to reflect the name change
  import('../../main').then(m => m.refreshTree());
}

export function cancelEdit() {
  isEditingNode.set(false);
}
