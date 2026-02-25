import { get } from 'svelte/store';
import { selectedNode, nodeData, copiedData } from '../registry';
import { Data } from '../Data';

export function init() {
  window.addEventListener('keydown', (ev) => {
    if (ev.ctrlKey && ev.key === 'v' && get(selectedNode) !== undefined && get(copiedData).length > 0) {
      ev.preventDefault();
      pasteNode();
    }
  });
}

function pasteNode() {
  const targetParent = get(selectedNode);
  const dataToPaste = get(copiedData);
  if (!targetParent || dataToPaste.length === 0) return;

  const currentData = get(nodeData);
  const idMap = new Map<string, string>();

  // 1. Generate new IDs for all nodes to be pasted
  dataToPaste.forEach(node => {
    idMap.set(node.id, Math.random().toString(36).substr(2, 9));
  });

  // 2. Clone the data with new IDs and update childrenIds
  const newNodes: Data[] = dataToPaste.map(node => {
    const newId = idMap.get(node.id)!;
    const newChildrenIds = node.childrenIds
      .map(oldChildId => idMap.get(oldChildId))
      .filter((id): id is string => id !== undefined);

    return {
      ...node,
      id: newId,
      childrenIds: newChildrenIds
    };
  });

  // 3. Attach the root of the pasted subtree to the selected node
  const pastedRoot = newNodes[0];
  const updatedCurrentData = currentData.map(node => {
    if (node.id === targetParent.id) {
      return {
        ...node,
        childrenIds: [...node.childrenIds, pastedRoot.id]
      };
    }
    return node;
  });

  // 4. Update state with current data + new nodes
  nodeData.set([...updatedCurrentData, ...newNodes]);
  console.log('Pasted nodes under:', targetParent.id);
}
