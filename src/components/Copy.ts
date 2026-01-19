import { get } from 'svelte/store';
import { selectedNode, copiedData } from '../registry';
import { Data } from '../Data';

export function init() {
  window.addEventListener('keydown', (ev) => {
    if (ev.ctrlKey && ev.key === 'c' && get(selectedNode) !== undefined) {
      ev.preventDefault();
      copyNode();
    }
  });
}

function copyNode() {
  const nodeToCopy = get(selectedNode);
  if (!nodeToCopy) return;

  // Get all descendant nodes (D3 hierarchy already has this)
  const descendants = nodeToCopy.descendants();
  
  // Convert hierarchy nodes back to flat Data format
  const dataToCopy: Data[] = descendants.map(d => ({
    ...d.data,
    // We'll keep the relative structure but IDs will need to be unique when pasting
    // For now we just store the data as-is
  }));

  copiedData.set(dataToCopy);
  console.log('Copied nodes:', dataToCopy);
}
