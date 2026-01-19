

import { Data } from './Data';
import { preAddNode, selectedNode, nodeData } from './registry';
import { get } from 'svelte/store';

export function init() {
  window.addEventListener('keydown', (ev) => {
    if (ev.key === "Tab" && (get(selectedNode) !== undefined)) {
      ev.preventDefault();
      preAddNode.set(true)
    }

    if (ev.key === "Enter" && get(preAddNode)) {
      addNode();
      preAddNode.set(false)
    }
  });
}


preAddNode.subscribe((value) => {
  if (value) {
    // preAddNode.set(false)
    console.log("Show text input");
  }
});

function addNode() {
  const inputElement = document.getElementById('add-node-input') as HTMLInputElement;
  if (inputElement) {
    console.log("Value via DOM:", inputElement.value);

    const parent = get(selectedNode);
    if (parent && inputElement.value.trim()) {
      // Get current flat data
      const currentData = get(nodeData);

      // Create new node data
      const newNodeId = crypto.randomUUID();
      const newData: Data = {
        id: newNodeId,
        label: inputElement.value.trim(),
        childrenIds: []
      };

      // Update the parent node to include the new child
      const updatedData = currentData.map(node => {
        if (node.id === parent.data.id) {
          return {
            ...node,
            childrenIds: [...node.childrenIds, newNodeId]
          };
        }
        return node;
      });

      nodeData.set([...updatedData, newData]);
      inputElement.value = '';

    } else if (!inputElement.value.trim()) {
      console.warn("Cannot add node with empty label");
    }
  } else {
    console.warn("Input element was already removed from DOM!");
  }
}