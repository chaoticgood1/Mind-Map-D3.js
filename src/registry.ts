import { writable } from 'svelte/store';
import { Data, HierarchyNode } from './Data';
import * as d3 from 'd3';

export const drawerOpen = writable(true);
export const preAddNode = writable(false);

const defaultData = new Data();
const defaultHierarchy = d3.hierarchy(defaultData) as HierarchyNode;

export const selectedNode = writable<HierarchyNode | null>(null)

export const nodeData = writable<Data[]>([]);
export const copiedData = writable<Data[]>([]);
export const isEditingNode = writable<boolean>(false);