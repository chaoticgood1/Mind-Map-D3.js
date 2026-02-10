import { get } from 'svelte/store';
import { selectedNode, nodeData, isEditingNode, drawerOpen, state, AppState } from '../../registry';

enum EditState {
  None,
  InputTitle,
  FocusTitle,
  BlurTitle,
  InputBody,
  FocusBody,
  BlurBody,
}

let editState: EditState = EditState.None;

export function setupInputListeners(nodeInput: HTMLInputElement, nodeBodyElement: HTMLTextAreaElement) {
  nodeInput.addEventListener('input', handleInputChange);
  nodeInput.addEventListener('focus', handleInputFocus);
  nodeInput.addEventListener('blur', handleInputBlur);
  
  nodeBodyElement.addEventListener('input', handleBodyChange);
  nodeBodyElement.addEventListener('focus', handleBodyFocus);
  nodeBodyElement.addEventListener('blur', handleBodyBlur); 
}

function handleInputChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const node = get(selectedNode);
  if (!node) return;
  node.data.label = target.value;
  editState = EditState.InputTitle;
}

function handleInputFocus(e: FocusEvent) {
  const target = e.target as HTMLInputElement;
  editState = EditState.FocusTitle;
}

function handleInputBlur(e: FocusEvent) {
  const target = e.target as HTMLInputElement;
  editState = EditState.BlurTitle;

  window.dispatchEvent(new CustomEvent('update-tree'));
}

function handleBodyChange(e: Event) {
  const target = e.target as HTMLTextAreaElement;
  const node = get(selectedNode);
  if (!node) return;
  node.data.body = target.value;
  editState = EditState.InputBody;
}

function handleBodyFocus(e: FocusEvent) {
  const target = e.target as HTMLTextAreaElement;
  editState = EditState.FocusBody;
}

function handleBodyBlur(e: FocusEvent) {
  const target = e.target as HTMLTextAreaElement;
  editState = EditState.BlurBody;

  window.dispatchEvent(new CustomEvent('update-tree'));
}

