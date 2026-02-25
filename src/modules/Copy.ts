import { get } from 'svelte/store';
import { selectedNode, copiedData, nodeData } from '../registry';

export function init() {
  window.addEventListener('keydown', (ev) => {
    if (ev.ctrlKey && ev.key === 'c' && get(selectedNode) !== undefined) {
      ev.preventDefault();
      copyNode();
    }
  });
}

function copyNode() {
  const selected = get(selectedNode);
  if (!selected) return;

  const descendants = selected.descendants();
  const allIds = [selected.id, ...descendants.map(d => d.id)];

  const copied = get(nodeData).filter(node => allIds.includes(node.id));
  copiedData.set(copied);

  console.log(copied)
}
