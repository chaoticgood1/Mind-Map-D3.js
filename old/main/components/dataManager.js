class DataManager {
  constructor() {
    this.initEventListeners();
  }

  initEventListeners() {
    this.initLoadJsonFileSuccessful();
    this.initGetNodeRevisions();
    this.initChangeNodeRevision();
    this.initAddRevision();
    this.initAddData();
    this.initEditData();
    this.initChangeParent();
    
    this.initFoldAncestors();
    this.initSelectedData();
    this.initNodeChangeBreadth();
    this.createMainNode();
  }

  initLoadJsonFileSuccessful() {
    window.addEventListener(Event.LOAD_JSON_FILE_SUCCESSFUL, (e) => {
      this.json = e.detail.json;
      let data = this.getConvertedD3JsonFormat(e.detail.json);
      let lastNodeId = Object.keys(this.json.nodes).length - 1;
      Event.dispatch(Event.GET_LAST_NODE_ID, {lastNodeId: lastNodeId});
      Event.dispatch(Event.LOAD_DATA_SUCCESSFUL, { data: data });
    });
  }

  initGetNodeRevisions() {
    window.addEventListener(Event.GET_NODE_REVISIONS, (e) => {
      let rm = this.getRevisionsMeta(e.detail.id);
      Event.dispatch(Event.SELECTED_NODE_REVISIONS, { revisionsMeta: rm });
    });
  }

  initChangeNodeRevision() {
    window.addEventListener(Event.CHANGE_NODE_VERSION, (e) => {
      let id = e.detail.node.data.id;
      let rv = this.getRevisionsMeta(id);
      if (rv.active == e.detail.versionName) {
        console.log("Already selected " + rv.active);
        return;
      }
      rv.active = e.detail.versionName;
      let data = this.getData(id, true);
      Event.dispatch(Event.REPLACE_DATA, {
        node: e.detail.node,
        data: data
      });
    });
  }

  initAddRevision() {
    window.addEventListener(Event.ADD_REVISION, (e) => {
      let revName = this.addRevision(e.detail.node);
      Event.dispatch(Event.CHANGE_NODE_VERSION, {
        node: e.detail.node,
        versionName: revName
      });
    });
  }

  initAddData() {
    window.addEventListener(Event.ADD_DATA, (e) => {
      let node = e.detail.node;
      let data = node.data;
      data.parentId = node.parent.data.id;

      this.json.meta[data.id] = createRevisionsMeta(node.parent.data.id);
      this.json.nodes[data.id] = { "text": data.text };

      function createRevisionsMeta(parentId) {
        return {
          active: "default",
          revisions: {
            default: {
              parentId: parentId
            }
          }
        }
      }
    });
  }

  initEditData() {
    window.addEventListener(Event.EDIT_DATA, (e) => {
      this.editData(e.detail.node);
    });
  }

  initChangeParent() {
    window.addEventListener(Event.APPEND_NODE, (e) => {
      let pData = e.detail.parent.data;
      let cData = e.detail.child.data;
      let newParentRev = this.getActiveRevision(pData.id);

      if (newParentRev.children == undefined)
        newParentRev.children = [];
      newParentRev.children.push(cData.id);

      let childRevision = this.getActiveRevision(cData.id);
      if (childRevision.parentId == pData.id) {
        throw new Error(`${pData.id} Already set as a parent, please check for error`);
      }
      let currentParentRev = this.getActiveRevision(childRevision.parentId);
      let index = currentParentRev.children.indexOf(cData.id);
      currentParentRev.children.splice(index, 1);

      childRevision.parentId = pData.id;
      let d3Data = this.getData(this.json.meta.mainId, true);
      let root = d3.hierarchy(d3Data, function(d) {
        return d.children;
      });
      Event.dispatch(Event.REPLACE_ROOT, {root: root});

      // Only update certain part
      // But we don't know where did they attached or removed the node
      // It can be anywhere so everything must be updated
    });
  }

  initFoldAncestors() {
    window.addEventListener(Event.FOLD_ANCESTORS, (e) => {
      //NOTE: Should be toggle fold/unfold
      if (this.selectedNode == undefined) {
        console.log("Selected Data is undefined");
        return;
      }
      let id = this.selectedNode.data.id;
      
      let rev = this.getActiveRevision(id);
      rev.foldAncestors = (rev.foldAncestors) ? undefined: true;
      
      let d3Data = undefined;
      if (rev.foldAncestors) {
        d3Data = this.getData(id);
      } else {
        let nId = this.searchUpToGetNodeWithFoldAncestorOrMainId(id);
        d3Data = this.getData(nId);
      }
      d3Data.selected = true;
      Event.dispatch(Event.FOLD_ANCESTORS_VIEW, {
        data: d3Data,
        sourceId: id
      });
    });
  }

  searchUpToGetNodeWithFoldAncestorOrMainId(id) {
    let rev = this.getActiveRevision(id);
    if (rev.foldAncestors) {
      return id;
    }

    if (rev.parentId != undefined) {
      return this.searchUpToGetNodeWithFoldAncestorOrMainId(rev.parentId);
    } else {
      return id;
    }
  }

  initSelectedData() {
    window.addEventListener(Event.SELECTED_NODE, (e) => {
      this.selectedNode = e.detail.node;
    });
  }

  initNodeChangeBreadth() {
    window.addEventListener(Event.NODE_CHANGE_BREADTH_INDEX, (e) => {
      let parentRev = this.getActiveRevision(e.detail.nodeToMove.data.parentId);
      data(e, parentRev);
      graphics(e);
      Event.dispatch(Event.UPDATE_TREE, {source: e.detail.nodeToMove.parent});

      function data(e, parentRev) {
        let a = e.detail.nodeToMove;
        let b = e.detail.nodeBasis;
        let p = e.detail.nodeToMove.parent;

        let idToMove = a.data.id;
        let idBasis = b.data.id;

        let indexToMove = parentRev.children.indexOf(idToMove);
        parentRev.children.splice(indexToMove, 1);

        let indexBasis = parentRev.children.indexOf(idBasis);
        parentRev.children.splice(indexBasis + 1, 0, idToMove);
      }

      function graphics(e) {
        let a = e.detail.nodeToMove;
        let b = e.detail.nodeBasis;
        let p = e.detail.nodeToMove.parent;
        
        let indexToMove = getIndex(p.children, a);
        p.children.splice(indexToMove, 1);

        let indexBasis = getIndex(p.children, b);
        p.children.splice(indexBasis + 1, 0, a);
      }

      function getIndex(children, child) {
        for (let i = 0; i < children.length; ++i) {
          if (children[i].data.id == child.data.id)
            return i;
        }
        return -1;
      }
    });
  }




  createMainNode() {
    let jsonString = `
    {
      "nodes": {
        "0": {
          "text": "Main"
        },
        "1": {
          "text": "1"
        },
        "2": {
          "text": "2"
        },
        "3": {
          "text": "3"
        },
        "4": {
          "text": "4"
        },
        "5": {
          "text": "5"
        },
        "6": {
          "text": "6"
        },
        "7": {
          "text": "7"
        },
        "8": {
          "text": "8"
        },
        "9": {
          "text": "9"
        },
        "10": {
          "text": "10"
        }
      },
      "meta": {
        "mainId": 0,
        "0": {
          "active": "default",
          "revisions": {
            "default": {
              "children": [1, 2, 3]
            },
            "default1": {
              "children": [4, 5]
            }
          }
        },
        "1": {
          "active": "default",
          "revisions": {
            "default": {
              "parentId": 0, 
              "children": [6, 7],
              "foldDescendants": true
            }
          }
        },
        "2": {
          "active": "default",
          "revisions": {
            "default": {
              "parentId": 0
            }
          }
        },
        "3": {
          "active": "default",
          "revisions": {
            "default": {
              "parentId": 0
            }
          }
        },
        "4": {
          "active": "default",
          "revisions": {
            "default": {
              "parentId": 0,
              "children": [8, 9, 10],
              "foldAncestors": true
            }
          }
        },
        "5": {
          "active": "default",
          "revisions": {
            "default": {
              "parentId": 0
            }
          }
        },
        "6": {
          "active": "default",
          "revisions": {
            "default": {
              "parentId": 1
            }
          }
        },
        "7": {
          "active": "default",
          "revisions": {
            "default": {
              "parentId": 1
            }
          }
        },
        "8": {
          "active": "default",
          "revisions": {
            "default": {
              "parentId": 4
            }
          }
        },
        "9": {
          "active": "default",
          "revisions": {
            "default": {
              "parentId": 4
            }
          }
        },
        "10": {
          "active": "default",
          "revisions": {
            "default": {
              "parentId": 4
            }
          }
        }
      }
    }
    `;
    jsonString = `
    {
      "nodes": {
        "0": {
          "text": "Main"
        }
      },
      "meta": {
        "mainId": 0,
        "0": {
          "active": "default",
          "revisions": {
            "default": {
            }
          }
        }
      }
    }
    `;
    Event.dispatch(Event.LOAD_JSON_FILE_SUCCESSFUL, { json: JSON.parse(jsonString) });
  }

  getConvertedD3JsonFormat(json) {
    let mainId = json.meta.mainId;
    let mData = undefined;
    // MainId or the deepest node with foldAncestors attribute;
    let data = this.getData(mainId, true);
    if (mData != undefined) {
      return mData;
    }
    return data;
  }

  getData(id, trackDuplicateParents = false) {
    if (trackDuplicateParents) {
      this.parentIds = [];
    }

    let index = this.parentIds.indexOf(id);
    if (index != -1) {
      throw new Error("Called twice at index : " + index + " id: " + id);
    }

    this.parentIds.push(id);
    let nodes = this.json.nodes;
    let ar = this.getActiveRevision(id);
    let data = {
      id: id,
      parentId: ar.parentId,
      text: nodes[id].text,
      foldAncestors: ar.foldDescendants,
      foldDescendants: ar.foldDescendants
    }
    data.children = this.getChildren(id);
    return data;
  }

  getChildren(id) {
    let children = [];
    let ar = this.getActiveRevision(id);
    if (ar.children && ar.children.length > 0) {
      ar.children.forEach((childId) => {
        children.push(this.getData(childId));
      });
    }
    return children;
  }

  getRevisionsMeta(id) {
    let meta = this.json.meta;
    return meta[id];
  }

  getActiveRevision(id) {
    let rm = this.getRevisionsMeta(id);
    if (rm == undefined)
      console.log("Active revision is undefined " + id);
    return rm.revisions[rm.active];
  }

  editData(node) {
    let data = node.data;

    let id = data.id;
    let nodes = this.json.nodes;

    if (nodes[id] == undefined) {
      nodes[id] = {
        text: data.text
      };
    } else {
      nodes[id].text = data.text;
    }

    let rev = this.getActiveRevision(id);
    rev.children = [];
    rev.selected = data.selected;
    rev.foldAncestors = data.foldAncestors;
    rev.foldDescendants = data.foldDescendants;

    if (data.children == undefined) {

    } else {
      for (let i = 0; i < data.children.length; i++) {
        let e = data.children[i];
        let id = e.id;
        rev.children.push(id);

        if (nodes[id] == undefined) {
          nodes.push(e.text);
        }
      };
    }


    let p = node.parent;
    if (p != undefined) {
      let pRev = this.getActiveRevision(p.data.id);

      let cn = p.data.children;
      pRev.children = [];
      for (let i = 0; i < cn.length; i++) {
        pRev.children.push(cn[i].id);
      }
    }
  }

  addRevision(node) {
    let gm = this.getRevisionsMeta(node.data.id);
    let revisionName = "default" + (Object.keys(gm.revisions).length);
    gm.revisions[revisionName] = { };
    return revisionName;
  }

  getUniqueName() {
    Math.random().toString(36).substring(7);
  }

  getUniqueId() {
    // Based on the highest number assigned so far
  }
}