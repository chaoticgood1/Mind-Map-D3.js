import { writable } from 'svelte/store';

export const drawerOpen = writable(true);
export const addNode = writable(false);

export const selectedNode = writable<any | null>(null);

export const circleNode = writable<any | null>(null);