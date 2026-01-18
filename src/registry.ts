import { writable } from 'svelte/store';

// Global registry for shared state between components and external modules
export const drawerOpen = writable(true);