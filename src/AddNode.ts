

import { drawerOpen } from './registry';

export function init() {
  document.onkeydown = function(ev) {
    switch (ev.key) {
      case "Tab":
        add();
        ev.preventDefault();
        // Toggle drawerOpen using registry
        drawerOpen.update(open => !open);
        break;
      default:
    }
  }
}

function add() {
  console.log("Add Node");
}