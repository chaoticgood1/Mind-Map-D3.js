import { editingTitle, editingBody, isDirty } from "./LocalRegistry";
import { selectedNode, nodeData } from "../../registry";
import { get } from 'svelte/store';

export const Edit = {
  init() {
  },

  save() {
    // Get current node, title, and body values directly using Svelte's get function
    const node = get(selectedNode);
    const title = get(editingTitle);
    const body = get(editingBody);
    
    if (node) {
      // Update the node's label and body
      node.data.label = title;
      node.data.body = body;
      
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