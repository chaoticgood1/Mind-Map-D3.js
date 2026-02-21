import { title, body, isDirty, currentMode, Mode } from "./LocalRegistry";
import { selectedNode, nodeData } from "../../registry";
import { get } from 'svelte/store';

export const Edit = {
  init() {
    // Set mode to Edit when a node is selected
    const unsubscribeSelectedNode = selectedNode.subscribe((node) => {
      if (node) {
        currentMode.set(Mode.Edit);
        title.set(node.data.label || '');
        body.set(node.data.body || '');
      } else {
        currentMode.set(Mode.None);
      }
    });

    // Return cleanup function
    return () => unsubscribeSelectedNode();
  },

  save() {
    if (get(currentMode) !== Mode.Edit) {
      return;
    }

    // Get current node, title, and body values directly using Svelte's get function
    const node = get(selectedNode);
    const titleValue = get(title);
    const bodyValue = get(body);
    
    if (node) {
      // Update the node's label and body
      node.data.label = titleValue;
      node.data.body = bodyValue;
      
      // Update nodeData store to reflect changes
      nodeData.update(currentData => {
        return currentData.map(item => 
          item.id === node.data.id 
            ? { ...item, label: node.data.label, body: node.data.body }
            : item
        );
      });

      // Reset dirty state
      isDirty.set(false);
      console.log('Changes saved for node:', node.data.id);
    }
  },

  cancel() {
  }
};