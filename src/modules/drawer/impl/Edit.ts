import { title, body, isDirty, currentMode, Mode } from "./internal";
import { selectedNode, nodeData } from "../../../registry";
import { get } from 'svelte/store';

export const Edit = {
  init() {
    selectedNode.subscribe((node) => {
      if (node) {
        currentMode.set(Mode.Edit);
        title.set(node.data.label || '');
        body.set(node.data.body || '');
      } else {
        currentMode.set(Mode.None);
      }
    });

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
  },
};

function handleKeyDown(event: KeyboardEvent) {
  if (get(currentMode) !== Mode.Edit) {
    return;
  }

  if (event.key === 'Escape') {
    currentMode.set(Mode.None);
    selectedNode.set(undefined);
  }

  if (event.key === 'Enter') {
    save();
  }
}

function handleClick(event: MouseEvent) {
  const saveButton = document.getElementById('save-button');
  if (saveButton && 
    saveButton.contains(event.target as Node) && 
    get(currentMode) === Mode.Edit) {
    save();
  }
}

function save() {
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
}