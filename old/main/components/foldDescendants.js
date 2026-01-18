class FoldDescendants {

  constructor() {
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener(Event.UPDATE_TREE_AFTER, (e) => {
      this.initCircle();
      Event.dispatch(Event.FOLD_DESCENDANTS, {init: true});
      Event.dispatch(Event.UPDATE_TREE, {
        source: this.selectedNode,
        dispatchAfter: false
      });
    });
    window.addEventListener(Event.SELECTED_NODE, (e) => {
      this.selectedNode = e.detail.node;
    });
    window.addEventListener(Event.MAIN_ROOT, (e) => {
      this.root = e.detail.root;
    });
    window.addEventListener(Event.FOLD_ANCESTORS_ROOT, (e) => {
      this.ancestorsRoot = e.detail.root;
    });
    window.addEventListener(Event.FOLD_DESCENDANTS, (e) => {
      d3.selectAll('g.node')
      .each(function(d) {
        if (d.data.foldDescendants) {
          if (d.children == undefined) {
            return;
          }
          d._children = d.children;
          d.children = null;
        } else {
          if (d._children != undefined) {
            d.children = d._children;
            d._children = null;
          }
        }
      });

      if (e.detail.init) {

      } else {
        let source = e.detail.clickedNodeData;
      
        Event.dispatch(Event.EDIT_DATA, {node: source});
        if (e.detail.init == undefined) {
          Event.dispatch(Event.UPDATE_TREE, {
            source: source
          });
        }
      }

      
      
    });
    window.addEventListener(Event.REPLACE_ROOT, (e) => {
      this.ancestorsRoot = e.detail.root;
    });
  }

  initCircle() {
    d3.selectAll("circle.node")
    .on("click", (d) => {
      let c = d.data.children;
      if (c == undefined || c.length == 0)
        return;
      d.data.foldDescendants = d.data.foldDescendants ? undefined: true;
      Event.dispatch(Event.FOLD_DESCENDANTS, {clickedNodeData: d});
    });
  }
}