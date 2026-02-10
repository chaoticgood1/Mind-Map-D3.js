

import { Data } from './Data';
import { preAddNode, selectedNode, nodeData } from './registry';
import { get } from 'svelte/store';

let newNodeLabel: string = '';

export function init() {
  window.addEventListener('node-input-changed', ((e: Event) => {
    const customEvent = e as CustomEvent;
    newNodeLabel = customEvent.detail;
    console.log("Received node-input-changed with detail:", newNodeLabel);
  }) as EventListener);

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

function addNode() {
  const parent = get(selectedNode);
  if (parent && newNodeLabel.trim()) {
      // Get current flat data
      const currentData = get(nodeData);

      // Create new node data
      const newNodeId = crypto.randomUUID();
      const newData: Data = {
        id: newNodeId,
        label: newNodeLabel.trim(),
        body: '',
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
      // newNodeLabel is not cleared here, should be cleared by event dispatcher,
      // or by preAddNode becoming false.

  } else if (!newNodeLabel.trim()) {
      console.warn("Cannot add node with empty label");
  } else {
    // Assuming input element is gone only if we didn't handle it via event
    console.warn("Input element was already removed from DOM or value source is missing!");
  }
}