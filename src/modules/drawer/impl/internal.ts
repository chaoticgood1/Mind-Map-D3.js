/**
 * Drawer module INTERNAL API
 * Only for use within the drawer folder
 */

import { writable, derived } from 'svelte/store';

// Mode enum for Edit/Add functionality
export enum Mode {
  None,
  Edit,
  Add,
}

// Private drawer-specific state (only for internal use)
export const title = writable<string>('');
export const body = writable<string>('');
export const isDirty = writable<boolean>(false);
export const titlePlaceholder = writable<string>('Edit title');
export const bodyPlaceholder = writable<string>('Edit body');
export const currentMode = writable<Mode>(Mode.None);

export const inputText = derived(currentMode, $currentMode => Mode[$currentMode]);

export const focusTarget = writable<'title' | 'body' | null>(null);
