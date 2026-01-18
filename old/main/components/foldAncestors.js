class FoldAncentors {
  constructor() {
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener(Event.SELECTED_NODE, (e) => {
      this.selectedNode = e.detail.node;
    });
    window.addEventListener(Event.MAIN_ROOT, (e) => {
      this.root = e.detail.root;
    }); 
    window.addEventListener(Event.FOLD_ANCESTORS_VIEW, (e) => {
      let root = d3.hierarchy(e.detail.data, function(d) {
        return d.children; 
      });
      
      let source = getSource(root, e.detail.sourceId);
      Event.dispatch(Event.REPLACE_ROOT, {
        source: source,
        root: root
      });

      function getSource(node, sourceId) {
        let id = node.data.id;
        if (id == sourceId) {
          return node;
        } else {
          let c = node.children;
          if (c != undefined && c.length > 0) {
            for (let i = 0; i < c.length; ++i) {
              return getSource(c[i], sourceId);
            }
          }
        }
      }
    });
  }
}