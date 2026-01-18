import { writable } from 'svelte/store';

export const drawerOpen = writable(true);
export const preAddNode = writable(false);
export const addNode = writable(false);

export const selectedNode = writable<any | null>(null);