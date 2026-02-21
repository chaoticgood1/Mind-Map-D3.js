import { get } from "svelte/store";
import { selectedNode } from "../../registry";
import { currentMode, Mode } from "./LocalRegistry";

export const AddNode = {
  init() {
    // Listen for tab key when there's a selected node
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab' && selectedNode) {
        event.preventDefault();
        setAddMode();
      }
    });
  },

  save() {
    if (get(currentMode) !== Mode.Add) {
      return;
    }
    
    // TODO: Implement save added node logic
  },
};

function setAddMode() {
  currentMode.set(Mode.Add);
}