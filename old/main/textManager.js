class TextManager {

  constructor() {
    this.lastNodeId = 0;
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener(Event.GET_LAST_NODE_ID, (e) => {
      this.lastNodeId = parseInt(e.detail.lastNodeId);
    });
    window.addEventListener(Event.UPDATE_TREE_AFTER, (e) => {
      this.updatePointerEventAndClickListeners();
    });
    window.addEventListener(Event.ON_DRAG_UPDATE_ONCE, (e) => {
      this.handleClickEvent(e.detail.selectedData);
    });
    window.addEventListener(Event.DELETE_NODE, (e) => {
      this.deleteNode();
    });
    window.addEventListener(Event.PROCESS_TEXT_INPUT, (e) => {
      if (this.selectedData == undefined) {
        return;
      }
      this.processTextInput();
    });
    window.addEventListener(Event.CREATE_CHILD_NODE, (e) => {
      Event.dispatch(Event.REMOVE_FOLD_DESCENDANTS, {node: this.selectedData});
      if (this.selectedData == undefined) {
        return;
      }
      this.createTextInput();
      this.state = State.CREATE_CHILD_NODE;
    });
    window.addEventListener(Event.ON_DRAG, (e) => {
      this.cancelTextInputProcess();
    })
    window.addEventListener(Event.DELETE_NODE_DATA, (e) => {
      this.deleteNodeData(e.detail.nodeData);
    });
    window.addEventListener(Event.FOLD_ANCESTORS_ROOT, (e) => {
      this.ancestorsRoot = e.detail.root;
    });
    window.addEventListener(Event.REPLACE_ROOT, (e) => {
      this.ancestorsRoot = e.detail.root;
    });
    window.addEventListener(Event.REPLACE_DATA, (e) => {
      this.replaceData(e.detail.node, e.detail.data);
      e.detail.data.selected = true;
      this.updateTextHighlight();
      Event.dispatch(Event.UPDATE_TREE, {
        // root: e.detail.node,
        source: e.detail.node
      });
    });

  }

  processTextInput() {
    let t = jQuery(`#text-input`);
    if (t.length > 0) {
      switch (this.state) {
        case State.EDIT_NODE:
          this.onTextEdit();
          Event.dispatch(Event.EDIT_DATA, {node: this.selectedData});
          break;
        case State.CREATE_CHILD_NODE:
          this.onCreateNewChild(this.selectedData, t.val());
          break;
        default:
          break;
      }
      t.remove();
      Event.dispatch(Event.UPDATE_TREE, {
        root: this.ancestorsRoot,
        source: this.selectedData
      });
    }
  }

  handleClickEvent(d) {
    d3.selectAll(".text-wrap")
    .each(function(d) {
      d.data.selected = undefined;
    });

    this.selectedData = d;
    d.data.selected = true;
    this.updateTextHighlight();
    Event.dispatch(Event.SHOW_NODE_MENU, {});
  }

  updateTextHighlight() {
    let tm = this;
    d3.selectAll(".text-wrap")
    .style("font-weight", function(d) {
      if (d.data.selected) {
        tm.selectedData = d;
        Event.dispatch(Event.SELECTED_NODE, {node: d});
        return "800";
      }
        
      return "initial";
    })
    .style("font-size", function(d) {
      if (d.data.selected) {
        tm.selectedData = d;
        return "11px";
      }
      return "10px";
    });

    this.cancelTextInputProcess();
  }

  onOpenTextEdit(d) {
    // this.selectedData = d;

    this.deleteTextInputUI();
    this.createTextInput(this.selectedData.data.text);
    this.state = State.EDIT_NODE;
  }

  cancelTextInputProcess() {
    this.state = undefined;
    this.deleteTextInputUI();
  }

  deleteTextInputUI() {
    let t = jQuery(`#text-input`)
    if (t.length > 0) {
      t.remove();
    }
  }

  createTextInput(name) {
    if (name == undefined)
      name = "";
    jQuery(`#tree-container`).prepend(`
      <textarea type="text" id="text-input" autofocus="autofocus">${name}</textarea>
    `);
    jQuery('#text-input').focus();
  }

  onTextEdit() {
    let text = jQuery('#text-input').val();
    this.selectedData.data.text = text;
  }

  onNodeSelected(d) {
    this.selectedData = d;
  }

  deleteNode() {
    if (this.selectedData == undefined)
      return;

    this.deleteNodeData(this.selectedData);
    this.selectedData.data.selected = undefined;
    this.selectedData.parent.data.selected = true;
    Event.dispatch(Event.UPDATE_TREE, {
      root: this.ancestorsRoot,
      source: this.selectedData
    });
  }

  deleteNodeData(nodeData) {
    let p = nodeData.parent;
    if (p == undefined)
      return;

    let c = p.children;
    if (c == undefined)
      return;
    let cd = p.data.children;
    for (let i = 0; i < c.length; i++) {
      if (c[i].id == nodeData.id) {
        c.splice(i, 1);
        cd.splice(i, 1);
        break;
      }
    }
    if (c.length == 0) {
      p.children = undefined;
      p.data.children = undefined;
    }
  }

  onCreateNewChild(parent, text) {
    let nodeId = ++this.lastNodeId;
    Event.dispatch(Event.SET_LAST_NODE_ID, {lastNodeId: nodeId});
    let data = {
      id: nodeId,
      text: text,
    }
    let node = d3.hierarchy(data, function(d) {
      return d.children; 
    });
    node.parent = parent;
    node.depth = parent.depth + 1;
    node.id = nodeId;

    if (parent.children == undefined) {
      parent.children = [node];
    } else {
      parent.children.push(node);
    }

    if (parent.data.children == undefined)
      parent.data.children = [];
    parent.data.children.push(data);
    Event.dispatch(Event.ADD_DATA, {node: node});
    Event.dispatch(Event.EDIT_DATA, {node: node.parent});

    
  }

  replaceData(parent, data) {
    this.appendData(parent, data);
  }

  appendData(selectedNode, data) {
    let newNode = d3.hierarchy(data, function(d) {
      return d.children; 
    });

    if (selectedNode.parent == undefined) {
      Event.dispatch(Event.REPLACE_ROOT, {root: newNode});
    } else {
      replaceNodeInParent(selectedNode, newNode);
    }

    function replaceNodeInParent(selectedNode, newNode) {
      let p = selectedNode.parent;
      newNode.parent = p;

      // let i = p.children.indexOf(selectedNode);
      let i = getNodeSelectedIndex(p.children, selectedNode.data.id);
      if (i == -1) {
        console.log("Selected Node ID is " + i);
      }
      p.children[i] = newNode;
      p.data.children[i] = newNode.data;
      setDepth(newNode);

      function setDepth(node) {
        node.depth = node.parent.depth + 1;
        if (node.children && node.children.length > 0) {
          for(let i = 0; i < node.children.length; i++) {
            setDepth(node.children[i]);
          }
        }
      }

      function getNodeSelectedIndex(childrenNode, id) {
        let index = -1;
        childrenNode.forEach((child, i) => {
          if (child.data.id == id)
            index = i;
        });
        return index;
      }
    }
  }

  updatePointerEventAndClickListeners() {
    d3.selectAll(".text-wrap")
      .style("pointer-events", "none");

    d3.selectAll("g.node")
      .on("click", (d) => {
        this.handleClickEvent(d);
      });
    this.updateTextHighlight();
  }

  

}