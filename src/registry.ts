import { writable } from 'svelte/store';
import { Data, HierarchyNode } from './Data';

export const drawerOpen = writable(true);
export const preAddNode = writable(false);

export const selectedNode = writable<HierarchyNode | undefined>(undefined);

export const nodeData = writable<Data[]>([]);

export const copiedData = writable<Data[]>([]);

export const isEditingNode = writable<boolean>(false);