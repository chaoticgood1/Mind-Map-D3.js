import { writable } from 'svelte/store';
import { Data, HierarchyNode } from './Data';
import * as d3 from 'd3';

export const drawerOpen = writable(true);
export const preAddNode = writable(false);


export const selectedNode = writable<HierarchyNode | null>(null)

export const nodeData = writable<Data[]>([]);
export const copiedData = writable<Data[]>([]);
export const isEditingNode = writable<boolean>(false);

export enum AppState {
  IDLE = 'idle',
  EDITING = 'editing',
  ADDING = 'adding',
  DELETING = 'deleting',
  COPYING = 'copying',
  PASTING = 'pasting',
  CUTTING = 'cutting',
  SELECTING = 'selecting',
  ZOOMING = 'zooming',
  PANNING = 'panning',
  DRAGGING = 'dragging',
  RESIZING = 'resizing',
  SAVING = 'saving',
  LOADING = 'loading',
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info',
  DEBUG = 'debug',
  UNKNOWN = 'unknown'
}
export const state = writable<AppState>(AppState.IDLE);
