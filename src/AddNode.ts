

import { preAddNode, selectedNode } from './registry';
import { get } from 'svelte/store';

export function init() {
  document.onkeydown = function(ev) {
    switch (ev.key) {
      case "Tab":
        if (get(selectedNode) !== null) {
          preAddNode.set(true)
        }
        ev.preventDefault()
        break;
      default:
    }
  }
}


preAddNode.subscribe((value) => {
  if (value === true) {
    // preAddNode.set(false)
    console.log("Show text input");
  }
});