export { default as Drawer } from './Drawer.svelte';

/**
 * Drawer module PUBLIC API
 * Only what's exported here is available globally
 */

// Import internal state
import { currentMode, Mode } from './impl/internal';

// Global exports - available anywhere in the app
export { Edit } from './impl/Edit';
export { AddNode } from './impl/AddNode';
export { currentMode, Mode };
