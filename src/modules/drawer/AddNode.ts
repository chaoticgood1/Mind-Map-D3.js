import { get } from "svelte/store";
import { selectedNode, nodeData } from "../../registry";
import { currentMode, Mode, title, body, titlePlaceholder, bodyPlaceholder } from "./LocalRegistry";
import { Data } from "../../Data";

export const AddNode = {
  init() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);
  },
};

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Tab' && get(selectedNode)) {
    event.preventDefault();
    
    const currentModeValue = get(currentMode);
    const titleValue = get(title);
    
    if (currentModeValue === Mode.Add && titleValue.trim()) {
      // If in Add mode and title has content, save current node
      save();
      // Then start new add process
      titlePlaceholder.set('Add Title');
      bodyPlaceholder.set('Add Body');
      title.set('');
      body.set('');
      currentMode.set(Mode.Add);
    } else if (currentModeValue !== Mode.Add) {
      // If not in Add mode, start add process
      titlePlaceholder.set('Add Title');
      bodyPlaceholder.set('Add Body');
      title.set('');
      body.set('');
      currentMode.set(Mode.Add);
    }
  }
}

function handleClick(event: MouseEvent) {
  const saveButton = document.getElementById('save-button');
  if (saveButton && event.target && saveButton.contains(event.target as Node)) {
    save();
  }
}


function save() {
  console.log("Save")
  if (get(currentMode) !== Mode.Add) {
    return;
  }
  
  const titleValue = get(title);
  const bodyValue = get(body);
  
  createChild(titleValue, bodyValue);
  
  // Reset the form and mode
  title.set('');
  body.set('');
  currentMode.set(Mode.None);
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