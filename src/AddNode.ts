

import { drawerOpen, addNode } from './registry';

export function init() {
  document.onkeydown = function(ev) {
    switch (ev.key) {
      case "Tab":
        add();
        ev.preventDefault();
        // Toggle drawerOpen using registry
        // drawerOpen.update(open => !open);
        break;
      default:
    }
  }
}

function add() {
  console.log("Add Node");
}


const unsubscribe = addNode.subscribe((value) => {
  if (value === true) {
    console.log("Add Node mode activated in D3!");
    // Trigger your D3 logic here
    
    // Optional: Reset the store after handling the action
    // addNode.set(false);
  }
});