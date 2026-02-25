import { get } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
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
  const selected = get(selectedNode);
  const copied = get(copiedData);

  // Create ID mapping for all copied nodes - generate fresh UUIDs each time
  const idMapping = new Map<string, string>();
  copied.forEach(node => {
    idMapping.set(node.id, uuidv4());
  });

  // Find which nodes are roots in the original copied structure
  const allChildIds = new Set<string>();
  copied.forEach(node => {
    node.childrenIds.forEach(childId => allChildIds.add(childId));
  });
  const rootNodeIds = copied.filter(node => !allChildIds.has(node.id)).map(node => node.id);

  // Create temp copy with replaced IDs using the mapping
  const tempCopied = copied.map(node => ({
    ...node,
    id: idMapping.get(node.id)!,
    childrenIds: node.childrenIds
      .filter(childId => idMapping.has(childId)) // Only keep children that are in copied structure
      .map(childId => idMapping.get(childId)!)
  }));

  // Then paste each node maintaining hierarchy
  tempCopied.forEach(node => {
    const newNode: Data = {
      id: node.id,
      label: node.label,
      body: node.body,
      childrenIds: node.childrenIds
    };

    nodeData.update(currentData => {
      const updatedData = [...currentData];
      updatedData.push(newNode);
      
      // Only add as child of selected node if this was originally a root node
      const originalNodeId = Array.from(idMapping.keys()).find(key => idMapping.get(key) === node.id);
      if (originalNodeId && rootNodeIds.includes(originalNodeId)) {
        const parentNode = updatedData.find(n => n.id === selected.id);
        if (parentNode) {
          parentNode.childrenIds.push(node.id);
        }
      }
      
      return updatedData;
    });
  });
}
