class AppendNode {
  constructor() {
    this.initEventListeners();
  }

  initEventListeners() {
    // Refactor later
    // window.addEventListener(Event.APPEND_NODE, (e) => {
    // });

    window.addEventListener(Event.REMOVE_FOLD_DESCENDANTS, (e) => {
      this.removeFoldDescendants(e.detail.node);
    });
  }

  removeFoldDescendants(node) {
    let data = node.data;
    if (data.foldDescendants) {
      data.foldDescendants = undefined;
      Event.dispatch(Event.FOLD_DESCENDANTS, {
        clickedNodeData: node,
        init: true
      });
    }
  }
}