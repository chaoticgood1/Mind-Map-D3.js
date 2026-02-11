import { writable } from 'svelte/store';

/**
 * @internal - Drawer module internal state only
 * Do not import this file from outside the drawer folder
 * Use the public API exported from index.ts instead
 */
// Local drawer-specific state
export const editingTitle = writable<string>('');
export const editingBody = writable<string>('');
export const isDirty = writable<boolean>(false);

// Edit state enum for internal drawer use
export enum EditState {
  None,
  InputTitle,
  FocusTitle,
  BlurTitle,
  InputBody,
  FocusBody,
  BlurBody,
}

export const editState = writable<EditState>(EditState.None);

// Helper functions for drawer state management
export function resetEditingState() {
  editingTitle.set('');
  editingBody.set('');
  isDirty.set(false);
  editState.set(EditState.None);
}

export function markAsDirty() {
  isDirty.set(true);
}

export function syncWithNode(node: any) {
  if (node) {
    editingTitle.set(node.data.label || '');
    editingBody.set(node.data.body || '');
    isDirty.set(false);
  }
}
