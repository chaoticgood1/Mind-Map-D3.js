import { get } from 'svelte/store';
import { selectedNode, nodeData, isEditingNode, drawerOpen, state, AppState } from '../../registry';

enum EditState {
  None,
  InputTitle,
  FocusTitle,
  BlurTitle,
  InputBody,
  FocusBody,
  BlurBody,
}

let editState: EditState = EditState.None;

export function setupInputListeners(nodeInput: HTMLInputElement, nodeBodyElement: HTMLTextAreaElement) {
  if (nodeInput) {
    nodeInput.addEventListener('input', handleInputChange);
    nodeInput.addEventListener('focus', handleInputFocus);
    nodeInput.addEventListener('blur', handleInputBlur);
  }
  
  if (nodeBodyElement) {
    nodeBodyElement.addEventListener('input', handleBodyChange);
  }
}

function handleInputChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const node = get(selectedNode);
  if (!node) return;
  node.data.label = target.value;
  console.log('Input event:', target.value);
  editState = EditState.InputTitle;
}

function handleInputFocus(e: FocusEvent) {
  const target = e.target as HTMLInputElement;
  console.log('Focus in event:', target.value);
  editState = EditState.FocusTitle;
}

function handleInputBlur(e: FocusEvent) {
  const target = e.target as HTMLInputElement;
  console.log('Focus out event:', target.value);
  editState = EditState.BlurTitle;

  window.dispatchEvent(new CustomEvent('update-tree'));
}

function handleBodyChange(e: Event) {
  const target = e.target as HTMLTextAreaElement;
  const node = get(selectedNode);
  if (!node) return;
  node.data.body = target.value;
  console.log('Body changed:', target.value);
  editState = EditState.InputBody;
}




export function init() {
  window.addEventListener('start-edit', startEdit);
  
  // Add when enter key is pressed
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && get(state) === AppState.EDITING) {
      console.log("Enter key pressed while editing");
      // Broadcast finish edit event
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


