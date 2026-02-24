import { writable } from 'svelte/store';

/**
 * @internal - Drawer module internal state only
 * Do not import this file from outside the drawer folder
 * Use the public API exported from index.ts instead
 */

// Mode enum for Edit/Add functionality
export enum Mode {
  None,
  Edit,
  Add,
}

// Local drawer-specific state
export const title = writable<string>('');
export const body = writable<string>('');
export const isDirty = writable<boolean>(false);
export const titlePlaceholder = writable<string>('Edit title');
export const bodyPlaceholder = writable<string>('Edit body');
export const currentMode = writable<Mode>(Mode.None);
