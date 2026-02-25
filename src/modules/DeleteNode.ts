import { get } from 'svelte/store';
import { nodeData, selectedNode } from '../registry';
import { Data, HierarchyNode } from '../Data';

export function init() {
  window.addEventListener('keydown', (ev) => {
    if (ev.key === "Delete" && get(selectedNode) !== undefined) {
      ev.preventDefault();
      deleteNode();
    }
  });
}

function deleteNode() {
  const nodeToDelete = get(selectedNode);
  if (!nodeToDelete) return;

  const idToDelete = nodeToDelete.id;
  const currentData = get(nodeData);

  // 1. Find all descendant IDs to remove them from the flat list
  const descendants = nodeToDelete.descendants();
  const allIdsToRemove = [idToDelete, ...descendants.map(d => d.id)];

  // 2. Filter out the node and all its descendants from the flat data
  const newData = currentData.filter(node => !allIdsToRemove.includes(node.id));

  // 3. Remove the deleted node from its parent's childrenIds list
  const parent = nodeToDelete.parent;
  if (parent && parent.data) {
    const parentDataIndex = newData.findIndex(node => node.id === parent.data.id);
    if (parentDataIndex !== -1) {
      newData[parentDataIndex] = {
        ...newData[parentDataIndex],
        childrenIds: newData[parentDataIndex].childrenIds.filter(childId => childId !== idToDelete)
      };
    }
  }
  
  // 4. Update state
  nodeData.set(newData);
  selectedNode.set(undefined);
}
