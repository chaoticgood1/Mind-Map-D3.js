import { get } from "svelte/store";
import { selectedNode, nodeData } from "../../../registry";
import { currentMode, Mode, title, body, titlePlaceholder, bodyPlaceholder } from "./internal";
import { Data } from "../../../Data";

export const AddNode = {
  init() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);
  },
};

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Tab' && get(selectedNode)) {
    event.preventDefault();
    onEditMode();
  }

  if (event.key === 'Enter' && get(selectedNode)) {
    event.preventDefault();
    save();
  }
}

function handleClick(event: MouseEvent) {
  const saveButton = document.getElementById('save-button');
  if (saveButton && event.target && saveButton.contains(event.target as Node)) {
    save();
  }
}

function onEditMode() {
  const currentModeValue = get(currentMode);
  
  if (currentModeValue !== Mode.Add) {
    // If not in Add mode (i.e., in Edit mode), start add process
    titlePlaceholder.set('Add Title');
    bodyPlaceholder.set('Add Body');
    title.set('');
    body.set('');
    currentMode.set(Mode.Add);
  }
}


function save() {
  const currentModeValue = get(currentMode);
  const titleValue = get(title);
  
  if (currentModeValue === Mode.Add) {
    // If in Add mode and title has content, save current node
    if (!titleValue.trim()) {
      // If title is empty, cancel and go to edit mode
      const selected = get(selectedNode);
      if (selected) {
        titlePlaceholder.set('Edit title');
        bodyPlaceholder.set('Edit body');
        title.set(selected.data.label || '');
        body.set(selected.data.body || '');
        currentMode.set(Mode.Edit);
      }
      return;
    }
    
    // If title has content, create child and continue in add mode
    const bodyValue = get(body);
    createChild(titleValue, bodyValue);
    
    // Reset form and stay in add mode for continuous creation
    title.set('');
    body.set('');
    titlePlaceholder.set('Add Title');
    bodyPlaceholder.set('Add Body');
    currentMode.set(Mode.Add);
  } else {
    // If not in Add mode (i.e., in Edit mode), start add process
    titlePlaceholder.set('Add Title');
    bodyPlaceholder.set('Add Body');
    title.set('');
    body.set('');
    currentMode.set(Mode.Add);
  }
}



function createChild(titleValue?: string, bodyValue?: string) {
  const selected = get(selectedNode);
  if (!selected) {
    return;
  }
  
  // Generate a unique ID for the new node
  const currentData = get(nodeData);
  const maxId = Math.max(...currentData.map(node => parseInt(node.id) || 0));
  const newId = (maxId + 1).toString();
  
  // Create the new child node
  const newNode: Data = {
    id: newId,
    label: titleValue || `Node ${newId}`,
    body: bodyValue || '',
    childrenIds: []
  };
  
  // Update the nodeData store with the new node and updated parent
  nodeData.update(currentData => {
    const updatedData = [...currentData];
    
    // Add the new node to the data array
    updatedData.push(newNode);
    
    // Find and update the parent node to include the new child
    const parentNode = updatedData.find(node => node.id === selected.data.id);
    if (parentNode) {
      parentNode.childrenIds = [...parentNode.childrenIds, newId];
    }
    
    return updatedData;
  });
}